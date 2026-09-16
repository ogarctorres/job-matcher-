"""Rotas de histórico de análises."""

import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.analise import Analise

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/historico", tags=["Histórico"])


@router.get("/")
def listar_historico(db: Session = Depends(get_db)):
    """Lista todas as análises passadas, da mais recente para a mais antiga."""
    analises = db.query(Analise).order_by(desc(Analise.criado_em)).all()
    return [a.to_resumo() for a in analises]


@router.get("/{analise_id}")
def detalhe_analise(analise_id: int, db: Session = Depends(get_db)):
    """Retorna os detalhes completos de uma análise."""
    analise = db.query(Analise).filter(Analise.id == analise_id).first()

    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada.")

    return analise.to_dict()


@router.delete("/{analise_id}")
def deletar_analise(analise_id: int, db: Session = Depends(get_db)):
    """Deleta uma análise do histórico."""
    analise = db.query(Analise).filter(Analise.id == analise_id).first()

    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada.")

    db.delete(analise)
    db.commit()
    logger.info(f"Análise #{analise_id} deletada")

    return {"mensagem": f"Análise #{analise_id} deletada com sucesso."}

