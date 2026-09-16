"""Rotas de análise de currículo."""

import logging
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.config import TAMANHO_MAXIMO_MB
from app.database import get_db
from app.models.analise import Analise
from app.services import curriculo, ia, avaliador, buscador, matcher

logger = logging.getLogger(__name__)
router = APIRouter()


class SugestaoRequest(BaseModel):
    dados_curriculo: dict
    vaga: dict


@router.post("/curriculo")
async def enviar_curriculo(
    arquivo: UploadFile,
    db: Session = Depends(get_db)
):
    """Recebe um PDF de currículo, analisa com IA e busca vagas compatíveis."""

    # 1. Validar tipo MIME informado no cabeçalho
    if arquivo.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Envie um arquivo em PDF. Formato recebido: " + str(arquivo.content_type),
        )

    # 2. Leitura em chunks com limite estrito de memória para proteção contra DoS
    limite_bytes = TAMANHO_MAXIMO_MB * 1024 * 1024
    chunks = []
    tamanho_total = 0

    while True:
        chunk = await arquivo.read(64 * 1024)
        if not chunk:
            break
        tamanho_total += len(chunk)
        if tamanho_total > limite_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"Arquivo muito grande. O limite máximo permitido é de {TAMANHO_MAXIMO_MB}MB.",
            )
        chunks.append(chunk)

    conteudo = b"".join(chunks)

    # 3. Validar assinatura binária do arquivo (Magic Numbers %PDF-)
    if not conteudo.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="O arquivo enviado não é um documento PDF válido (cabeçalho de arquivo inválido).",
        )

    # 4. Extrair texto de forma protegida
    try:
        texto = curriculo.extrair_texto_pdf(conteudo)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Não conseguimos ler esse PDF. Ele pode estar corrompido ou protegido por senha.",
        )

    if not texto or len(texto.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Não encontramos texto suficiente nesse PDF. Ele pode ser uma imagem escaneada.",
        )

    # Analisar com IA
    try:
        dados_estruturados = ia.analisar_curriculo(texto)
    except Exception as erro:
        logger.error(f"Erro na análise do currículo: {erro}")
        raise HTTPException(
            status_code=502,
            detail="A IA não respondeu corretamente. Tente novamente.",
        )

    # Avaliar currículo
    try:
        avaliacao = avaliador.avaliar_curriculo(texto)
    except Exception as erro:
        logger.warning(f"Erro na avaliação: {erro}")
        avaliacao = {
            "nota_geral": 0,
            "pontos_fortes": [],
            "pontos_melhoria": [],
            "comentario_geral": "Não foi possível gerar a avaliação dessa vez.",
        }

    # Buscar vagas
    try:
        vagas_encontradas = buscador.buscar_vagas_do_curriculo(dados_estruturados)
    except Exception as erro:
        logger.warning(f"Erro na busca de vagas: {erro}")
        vagas_encontradas = []

    # Calcular compatibilidade em LOTE (1 única chamada rápida ao invés de loop N+1)
    if vagas_encontradas:
        try:
            vagas_encontradas = matcher.calcular_compatibilidade_lote(dados_estruturados, vagas_encontradas)
        except Exception as erro:
            logger.warning(f"Erro no matching em lote: {erro}")
            for vaga in vagas_encontradas:
                vaga["score"] = 50
                vaga["explicacao_score"] = "Compatibilidade estimada para estágio."

    vagas_encontradas.sort(key=lambda v: v.get("score", 0), reverse=True)

    # Salvar no banco
    try:
        analise = Analise(
            texto_curriculo=texto,
            nota_geral=avaliacao.get("nota_geral", 0),
        )
        analise.dados_curriculo = dados_estruturados
        analise.avaliacao = avaliacao
        analise.vagas = vagas_encontradas
        db.add(analise)
        db.commit()
        db.refresh(analise)
        analise_id = analise.id
        logger.info(f"Análise #{analise_id} salva no banco")
    except Exception as erro:
        logger.warning(f"Erro ao salvar no banco: {erro}")
        db.rollback()
        analise_id = None

    return {
        "id": analise_id,
        "dados_curriculo": dados_estruturados,
        "avaliacao": avaliacao,
        "vagas_encontradas": vagas_encontradas,
    }


@router.post("/sugestao-vaga")
async def gerar_sugestao(dados: SugestaoRequest):
    """Gera sugestões de como melhorar o currículo para uma vaga."""
    from app.services import sugestoes

    try:
        resultado = sugestoes.sugerir_melhorias(dados.dados_curriculo, dados.vaga)
    except Exception as erro:
        logger.error(f"Erro na sugestão: {erro}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível gerar sugestões agora. Tente novamente.",
        )

    return resultado
