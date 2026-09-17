"""Rotas para adaptação e otimização de currículo por vaga com IA."""

import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.services.otimizador import adaptar_curriculo, gerar_curriculo_generico

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Adaptação de Currículo"])


class AdaptarCurriculoRequest(BaseModel):
    texto_curriculo: Optional[str] = Field(default="", max_length=25000, description="Texto do currículo original")
    dados_curriculo: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Dados estruturados do currículo")
    descricao_vaga: Optional[str] = Field(default="", max_length=25000, description="Descrição e requisitos da vaga alvo")
    titulo_vaga: Optional[str] = Field(default="", max_length=500, description="Título da vaga alvo")
    modo_generico: Optional[bool] = Field(default=False, description="Forçar modo genérico ATS se True")


class CurriculoGenericoRequest(BaseModel):
    texto_curriculo: Optional[str] = Field(default="", max_length=25000, description="Texto do currículo original")
    dados_curriculo: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Dados estruturados do currículo")


@router.post("/adaptar-curriculo")
async def adaptar_curriculo_endpoint(payload: AdaptarCurriculoRequest):
    """
    Reescreve o currículo do candidato.
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
        return resultado
    except Exception as erro:
        logger.error(f"Erro ao adaptar currículo: {erro}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível otimizar o currículo no momento. Tente novamente.",
        )


@router.post("/gerar-curriculo-generico")
async def gerar_curriculo_generico_endpoint(payload: CurriculoGenericoRequest):
    """
    MODO 1: Gera um currículo profissional, ATS-friendly sem foco em uma vaga específica.
    """
    if not payload.texto_curriculo and not payload.dados_curriculo:
        raise HTTPException(status_code=400, detail="Forneça o texto ou os dados do currículo.")

    try:
        resultado = gerar_curriculo_generico(
            texto_curriculo=payload.texto_curriculo or "",
            dados_curriculo=payload.dados_curriculo or {},
        )
        return resultado
    except Exception as erro:
        logger.error(f"Erro ao gerar currículo genérico: {erro}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível gerar o currículo genérico no momento. Tente novamente.",
        )
