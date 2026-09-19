"""Rotas de estatísticas e analytics."""

import json
import logging
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.analise import Analise
from app.core.seguranca import obter_usuario_opcional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/estatisticas", tags=["Estatísticas"])


@router.get("/")
def obter_estatisticas(
    db: Session = Depends(get_db),
    usuario: dict = Depends(obter_usuario_opcional),
):
    """
    Retorna estatísticas agregadas das análises do usuário (ou gerais da plataforma se anônimo):
    - Total de análises
    - Score médio
    - Skills mais frequentes
    - Cargos mais buscados
    """
    query_base = db.query(Analise)
    if usuario and usuario.get("id"):
        query_base = query_base.filter(Analise.user_id == usuario["id"])

    total = query_base.with_entities(func.count(Analise.id)).scalar() or 0
    media_nota = query_base.with_entities(func.avg(Analise.nota_geral)).scalar() or 0

    # Agregar skills e cargos
    analises = query_base.with_entities(Analise.dados_curriculo_json).all()

    todas_skills = Counter()
    todos_cargos = Counter()

    for (dados_json,) in analises:
        try:
            dados = json.loads(dados_json)
            for skill in dados.get("skills", []):
                todas_skills[skill.strip().lower()] += 1
            cargo = dados.get("cargo_objetivo", "").strip()
            if cargo:
                todos_cargos[cargo.lower()] += 1
        except (json.JSONDecodeError, AttributeError):
            continue

    return {
        "total_analises": total,
        "nota_media": round(float(media_nota), 1),
        "top_skills": [
            {"skill": skill, "contagem": count}
            for skill, count in todas_skills.most_common(15)
        ],
        "top_cargos": [
            {"cargo": cargo, "contagem": count}
            for cargo, count in todos_cargos.most_common(10)
        ],
    }
