from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_listar_historico_retorna_200():
    response = client.get("/historico/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_obter_tendencias_padrao():
    response = client.get("/tendencias/")
    assert response.status_code == 200
    dados = response.json()
    assert "top_skills_em_alta" in dados
