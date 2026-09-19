"""Rotas dedicadas para busca e mineração dinâmica de vagas."""

import logging
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.services import buscador, matcher

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/vagas", tags=["vagas"])


class BuscarVagasRequest(BaseModel):
    termo: str = Field(..., min_length=2, max_length=200, description="Palavra-chave ou área de busca")
    localizacao: Optional[str] = Field(None, max_length=150, description="Cidade ou estado de preferência")
    dados_curriculo: Optional[dict] = Field(None, description="Dados estruturados do currículo para cálculo de score")


@router.post("/buscar")
def buscar_vagas_mercado(payload: BuscarVagasRequest):
    """
    Busca vagas em tempo real no mercado (Jooble/Adzuna com cache LRU/TTL)
    e calcula a aderência percentual com o currículo do candidato, permitindo
    pivotar para qualquer área (ex: estudante de Redes buscando Dev).
    """
    termo_limpo = payload.termo.strip()
    if not termo_limpo:
        raise HTTPException(status_code=400, detail="O termo de busca não pode ser vazio.")

    # Se o termo não contiver prefixo de senioridade/estágio, normaliza para estágio se for estudante
    termo_efetivo = termo_limpo
    if not any(palavra in termo_limpo.lower() for palavra in ["estagio", "estágio", "junior", "júnior", "trainee"]):
        termo_efetivo = f"estágio {termo_limpo}"

    try:
        vagas = buscador.buscar_vagas(termo=termo_efetivo, localizacao=payload.localizacao)
    except Exception as erro:
        logger.error(f"[vagas] Erro na busca externa de vagas: {erro}")
        vagas = []

    # Se tiver perfil do currículo anexado, calcula compatibilidade em lote
    if vagas and payload.dados_curriculo:
        try:
            vagas = matcher.calcular_compatibilidade_lote(payload.dados_curriculo, vagas)
        except Exception as erro:
            logger.warning(f"[vagas] Falha ao calcular compatibilidade em lote: {erro}")
            for v in vagas:
                v.setdefault("score", 50)
                v.setdefault("explicacao_score", "Compatibilidade estimada para início de carreira.")

    vagas.sort(key=lambda v: v.get("score", 0), reverse=True)

    return {
        "termo_pesquisado": termo_efetivo,
        "localizacao": payload.localizacao,
        "total_encontradas": len(vagas),
        "vagas": vagas,
    }
