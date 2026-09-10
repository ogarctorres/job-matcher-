"""Rotas de tendências de mercado."""

import logging
from typing import Optional
from fastapi import APIRouter, Query

from app.services.tendencias import analisar_tendencias_vagas

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tendencias", tags=["Tendências"])


@router.get("/")
def obter_tendencias(
    termo: str = Query("estagio ti", description="Palavra-chave para busca no mercado"),
    localizacao: Optional[str] = Query(None, description="Cidade ou região")
):
    """Retorna análise de skills mais exigidas nas vagas atuais."""
    return analisar_tendencias_vagas(termo=termo, localizacao=localizacao)
