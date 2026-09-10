"""Gerador de carta de apresentação personalizada."""

from app.core.ia_client import chamar_ia


def gerar_carta(dados_curriculo: dict, vaga: dict) -> dict:
    """Gera uma carta de apresentação personalizada para a vaga."""
    prompt = f"""
Você é um especialista em carreiras de TI, ajudando candidatos a estágio a
escrever cartas de apresentação impactantes.

Escreva uma carta de apresentação profissional e personalizada em português
do Brasil, com base no perfil do candidato e na vaga abaixo.

REGRAS:
1. A carta deve ter entre 3 e 5 parágrafos.
2. Deve ser específica para a vaga, não genérica.
3. Destaque as skills do candidato que se encaixam na vaga.
4. Tom profissional mas natural, sem ser robótico.
5. Responda APENAS com um JSON válido no formato:

{{
    "carta": "texto completo da carta de apresentação",
    "assunto_email": "sugestão de assunto para o e-mail"
}}

PERFIL DO CANDIDATO:
Skills: {", ".join(dados_curriculo.get("skills", []))}
Objetivo: {dados_curriculo.get("cargo_objetivo", "")}
Resumo: {dados_curriculo.get("resumo", "")}
Experiência: {dados_curriculo.get("anos_experiencia", 0)} anos

VAGA:
Título: {vaga.get("titulo", "")}
Empresa: {vaga.get("empresa", "")}
Descrição: {vaga.get("descricao", "")[:800]}
"""

    return chamar_ia(prompt)
