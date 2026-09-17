"""Rotas para adaptação e otimização de currículo por vaga com IA e persistência no banco."""

import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.analise import CurriculoAdaptado, Analise
from app.services.otimizador import adaptar_curriculo, gerar_curriculo_generico

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Adaptação de Currículo"])


class AdaptarCurriculoRequest(BaseModel):
    analise_id: Optional[int] = Field(default=None, description="ID da análise base vinculada")
    texto_curriculo: Optional[str] = Field(default="", max_length=25000, description="Texto do currículo original")
    dados_curriculo: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Dados estruturados do currículo")
    descricao_vaga: Optional[str] = Field(default="", max_length=25000, description="Descrição e requisitos da vaga alvo")
    titulo_vaga: Optional[str] = Field(default="", max_length=500, description="Título da vaga alvo")
    modo_generico: Optional[bool] = Field(default=False, description="Forçar modo genérico ATS se True")


class CurriculoGenericoRequest(BaseModel):
    analise_id: Optional[int] = Field(default=None, description="ID da análise base vinculada")
    texto_curriculo: Optional[str] = Field(default="", max_length=25000, description="Texto do currículo original")
    dados_curriculo: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Dados estruturados do currículo")


def _salvar_adaptacao_no_banco(db: Session, resultado: dict, analise_id: Optional[int], titulo_fallback: str) -> Optional[CurriculoAdaptado]:
    """Helper seguro para salvar a versão adaptada no banco sem derrubar a resposta em caso de falha."""
    try:
        adaptacao = CurriculoAdaptado(
            analise_id=analise_id,
            titulo_vaga=resultado.get("titulo_vaga_alvo") or titulo_fallback,
            modo=resultado.get("modo") or "otimizado_para_vaga",
            score_compatibilidade=resultado.get("score_compatibilidade") or 0,
        )
        adaptacao.resultado = resultado
        db.add(adaptacao)
        db.commit()
        db.refresh(adaptacao)
        return adaptacao
    except Exception as erro_banco:
        logger.warning(f"Não foi possível persistir o currículo adaptado no banco: {erro_banco}")
        db.rollback()
        return None


@router.post("/adaptar-curriculo")
async def adaptar_curriculo_endpoint(payload: AdaptarCurriculoRequest, db: Session = Depends(get_db)):
    """
    Reescreve o currículo do candidato e persiste a versão gerada no histórico SQLite.
    - Se houver descrição de vaga: executa MODO 2 (Job Matching Estratégico com detecção de gaps e requisitos).
    - Se modo_generico for True: executa MODO 1 (Currículo Genérico ATS).
    """
    if not payload.modo_generico and not (payload.descricao_vaga and payload.descricao_vaga.strip()):
        raise HTTPException(status_code=400, detail="A descrição da vaga é obrigatória.")

    if not payload.texto_curriculo and not payload.dados_curriculo:
        raise HTTPException(status_code=400, detail="Forneça o texto ou os dados do currículo.")

    try:
        resultado = adaptar_curriculo(
            texto_curriculo=payload.texto_curriculo or "",
            dados_curriculo=payload.dados_curriculo or {},
            descricao_vaga=payload.descricao_vaga if not payload.modo_generico else "",
            titulo_vaga=payload.titulo_vaga or "Vaga de Tecnologia",
        )

        # Persistência no SQLite
        salvo = _salvar_adaptacao_no_banco(
            db=db,
            resultado=resultado,
            analise_id=payload.analise_id,
            titulo_fallback=payload.titulo_vaga or "Vaga Alvo",
        )
        if salvo:
            resultado["id"] = salvo.id
            resultado["analise_id"] = salvo.analise_id
            resultado["criado_em"] = salvo.criado_em.isoformat() if salvo.criado_em else None

        return resultado
    except Exception as erro:
        logger.error(f"Erro ao adaptar currículo: {erro}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível otimizar o currículo no momento. Tente novamente.",
        )


@router.post("/gerar-curriculo-generico")
async def gerar_curriculo_generico_endpoint(payload: CurriculoGenericoRequest, db: Session = Depends(get_db)):
    """
    MODO 1: Gera um currículo profissional, ATS-friendly sem foco em uma vaga específica e persiste no SQLite.
    """
    if not payload.texto_curriculo and not payload.dados_curriculo:
        raise HTTPException(status_code=400, detail="Forneça o texto ou os dados do currículo.")

    try:
        resultado = gerar_curriculo_generico(
            texto_curriculo=payload.texto_curriculo or "",
            dados_curriculo=payload.dados_curriculo or {},
        )

        salvo = _salvar_adaptacao_no_banco(
            db=db,
            resultado=resultado,
            analise_id=payload.analise_id,
            titulo_fallback="Perfil Geral de Tecnologia",
        )
        if salvo:
            resultado["id"] = salvo.id
            resultado["analise_id"] = salvo.analise_id
            resultado["criado_em"] = salvo.criado_em.isoformat() if salvo.criado_em else None

        return resultado
    except Exception as erro:
        logger.error(f"Erro ao gerar currículo genérico: {erro}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível gerar o currículo genérico no momento. Tente novamente.",
        )


@router.get("/adaptar-curriculo/historico/{analise_id}")
def listar_historico_adaptacoes(analise_id: int, db: Session = Depends(get_db)):
    """Retorna todas as adaptações realizadas vinculadas a uma análise de currículo."""
    itens = (
        db.query(CurriculoAdaptado)
        .filter(CurriculoAdaptado.analise_id == analise_id)
        .order_by(CurriculoAdaptado.criado_em.desc())
        .all()
    )
    return [item.to_dict() for item in itens]


@router.get("/adaptar-curriculo/{adaptacao_id}")
def obter_adaptacao(adaptacao_id: int, db: Session = Depends(get_db)):
    """Retorna uma versão específica de currículo adaptado."""
    adaptacao = db.query(CurriculoAdaptado).filter(CurriculoAdaptado.id == adaptacao_id).first()
    if not adaptacao:
        raise HTTPException(status_code=404, detail="Currículo adaptado não encontrado.")
    return adaptacao.to_dict()


@router.delete("/adaptar-curriculo/{adaptacao_id}")
def deletar_adaptacao(adaptacao_id: int, db: Session = Depends(get_db)):
    """Deleta uma versão específica de currículo adaptado."""
    adaptacao = db.query(CurriculoAdaptado).filter(CurriculoAdaptado.id == adaptacao_id).first()
    if not adaptacao:
        raise HTTPException(status_code=404, detail="Currículo adaptado não encontrado.")
    db.delete(adaptacao)
    db.commit()
    return {"mensagem": f"Currículo adaptado #{adaptacao_id} removido com sucesso."}
