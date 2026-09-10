"""Cálculo de compatibilidade entre currículo e vaga."""

from app.core.ia_client import chamar_ia


def calcular_compatibilidade(dados_curriculo: dict, vaga: dict) -> dict:
    """Calcula o score de compatibilidade entre o perfil e uma vaga."""
    prompt = f"""
Você é um recrutador experiente. Analise a compatibilidade entre o perfil de
um candidato e uma vaga de emprego.

Responda APENAS com um JSON válido, sem nenhum texto antes ou depois, no
seguinte formato:

{{
    "score": 0,
    "explicacao": "explicação curta e objetiva do porquê desse score"
}}

O score vai de 0 a 100, sendo:
- 0-30: pouca compatibilidade
- 31-60: compatibilidade parcial
- 61-100: boa compatibilidade

PERFIL DO CANDIDATO:
Skills: {", ".join(dados_curriculo.get("skills", []))}
Objetivo: {dados_curriculo.get("cargo_objetivo", "")}
Resumo: {dados_curriculo.get("resumo", "")}

VAGA:
Título: {vaga.get("titulo", "")}
Descrição: {vaga.get("descricao", "")[:600]}
"""

    return chamar_ia(prompt)
