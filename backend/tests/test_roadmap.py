"""Testes do módulo de Roadmap e Skill Gap."""

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app
from app.services.roadmap import analisar_gap_e_gerar_plano, TRILHAS_PADRAO_ROADMAP

client = TestClient(app)


def test_listar_trilhas_padrao_retorna_200():
    response = client.get("/roadmap/trilhas")
    assert response.status_code == 200
    dados = response.json()
    assert "trilhas" in dados
    assert len(dados["trilhas"]) >= 2
    ids = [t["id"] for t in dados["trilhas"]]
    assert "backend" in ids
    assert "frontend" in ids


def test_gerar_roadmap_com_mock_ia_sucesso():
    payload_mock = {
        "cargo_analisado": "Engenheiro de Dados Júnior",
        "nivel_aderencia": "Intermediário",
        "skills_consolidadas": ["Python", "SQL"],
        "gaps_criticos": [{"skill": "PySpark", "motivo": "Processamento em larga escala"}],
        "gaps_diferenciais": [{"skill": "Airflow", "motivo": "Orquestração de pipelines"}],
        "plano_30_dias": [
            {
                "semana": 1,
                "titulo": "Semana 1: ETL com Pandas & SQL",
                "foco": "Extração e carga",
                "horas_semana": 6,
                "tarefas": [{"titulo": "Pipelines SQL", "descricao": "Queries analíticas"}],
                "projeto_pratico": "Pipeline CSV para Postgres",
                "dica_entrevista": "Fale sobre tipos de join e planos de execução."
            }
        ]
    }

    with patch("app.services.roadmap.chamar_ia", return_value=payload_mock):
        response = client.post(
            "/roadmap/gerar",
            json={
                "skills_candidato": ["Python", "SQL"],
                "cargo_alvo": "Engenheiro de Dados Júnior"
            }
        )
        assert response.status_code == 200
        dados = response.json()
        assert dados["cargo_analisado"] == "Engenheiro de Dados Júnior"
        assert len(dados["plano_30_dias"]) == 1
        assert dados["gaps_criticos"][0]["skill"] == "PySpark"


def test_gerar_roadmap_fallback_quando_ia_falha():
    with patch("app.services.roadmap.chamar_ia", side_effect=Exception("Timeout no Gemini")):
        response = client.post(
            "/roadmap/gerar",
            json={
                "skills_candidato": ["Python", "Git"],
                "cargo_alvo": "Desenvolvedor Backend Python"
            }
        )
        assert response.status_code == 200
        dados = response.json()
        assert "plano_30_dias" in dados
        assert len(dados["plano_30_dias"]) == 4
        assert "FastAPI / APIs REST" in [g["skill"] for g in dados["gaps_criticos"]]


def test_gerar_roadmap_fallback_frontend():
    with patch("app.services.roadmap.chamar_ia", side_effect=Exception("Erro 500 API")):
        resultado = analisar_gap_e_gerar_plano(
            skills_candidato=["JavaScript", "CSS"],
            cargo_alvo="Desenvolvedor Frontend React"
        )
        assert "plano_30_dias" in resultado
        assert len(resultado["plano_30_dias"]) == 4
        skills_gaps = [g["skill"] for g in resultado["gaps_criticos"]]
        assert any("React" in s for s in skills_gaps)


def test_gerar_roadmap_com_vaga_alvo():
    payload_mock = {
        "cargo_analisado": "Estágio em QA / Automação",
        "nivel_aderencia": "Iniciante",
        "skills_consolidadas": ["Python"],
        "gaps_criticos": [{"skill": "Selenium", "motivo": "Automação web"}],
        "gaps_diferenciais": [{"skill": "Postman", "motivo": "Testes de API"}],
        "plano_30_dias": [
            {
                "semana": 1,
                "titulo": "Semana 1: Testes de API",
                "foco": "Postman e Pytest",
                "horas_semana": 5,
                "tarefas": [{"titulo": "Testar endpoints", "descricao": "Automação"}],
                "projeto_pratico": "Suite de testes de API",
                "dica_entrevista": "Fale sobre assertions."
            }
        ]
    }

    with patch("app.services.roadmap.chamar_ia", return_value=payload_mock):
        response = client.post(
            "/roadmap/gerar",
            json={
                "skills_candidato": ["Python"],
                "cargo_alvo": "Estágio QA",
                "vaga_alvo": {
                    "titulo": "Estágio em Automação de Testes",
                    "empresa": "TechCorp",
                    "descricao": "Procuramos estagiário com conhecimento em Python e interesse em testes automatizados."
                }
            }
        )
        assert response.status_code == 200
        dados = response.json()
        assert dados["cargo_analisado"] == "Estágio em QA / Automação"
