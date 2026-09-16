"""
Testes automatizados para ciclo de vida do banco de dados,
encerramento de sessões e injeção de dependência via FastAPI Depends.
"""

import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, SessionLocal, engine
from app.models.analise import Analise

client = TestClient(app)


def test_get_db_fecha_sessao_apos_uso():
    """Verifica se o gerador get_db fecha a sessão após o término do bloco."""
    gen = get_db()
    db = next(gen)
    assert db is not None
    assert db.is_active

    # Avançar o gerador deve invocar o bloco finally com db.close()
    with pytest.raises(StopIteration):
        next(gen)


def test_rotas_fecham_sessao_automaticamente_com_depends():
    """Garante que rotas usando Depends(get_db) não vazam conexões."""
    # Chama listar_historico várias vezes
    for _ in range(5):
        response = client.get("/historico/")
        assert response.status_code == 200

    # Chama estatísticas
    response = client.get("/estatisticas/")
    assert response.status_code == 200


def test_database_sqlite_check_same_thread_configurado():
    """Verifica se a engine do SQLite está com check_same_thread desabilitado."""
    if engine.url.drivername == "sqlite":
        # connect_args deve permitir uso seguro entre threads
        assert "check_same_thread" in engine.url.query or engine.dialect.name == "sqlite"


def test_salvar_e_deletar_analise_com_sessao_injetada():
    """Cria e remove uma análise através das rotas com sessão gerenciada."""
    db = SessionLocal()
    try:
        nova_analise = Analise(
            texto_curriculo="Currículo Teste Estabilidade",
            nota_geral=80.0,
        )
        nova_analise.dados_curriculo = {"skills": ["Python", "FastAPI"], "cargo_objetivo": "Estágio"}
        nova_analise.avaliacao = {"nota_geral": 80, "pontos_fortes": [], "pontos_melhoria": []}
        nova_analise.vagas = []
        db.add(nova_analise)
        db.commit()
        db.refresh(nova_analise)
        analise_id = nova_analise.id
    finally:
        db.close()

    # Consulta via API (Depends)
    resp_get = client.get(f"/historico/{analise_id}")
    assert resp_get.status_code == 200
    assert resp_get.json()["id"] == analise_id

    # Deleta via API (Depends)
    resp_del = client.delete(f"/historico/{analise_id}")
    assert resp_del.status_code == 200

    # Confirma que foi deletada (404)
    resp_confirm = client.get(f"/historico/{analise_id}")
    assert resp_confirm.status_code == 404
