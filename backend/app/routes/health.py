"""Rotas de verificação de status e saúde da API."""

import os
from fastapi import APIRouter
from app.core.config import IA_PROVIDER

router = APIRouter(tags=["Health"])


@router.get("/health")
def healthcheck():
    """Retorna a saúde dos serviços integrados."""
    gemini_configurado = bool(os.getenv("GEMINI_API_KEY"))
    jooble_configurado = bool(os.getenv("JOOBLE_API_KEY"))

    return {
        "status": "online",
        "ia_provider": IA_PROVIDER,
        "gemini_disponivel": gemini_configurado,
        "jooble_disponivel": jooble_configurado,
    }
