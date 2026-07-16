import ollama

from ia_utils import extrair_json


def avaliar_curriculo(texto_curriculo: str) -> dict:
    prompt = f"""
Você é um recrutador experiente de TI, avaliando currículos de candidatos a
estágio. Analise o currículo abaixo e responda APENAS com um JSON válido,
sem nenhum texto antes ou depois, no seguinte formato:

{{
    "nota_geral": 0,
    "pontos_fortes": ["ponto forte 1", "ponto forte 2"],
    "pontos_melhoria": ["sugestão 1", "sugestão 2"],
    "comentario_geral": "comentário curto e direto sobre o currículo como um todo"
}}

A nota_geral vai de 0 a 100, considerando clareza, organização e adequação
para vagas de estágio em TI. Liste de 2 a 4 pontos fortes e de 2 a 4 pontos
de melhoria, sempre específicos ao conteúdo do currículo (não genéricos).

Currículo:
{texto_curriculo}
"""

    resposta = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
    )

    texto_resposta = resposta["message"]["content"]

    return extrair_json(texto_resposta)