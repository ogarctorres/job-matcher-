"""Testes unitários para os endpoints de busca dinâmica de vagas e desafios técnicos LeetCode."""

from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_buscar_vagas_mercado_endpoint():
    vagas_mock = [
        {"titulo": "Estágio Backend Python", "empresa": "Alpha", "localizacao": "SP", "descricao": "Python e SQL"}
    ]

    with patch("app.services.buscador.buscar_vagas", return_value=vagas_mock):
        response = client.post("/vagas/buscar", json={
            "termo": "backend python",
            "localizacao": "São Paulo",
            "dados_curriculo": {"skills": ["Python", "SQL"]}
        })

        assert response.status_code == 200
        dados = response.json()
        assert dados["total_encontradas"] == 1
        assert "estágio backend python" in dados["termo_pesquisado"].lower()
        assert len(dados["vagas"]) == 1
        assert dados["vagas"][0]["titulo"] == "Estágio Backend Python"
        assert "score" in dados["vagas"][0]


def test_buscar_vagas_termo_curto_invalido():
    response = client.post("/vagas/buscar", json={"termo": "a"})
    assert response.status_code == 422  # Erro de validação Pydantic (min_length=2)


def test_desafios_trilhas_endpoint():
    response = client.get("/desafios/trilhas")
    assert response.status_code == 200
    dados = response.json()
    assert "trilhas" in dados
    assert any(t["id"] == "python" for t in dados["trilhas"])
    assert any(t["id"] == "sql" for t in dados["trilhas"])
    assert any(t["id"] == "redes" for t in dados["trilhas"])


def test_desafios_gerar_customizados():
    response = client.post("/desafios/gerar", json={
        "titulo_vaga": "Estágio em Engenharia de Software (Python / SQL)",
        "stack": "Python, SQL, Docker"
    })
    assert response.status_code == 200
    dados = response.json()
    assert dados["total_desafios"] >= 2
    titulos = [d["titulo"] for d in dados["desafios"]]
    assert any("Vendas" in t or "Usuários" in t or "Departamentos" in t for t in titulos)
