"""Rotas de geração de carta de apresentação."""

import logging
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from app.services.carta import gerar_carta

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Carta"])


class CartaRequest(BaseModel):
    dados_curriculo: dict
    vaga: dict


@router.post("/carta")
async def gerar_carta_endpoint(dados: CartaRequest):
    """Gera uma carta de apresentação personalizada para uma vaga."""
    try:
        resultado = gerar_carta(dados.dados_curriculo, dados.vaga)
    except Exception as erro:
        logger.error(f"Erro ao gerar carta: {erro}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível gerar a carta agora. Tente novamente.",
        )

    return resultado
