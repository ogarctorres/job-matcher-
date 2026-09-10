"""Serviço de análise de tendências de skills do mercado."""

import logging
from collections import Counter
from app.services.buscador import buscar_vagas

logger = logging.getLogger(__name__)

SKILLS_CONHECIDAS = [
    "python", "sql", "javascript", "typescript", "react", "node", "java", "c#",
    ".net", "docker", "aws", "azure", "git", "linux", "html", "css", "pandas",
    "power bi", "excel", "machine learning", "api", "rest", "fastapi", "flask",
    "spring", "postgresql", "mysql", "mongodb", "figma", "scrum"
]


def analisar_tendencias_vagas(termo: str = "estagio ti", localizacao: str = None) -> dict:
    """
    Busca vagas no mercado em tempo real e minera quais skills
    estão sendo mais exigidas nos requisitos/descrições.
    """
    vagas = buscar_vagas(termo, localizacao)
    frequencia_skills = Counter()

    for vaga in vagas:
        texto = (vaga.get("titulo", "") + " " + vaga.get("descricao", "")).lower()
        for skill in SKILLS_CONHECIDAS:
            if skill in texto:
                frequencia_skills[skill] += 1

    top_mercado = [
        {"skill": skill, "mencoes": count, "porcentagem": round((count / len(vagas) * 100) if vagas else 0, 1)}
        for skill, count in frequencia_skills.most_common(12)
    ]

    return {
        "termo_pesquisado": termo,
        "total_vagas_analisadas": len(vagas),
        "top_skills_em_alta": top_mercado
    }
