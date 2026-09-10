from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rota_raiz():
    response = client.get("/")
    assert response.status_code == 200
    assert "Vektor" in response.json()["mensagem"]

def test_rota_health():
    response = client.get("/health")
    assert response.status_code == 200
    dados = response.json()
    assert dados["status"] == "online"
    assert "ia_provider" in dados

def test_rota_estatisticas():
    response = client.get("/estatisticas/")
    assert response.status_code == 200
    dados = response.json()
    assert "total_analises" in dados
    assert "top_skills" in dados
