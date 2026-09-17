"""Testes para o motor estruturado de elegibilidade e dealbreakers (Etapa 7)."""

from unittest.mock import patch
from app.services.eligibility_engine import (
    parse_data_formatura,
    avaliar_formatura,
    avaliar_curso,
    avaliar_localizacao,
    avaliar_elegibilidade_completa,
)
from app.services.otimizador import adaptar_curriculo

PERFIL_CANDIDATO = {
    "skills": ["Python", "FastAPI", "SQL"],
    "cargo_objetivo": "Desenvolvedor Backend",
    "resumo": "Estudante de Ciência da Computação.",
}


def test_parse_data_formatura_formatos():
    """Garante parsing correto de múltiplos formatos de data de formatura."""
    assert parse_data_formatura("Dez/2026") == (2026, 12)
    assert parse_data_formatura("12/2026") == (2026, 12)
    assert parse_data_formatura("06/2025") == (2025, 6)
    assert parse_data_formatura("1º semestre de 2026") == (2026, 6)
    assert parse_data_formatura("2º semestre de 2025") == (2025, 12)
    assert parse_data_formatura("Formatura prevista para 2026") == (2026, 12)


def test_eligibility_formatura_dentro_do_prazo():
    """Garante status ELIGIBLE quando a data de formatura está contida na janela exigida."""
    texto_cv = "Estudante de Ciência da Computação. Previsão de Formatura: Dez/2026."
    vaga = "Requisitos: Previsão de formatura entre Dez/2025 e Dez/2026."

    resultado = avaliar_formatura(texto_cv, vaga)
    assert resultado["status"] == "ELIGIBLE"
    assert "dentro da janela" in resultado["detalhe"].lower()


def test_eligibility_formatura_fora_do_prazo():
    """Garante status INELIGIBLE quando a formatura do candidato ultrapassa a janela da vaga."""
    texto_cv = "Estudante de Ciência da Computação. Previsão de Formatura: Dez/2027."
    vaga = "Requisitos: Formatura entre Dez/2024 e Dez/2025."

    resultado = avaliar_formatura(texto_cv, vaga)
    assert resultado["status"] == "INELIGIBLE"
    assert "FORA da janela obrigatória" in resultado["detalhe"]


def test_eligibility_formatura_nao_declarada():
    """Garante status UNKNOWN quando a vaga exige prazo mas o currículo omite a data."""
    texto_cv = "Estudante de Computação sem data declarada."
    vaga = "Requisitos: Conclusão até Dez/2025."

    resultado = avaliar_formatura(texto_cv, vaga)
    assert resultado["status"] == "UNKNOWN"
    assert "não foi informada" in resultado["detalhe"]


def test_eligibility_curso_incompativel_exclusivo():
    """Garante status INELIGIBLE quando a vaga é exclusiva para área não compatível."""
    texto_cv = "Estudante de Ciência da Computação na USP."
    vaga = "Vaga: Estágio em Direito Imobiliário. Requisito: Exclusivo para estudantes de Direito."

    resultado = avaliar_curso(PERFIL_CANDIDATO, texto_cv, vaga)
    assert resultado["status"] == "INELIGIBLE"
    assert "Direito" in resultado["detalhe"]


def test_eligibility_localizacao_presencial_outro_estado():
    """Garante POSSIBLE_INELIGIBILITY para vagas presenciais em outros estados."""
    texto_cv = "Residente em Salvador - BA. Estudante de TI."
    vaga = "Vaga de Estágio Presencial em Curitiba - PR no escritório central."

    resultado = avaliar_localizacao(PERFIL_CANDIDATO, texto_cv, vaga)
    assert resultado["status"] == "POSSIBLE_INELIGIBILITY"
    assert "Curitiba" in resultado["detalhe"]


def test_eligibility_vaga_remota_livre():
    """Garante ELIGIBLE para vagas 100% remotas independentemente de onde o candidato reside."""
    texto_cv = "Residente em Salvador - BA."
    vaga = "Vaga 100% remota (Home Office) para qualquer localidade do Brasil."

    resultado = avaliar_localizacao(PERFIL_CANDIDATO, texto_cv, vaga)
    assert resultado["status"] == "ELIGIBLE"
    assert resultado["modalidade"] == "Remoto"


def test_integracao_eligibility_engine_no_otimizador():
    """Garante que o otimizador aplica o Eligibility Engine e impõe teto de 50% em caso de dealbreaker."""
    texto_cv = "João Silva. Estudante de Ciência da Computação. Previsão de Formatura: Dez/2027. São Paulo - SP."
    descricao_vaga = "Estágio Tech. Requisito eliminatório: Formatura entre Dez/2024 e Dez/2025."

    resposta_ia = {
        "modo": "otimizado_para_vaga",
        "titulo_vaga_alvo": "Estágio Tech",
        "score_compatibilidade": 95,
        "analise_match": {
            "requisitos_obrigatorios": [{"requisito": "Python", "status": "MATCH"}],
            "requisitos_desejaveis": [],
            "gaps": [],
            "palavras_chave": [],
        },
        "skills_priorizadas": ["Python"],
    }

    with patch("app.services.otimizador.chamar_ia", return_value=resposta_ia):
        resultado = adaptar_curriculo(
            texto_curriculo=texto_cv,
            dados_curriculo=PERFIL_CANDIDATO,
            descricao_vaga=descricao_vaga,
            titulo_vaga="Estágio Tech",
        )

        alerta = resultado["alerta_eliminatorio"]
        assert alerta["inelegivel"] is True
        assert alerta["status_geral"] == "INELIGIBLE"
        assert "FORA da janela" in alerta["motivo"]
        # Score final deve respeitar o teto estrito de dealbreaker (<= 50)
        assert resultado["score_compatibilidade"] <= 50
        assert resultado["memoria_calculo"]["teto_dealbreaker_aplicado"] is True
