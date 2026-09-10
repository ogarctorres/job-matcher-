"""Rotas para adaptação e otimização de currículo por vaga com IA."""

import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.services.otimizador import adaptar_curriculo_para_vaga

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Adaptação de Currículo"])


class AdaptarCurriculoRequest(BaseModel):
    texto_curriculo: Optional[str] = Field(default="", description="Texto do currículo original")
    dados_curriculo: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Dados estruturados do currículo")
    descricao_vaga: str = Field(..., description="Descrição e requisitos da vaga alvo")
    titulo_vaga: Optional[str] = Field(default="", description="Título da vaga alvo")


@router.post("/adaptar-curriculo")
async def adaptar_curriculo_endpoint(payload: AdaptarCurriculoRequest):
    """
    Reescreve o currículo do candidato adaptando-o especificamente aos
    requisitos e palavras-chave da vaga selecionada ou colada.
    """
    if not payload.descricao_vaga.strip():
        raise HTTPException(status_code=400, detail="A descrição da vaga é obrigatória.")

    if not payload.texto_curriculo and not payload.dados_curriculo:
        raise HTTPException(status_code=400, detail="Forneça o texto ou os dados do currículo.")

    try:
        resultado = adaptar_curriculo_para_vaga(
            texto_curriculo=payload.texto_curriculo or "",
            dados_curriculo=payload.dados_curriculo or {},
            descricao_vaga=payload.descricao_vaga,
            titulo_vaga=payload.titulo_vaga or "Vaga de Tecnologia",
        )
        return resultado
    except Exception as erro:
        logger.error(f"Erro ao adaptar currículo: {erro}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível otimizar o currículo no momento. Tente novamente.",
        )
