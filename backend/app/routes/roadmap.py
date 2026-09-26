"""Rotas do módulo de Roadmap de Estudos de 30 Dias e Skill Gap."""

import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends

from app.services.roadmap import analisar_gap_e_gerar_plano, TRILHAS_PADRAO_ROADMAP
from app.core.seguranca import obter_usuario_opcional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


class GerarRoadmapRequest(BaseModel):
    skills_candidato: List[str] = Field(default_factory=list, description="Lista de habilidades do candidato")
    cargo_alvo: Optional[str] = Field(None, max_length=200, description="Cargo ou área almejada")
    vaga_alvo: Optional[Dict[str, Any]] = Field(None, description="Dados da vaga de referência")


@router.get("/trilhas")
def listar_trilhas_padrao():
    """Retorna as trilhas modelo pré-definidas para visualização rápida sem necessidade de IA."""
    return {
        "trilhas": list(TRILHAS_PADRAO_ROADMAP.values())
    }


@router.post("/gerar")
def gerar_roadmap_personalizado(
    payload: GerarRoadmapRequest,
    usuario: Optional[dict] = Depends(obter_usuario_opcional)
):
    """
    Gera um plano de estudos estruturado de 30 dias (4 semanas) e matriz de gaps de habilidades
    com base nas competências atuais do candidato e na vaga ou cargo desejado.
    """
    logger.info(
        f"[roadmap] Gerando plano para cargo='{payload.cargo_alvo}' "
        f"com {len(payload.skills_candidato)} skills (usuario={usuario.get('id') if usuario else 'anonimo'})"
    )

    plano = analisar_gap_e_gerar_plano(
        skills_candidato=payload.skills_candidato,
        cargo_alvo=payload.cargo_alvo,
        vaga_alvo=payload.vaga_alvo
    )

    return plano
