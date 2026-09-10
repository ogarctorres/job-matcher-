"""Rotas de estatísticas e analytics."""

import json
import logging
from collections import Counter
from fastapi import APIRouter
from sqlalchemy import func

from app.database import get_db
from app.models.analise import Analise

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/estatisticas", tags=["Estatísticas"])


@router.get("/")
def obter_estatisticas():
    """
    Retorna estatísticas agregadas de todas as análises:
    - Total de análises
    - Score médio
    - Skills mais frequentes
    - Cargos mais buscados
    """
    db = next(get_db())

    total = db.query(func.count(Analise.id)).scalar() or 0
    media_nota = db.query(func.avg(Analise.nota_geral)).scalar() or 0

    # Agregar skills e cargos
    analises = db.query(Analise.dados_curriculo_json).all()

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
