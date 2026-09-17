"""Testes para o Trust Layer Anti-Alucinação do Vektor ('LLM interpreta. Backend valida e decide')."""

from unittest.mock import patch
from app.services.otimizador import (
    adaptar_curriculo,
    gerar_curriculo_generico,
    validar_skills_contra_evidencias,
)

PERFIL_CANDIDATO_TESTE = {
    "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
    "cargo_objetivo": "Desenvolvedor Backend Júnior",
    "resumo": "Estudante de computação com foco em APIs REST e banco de dados relacional.",
}

TEXTO_CURRICULO_TESTE = """
Lucas Andrade
Estudante de Engenharia de Software.
Habilidades: Python, FastAPI, PostgreSQL, Docker, Git.
Projetos:
- Desenvolveu API REST em FastAPI integrada com PostgreSQL em contêineres Docker.
- Automação de pipelines de dados usando scripts Python.
"""


def test_trust_layer_remove_skills_alucinadas_e_adiciona_a_gaps():
    """Garante que skills alucinadas pela IA são expurgadas de skills_priorizadas e realocadas para gaps."""
    # A IA alucina que o candidato possui Rust, Golang e AWS
    resposta_ia_alucinada = {
        "modo": "otimizado_para_vaga",
        "titulo_vaga_alvo": "Backend Sênior",
        "score_compatibilidade": 80,
        "analise_match": {
            "gaps": ["Kubernetes"],
            "palavras_chave": [],
            "requisitos_obrigatorios": [],
            "requisitos_desejaveis": [],
        },
        "skills_priorizadas": ["Python", "FastAPI", "Rust", "Golang", "AWS", "PostgreSQL"],
    }

    with patch("app.services.otimizador.chamar_ia", return_value=resposta_ia_alucinada):
        resultado = adaptar_curriculo(
            texto_curriculo=TEXTO_CURRICULO_TESTE,
            dados_curriculo=PERFIL_CANDIDATO_TESTE,
            descricao_vaga="Vaga Backend Rust e Go com AWS",
            titulo_vaga="Backend",
        )

        skills = resultado["skills_priorizadas"]
        # Apenas skills reais presentes no perfil devem permanecer
        assert "Python" in skills
        assert "FastAPI" in skills
        assert "PostgreSQL" in skills
        assert "Rust" not in skills
        assert "Golang" not in skills
        assert "AWS" not in skills

        # As skills alucinadas devem ter sido movidas para a lista de gaps
        gaps = resultado["analise_match"]["gaps"]
        assert "Rust" in gaps
        assert "Golang" in gaps
        assert "AWS" in gaps
        assert "Kubernetes" in gaps


def test_trust_layer_sanitiza_palavras_chave_falsas():
    """Garante que termos marcados indevidamente como presentes no perfil são corrigidos para False."""
    resposta_ia = {
        "modo": "otimizado_para_vaga",
        "analise_match": {
            "gaps": [],
            "palavras_chave": [
                {"termo": "Python", "presente_no_perfil": True, "adicionada_ao_curriculo": True},
                {"termo": "Kubernetes", "presente_no_perfil": True, "adicionada_ao_curriculo": True},
            ],
        },
        "skills_priorizadas": ["Python"],
    }

    resultado = validar_skills_contra_evidencias(
        resultado_ia=resposta_ia,
        dados_curriculo=PERFIL_CANDIDATO_TESTE,
        texto_curriculo=TEXTO_CURRICULO_TESTE,
    )

    pks = {item["termo"]: item for item in resultado["analise_match"]["palavras_chave"]}
    assert pks["Python"]["presente_no_perfil"] is True
    assert pks["Kubernetes"]["presente_no_perfil"] is False
    assert pks["Kubernetes"]["adicionada_ao_curriculo"] is False


def test_trust_layer_corrige_match_falso_positivo_com_evidencia_negativa():
    """Garante que a IA não conceda MATCH a requisitos cuja evidência declare ausência."""
    resposta_ia = {
        "modo": "otimizado_para_vaga",
        "analise_match": {
            "gaps": [],
            "palavras_chave": [],
            "requisitos_obrigatorios": [
                {
                    "requisito": "Domínio de Golang",
                    "evidencia_no_perfil": "Não encontrado no currículo do candidato",
                    "status": "MATCH",  # Alucinação/inconsistência lógica da IA
                }
            ],
            "requisitos_desejaveis": [],
        },
        "skills_priorizadas": ["Python"],
    }

    resultado = validar_skills_contra_evidencias(
        resultado_ia=resposta_ia,
        dados_curriculo=PERFIL_CANDIDATO_TESTE,
        texto_curriculo=TEXTO_CURRICULO_TESTE,
    )

    req = resultado["analise_match"]["requisitos_obrigatorios"][0]
    assert req["status"] == "GAP"


def test_trust_layer_reconhece_variacoes_legitimas_de_skills():
    """Garante que sinônimos e variações de escrita de tecnologias reais não são excluídos indevidamente."""
    dados_candidato = {
        "skills": ["Node.js", "PostgreSQL", "C++", "React.js"],
        "resumo": "Desenvolvedor full stack",
    }
    texto_cv = "Experiência com Node.js, PostgreSQL, C++ e React.js."

    resposta_ia = {
        "skills_priorizadas": ["Node", "Postgres", "C++", "React"],
    }

    resultado = validar_skills_contra_evidencias(
        resultado_ia=resposta_ia,
        dados_curriculo=dados_candidato,
        texto_curriculo=texto_cv,
    )

    # Nenhuma das variações legítimas deve ser expurgada
    assert "Node" in resultado["skills_priorizadas"]
    assert "Postgres" in resultado["skills_priorizadas"]
    assert "C++" in resultado["skills_priorizadas"]
    assert "React" in resultado["skills_priorizadas"]


def test_trust_layer_no_modo_generico():
    """Garante que o MODO 1 (Currículo Genérico) também é purificado de alucinações de skills."""
    resposta_ia_generica = {
        "modo": "generico",
        "titulo_vaga_alvo": "Perfil Geral de Tecnologia",
        "skills_priorizadas": ["Python", "Solidity", "Blockchain", "FastAPI"],
    }

    with patch("app.services.otimizador.chamar_ia", return_value=resposta_ia_generica):
        resultado = gerar_curriculo_generico(
            texto_curriculo=TEXTO_CURRICULO_TESTE,
            dados_curriculo=PERFIL_CANDIDATO_TESTE,
        )

        skills = resultado["skills_priorizadas"]
        assert "Python" in skills
        assert "FastAPI" in skills
        assert "Solidity" not in skills
        assert "Blockchain" not in skills
