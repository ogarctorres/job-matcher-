"""Rotas de histórico de análises protegidas por usuário."""

import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.database import get_db
from app.models.analise import Analise
from app.core.seguranca import obter_usuario_atual

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/historico", tags=["Histórico"])


@router.get("/")
def listar_historico(
    db: Session = Depends(get_db),
    usuario: dict = Depends(obter_usuario_atual)
):
    """Lista apenas as análises passadas pertencentes ao usuário autenticado (e legadas)."""
    analises = (
        db.query(Analise)
        .filter(or_(Analise.user_id == usuario["id"], Analise.user_id.is_(None)))
        .order_by(desc(Analise.criado_em))
        .all()
    )
    return [a.to_resumo() for a in analises]


@router.get("/{analise_id}")
def detalhe_analise(
    analise_id: int,
    db: Session = Depends(get_db),
    usuario: dict = Depends(obter_usuario_atual)
):
    """Retorna os detalhes completos de uma análise do usuário autenticado."""
    analise = (
        db.query(Analise)
        .filter(
            Analise.id == analise_id,
            or_(Analise.user_id == usuario["id"], Analise.user_id.is_(None))
        )
        .first()
    )

    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada ou não autorizada.")

    return analise.to_dict()


@router.delete("/{analise_id}")
def deletar_analise(
    analise_id: int,
    db: Session = Depends(get_db),
    usuario: dict = Depends(obter_usuario_atual)
):
    """Deleta uma análise do histórico pertencente ao usuário autenticado."""
    analise = (
        db.query(Analise)
        .filter(
            Analise.id == analise_id,
            or_(Analise.user_id == usuario["id"], Analise.user_id.is_(None))
        )
        .first()
    )

    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada ou não autorizada.")

    db.delete(analise)
    db.commit()
    logger.info(f"Análise #{analise_id} deletada pelo usuário {usuario['id']}")

    return {"mensagem": f"Análise #{analise_id} deletada com sucesso."}

