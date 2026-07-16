import ollama

from ia_utils import extrair_json

def analisar_curriculo(texto_curriculo: str) -> dict:
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

    resposta = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
    )

    texto_resposta = resposta["message"]["content"]

    return extrair_json(texto_resposta)