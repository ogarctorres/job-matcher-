import ollama

from ia_utils import extrair_json


def calcular_compatibilidade(dados_curriculo: dict, vaga: dict) -> dict:
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
Descrição: {vaga.get("descricao", "")}
"""

    resposta = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
    )

    texto_resposta = resposta["message"]["content"]

    return extrair_json(texto_resposta)