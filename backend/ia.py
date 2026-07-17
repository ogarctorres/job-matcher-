import ollama

from ia_utils import extrair_json, chamar_ia_com_retry


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

    def chamada():
        resposta = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={"num_predict": 1024, "num_ctx": 8192},
        )
        return extrair_json(resposta["message"]["content"])

    return chamar_ia_com_retry(chamada)