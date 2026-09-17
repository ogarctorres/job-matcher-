"""Testes para o motor determinístico e auditável de match score (Etapa 6)."""

from unittest.mock import patch
from app.services.match_engine import calcular_score_deterministico
from app.services.otimizador import adaptar_curriculo

PERFIL_BASE = {
    "skills": ["Python", "FastAPI", "PostgreSQL"],
    "cargo_objetivo": "Desenvolvedor Backend",
    "resumo": "Estudante de Ciência da Computação na USP com projetos de APIs REST e banco de dados.",
}

TEXTO_CV_BASE = """
João Silva
Estudante de Ciência da Computação - USP.
Competências: Python, FastAPI, PostgreSQL.
Projetos: Desenvolvimento de API REST com PostgreSQL no GitHub.
"""


def test_score_100_porcento_quando_tudo_da_match():
    """Garante score 100 quando todos os requisitos obrigatórios, desejáveis e formação têm match total."""
    analise_match = {
        "requisitos_obrigatorios": [
            {"requisito": "Python", "status": "MATCH"},
            {"requisito": "FastAPI", "status": "MATCH"},
        ],
        "requisitos_desejaveis": [
            {"requisito": "PostgreSQL", "status": "MATCH"},
            {"requisito": "Git", "status": "MATCH"},
        ],
    }

    score, memoria = calcular_score_deterministico(
        analise_match=analise_match,
        alerta_eliminatorio={"inelegivel": False},
        dados_curriculo=PERFIL_BASE,
        texto_curriculo=TEXTO_CV_BASE,
    )

    assert score == 100
    assert memoria["teto_dealbreaker_aplicado"] is False
    assert memoria["obrigatorios"]["pontos_obtidos"] == 60.0
    assert memoria["desejaveis"]["pontos_obtidos"] == 25.0
    assert memoria["formacao_contexto"]["pontos_obtidos"] == 15.0


def test_score_calculo_proporcional_matematico():
    """Garante o cálculo determinístico exato com pontuação parcial e gaps."""
    # Obrigatórios: 1 MATCH (1.0) + 1 PARTIAL (0.5) + 1 GAP (0.0) = 1.5 / 3 = 50% de 60 = 30.0 pts
    # Desejáveis: 1 MATCH (1.0) + 1 GAP (0.0) = 1.0 / 2 = 50% de 25 = 12.5 pts
    # Formação/Contexto: Ciência da Computação com projetos = 15.0 pts
    # Total Bruto: 30.0 + 12.5 + 15.0 = 57.5 -> round = 58
    analise_match = {
        "requisitos_obrigatorios": [
            {"requisito": "Python", "status": "MATCH"},
            {"requisito": "FastAPI", "status": "PARTIAL"},
            {"requisito": "Java", "status": "GAP"},
        ],
        "requisitos_desejaveis": [
            {"requisito": "PostgreSQL", "status": "MATCH"},
            {"requisito": "Kubernetes", "status": "GAP"},
        ],
    }

    score, memoria = calcular_score_deterministico(
        analise_match=analise_match,
        alerta_eliminatorio={"inelegivel": False},
        dados_curriculo=PERFIL_BASE,
        texto_curriculo=TEXTO_CV_BASE,
    )

    assert score == 58
    assert memoria["score_bruto"] == 57.5
    assert memoria["obrigatorios"]["pontos_obtidos"] == 30.0
    assert memoria["desejaveis"]["pontos_obtidos"] == 12.5
    assert memoria["formacao_contexto"]["pontos_obtidos"] == 15.0
    assert memoria["teto_dealbreaker_aplicado"] is False


def test_teto_dealbreaker_quando_inelegivel():
    """Garante que se inelegivel for True, o score recebe teto estrito de 50% mesmo com 100% de match técnico."""
    analise_match = {
        "requisitos_obrigatorios": [
            {"requisito": "Python", "status": "MATCH"},
            {"requisito": "FastAPI", "status": "MATCH"},
        ],
        "requisitos_desejaveis": [
            {"requisito": "PostgreSQL", "status": "MATCH"},
        ],
    }
    alerta_inelegivel = {
        "inelegivel": True,
        "motivo": "Formação prevista fora da janela exigida pela empresa contratante."
    }

    score, memoria = calcular_score_deterministico(
        analise_match=analise_match,
        alerta_eliminatorio=alerta_inelegivel,
        dados_curriculo=PERFIL_BASE,
        texto_curriculo=TEXTO_CV_BASE,
    )

    # Bruto seria 100, mas com dealbreaker o teto é 50
    assert memoria["score_bruto"] == 100.0
    assert score == 50
    assert memoria["teto_dealbreaker_aplicado"] is True
    assert "Formação prevista fora da janela" in memoria["motivo_teto"]


def test_memoria_calculo_contem_todos_os_campos_auditaveis():
    """Garante que a memória de cálculo possui toda a estrutura auditável necessária para a UI."""
    analise_match = {
        "requisitos_obrigatorios": [{"requisito": "Python", "status": "MATCH"}],
        "requisitos_desejaveis": [],
    }

    _, memoria = calcular_score_deterministico(
        analise_match=analise_match,
        alerta_eliminatorio={"inelegivel": False},
        dados_curriculo=PERFIL_BASE,
        texto_curriculo=TEXTO_CV_BASE,
    )

    campos_obrigatorios = [
        "score_final", "score_bruto", "teto_dealbreaker_aplicado", "formula",
        "obrigatorios", "desejaveis", "formacao_contexto"
    ]
    for campo in campos_obrigatorios:
        assert campo in memoria


def test_integracao_otimizador_retorna_memoria_calculo():
    """Garante que a rota de adaptação integra o motor determinístico e retorna a memória de cálculo."""
    resposta_ia = {
        "modo": "otimizado_para_vaga",
        "titulo_vaga_alvo": "Dev Python",
        "score_compatibilidade": 99,  # IA gerou 99 subjetivo
        "alerta_eliminatorio": {"inelegivel": False, "motivo": ""},
        "analise_match": {
            "requisitos_obrigatorios": [
                {"requisito": "Python", "status": "MATCH"},
                {"requisito": "Golang", "status": "GAP"},
            ],
            "requisitos_desejaveis": [
                {"requisito": "PostgreSQL", "status": "MATCH"},
            ],
            "gaps": ["Golang"],
            "palavras_chave": [],
        },
        "skills_priorizadas": ["Python", "PostgreSQL"],
    }

    with patch("app.services.otimizador.chamar_ia", return_value=resposta_ia):
        resultado = adaptar_curriculo(
            texto_curriculo=TEXTO_CV_BASE,
            dados_curriculo=PERFIL_BASE,
            descricao_vaga="Vaga Backend Python e Go",
            titulo_vaga="Dev Python",
        )

        # O score deve ter sido recalculado matematicamente:
        # Obrigatórios: 1 MATCH de 2 = 30 pts
        # Desejáveis: 1 MATCH de 1 = 25 pts
        # Formação: 15 pts
        # Total = 70 pts (substituindo os 99 subjetivos da IA)
        assert resultado["score_compatibilidade"] == 70
        assert "memoria_calculo" in resultado
        assert resultado["memoria_calculo"]["score_final"] == 70
        assert resultado["memoria_calculo"]["obrigatorios"]["pontos_obtidos"] == 30.0
