from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_adaptar_curriculo_sem_descricao_retorna_400():
    response = client.post("/adaptar-curriculo", json={
        "texto_curriculo": "Experiência em Python",
        "descricao_vaga": ""
    })
    assert response.status_code == 400

def test_adaptar_curriculo_sem_curriculo_retorna_400():
    response = client.post("/adaptar-curriculo", json={
        "texto_curriculo": "",
        "dados_curriculo": {},
        "descricao_vaga": "Vaga Estágio Python"
    })
    assert response.status_code == 400
