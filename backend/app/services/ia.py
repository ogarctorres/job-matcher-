"""Análise de currículo com IA — extrai dados estruturados."""

from app.core.ia_client import chamar_ia


def analisar_curriculo(texto_curriculo: str) -> dict:
    """Usa IA para extrair skills, objetivo e resumo do currículo."""
    prompt = f"""
Você é um assistente que extrai informações de currículos.

Analise o currículo abaixo e responda APENAS com um JSON válido, sem nenhum
texto antes ou depois, no seguinte formato:

{{
    "skills": ["lista", "de", "habilidades", "tecnicas"],
    "cargo_objetivo": "cargo que a pessoa busca",
    "termo_busca_vaga": "2 a 3 palavras-chave curtas para buscar vagas, ex: estagio ti",
    "anos_experiencia": 0,
    "resumo": "resumo de 2-3 frases sobre o perfil"
}}

Currículo:
{texto_curriculo}
"""

    return chamar_ia(prompt)
