"""Serviço de otimização e reescrita de currículo para vagas específicas com IA."""

from app.core.ia_client import chamar_ia


def adaptar_curriculo_para_vaga(
    texto_curriculo: str,
    dados_curriculo: dict,
    descricao_vaga: str,
    titulo_vaga: str = ""
) -> dict:
    """
    Usa IA para reescrever e alinhar o perfil do candidato
    aos requisitos exatos da vaga, otimizando para ATS e recrutadores.
    """
    prompt = f"""
Você é um especialista em recrutamento técnico (Tech Recruiter) e engenharia de currículos para a área de Tecnologia e Dados.
Sua missão é REESCREVER e ADAPTAR o currículo do candidato para maximizar a compatibilidade com a vaga abaixo, sem mentir ou inventar experiências inexistentes.

REGRAS ESTRITAS:
1. Alinhe o vocabulário e palavras-chave técnicas aos termos usados na descrição da vaga (otimização para ATS - Applicant Tracking Systems).
2. Reformule o Resumo Profissional para se conectar diretamente com a vaga desejada.
3. Destaque as competências e tecnologias do candidato que são mais relevantes para essa oportunidade.
4. Reescreva ou sugira pontos de impacto (bullets) para projetos ou experiências utilizando verbos de ação e foco em resultados.
5. Forneça a versão final do currículo completo em formato Markdown limpo, pronto para ser copiado.

Responda APENAS com um JSON válido compatível com json.loads(), no seguinte formato:

{{
    "titulo_vaga_alvo": "{titulo_vaga or 'Vaga Alvo'}",
    "resumo_otimizado": "Resumo de 3 a 4 linhas altamente direcionado para a vaga",
    "skills_priorizadas": ["Skill 1 relevante para a vaga", "Skill 2", "Skill 3"],
    "bullets_projetos_otimizados": [
        {{
            "foco": "Nome do projeto ou tecnologia aplicada",
            "bullet_reescrito": "Descrição em formato de ação e impacto alinhada com a vaga"
        }}
    ],
    "dicas_palavras_chave_ats": [
        "Palavra-chave 1 da vaga que o candidato deve enfatizar",
        "Palavra-chave 2"
    ],
    "curriculo_formatado_markdown": "Texto completo do currículo adaptado em Markdown profissional"
}}

PERFIL ATUAL DO CANDIDATO:
Skills atuais: {", ".join(dados_curriculo.get("skills", []))}
Cargo Objetivo: {dados_curriculo.get("cargo_objetivo", "")}
Resumo atual: {dados_curriculo.get("resumo", "")}
Texto bruto do currículo:
{texto_curriculo[:3000]}

DETALHES DA VAGA DESEJADA:
Título da vaga: {titulo_vaga}
Descrição e Requisitos:
{descricao_vaga[:4000]}
"""

    return chamar_ia(prompt)
