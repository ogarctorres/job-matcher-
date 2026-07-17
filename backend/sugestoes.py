import ollama

from ia_utils import extrair_json, chamar_ia_com_retry


def sugerir_melhorias(dados_curriculo: dict, vaga: dict) -> dict:
    prompt = f"""
Você é um consultor de carreira especializado em TI, ajudando candidatos a
adaptar o currículo para uma vaga específica.

Compare o perfil do candidato com a vaga abaixo e responda APENAS com um
JSON válido, sem nenhum texto antes ou depois, no seguinte formato:

{{
    "sugestoes": ["sugestão específica 1", "sugestão específica 2", "sugestão específica 3"]
}}

Gere de 2 a 4 sugestões concretas e específicas (não genéricas) de como o
candidato poderia destacar melhor seu perfil para aumentar a compatibilidade
com essa vaga em particular. Considere o que a vaga pede e o que falta ou
está pouco evidenciado no perfil do candidato.

PERFIL DO CANDIDATO:
Skills: {", ".join(dados_curriculo.get("skills", []))}
Objetivo: {dados_curriculo.get("cargo_objetivo", "")}
Resumo: {dados_curriculo.get("resumo", "")}

VAGA:
Título: {vaga.get("titulo", "")}
Descrição: {vaga.get("descricao", "")}
"""

    def chamada():
        resposta = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={"num_predict": 1024, "num_ctx": 8192},
        )
        return extrair_json(resposta["message"]["content"])

    return chamar_ia_com_retry(chamada)