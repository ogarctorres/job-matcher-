"""
Testes para Etapa 8: Persistência de Adaptações e Recuperação de Estado.
- Modelo CurriculoAdaptado e relação cascade com Analise.
- Endpoints de adaptação gravando no SQLite com analise_id.
- Endpoints de histórico de adaptações por analise_id.
- Propagação de localização regional via Header e Form.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal, criar_tabelas
from app.models.analise import Analise, CurriculoAdaptado

# Garante que as novas tabelas existem no SQLite do ambiente de teste
criar_tabelas()

client = TestClient(app)


def test_model_curriculo_adaptado_salva_e_recupera():
    """Valida criação direta e decodificação do payload de adaptação no SQLite."""
    db = SessionLocal()
    try:
        adaptacao = CurriculoAdaptado(
            titulo_vaga="Desenvolvedor Python Júnior",
            modo="otimizado_para_vaga",
            score_compatibilidade=88.5,
        )
        adaptacao.resultado = {
            "resumo_otimizado": "Estudante com foco em Python e FastAPI.",
            "skills_priorizadas": ["Python", "SQL"],
        }
        db.add(adaptacao)
        db.commit()
        db.refresh(adaptacao)

        recuperado = db.query(CurriculoAdaptado).filter(CurriculoAdaptado.id == adaptacao.id).first()
        assert recuperado is not None
        assert recuperado.titulo_vaga == "Desenvolvedor Python Júnior"
        assert recuperado.score_compatibilidade == 88.5
        assert recuperado.resultado["skills_priorizadas"] == ["Python", "SQL"]
        d = recuperado.to_dict()
        assert d["id"] == adaptacao.id
        assert "resumo_otimizado" in d["resultado"]

        # Limpeza
        db.delete(recuperado)
        db.commit()
    finally:
        db.close()


def test_relacionamento_analise_e_curriculos_adaptados_cascade():
    """Valida que excluir uma análise remove em cascata todas as adaptações vinculadas."""
    db = SessionLocal()
    try:
        analise = Analise(
            texto_curriculo="Perfil Original Teste",
            nota_geral=75.0,
        )
        analise.dados_curriculo = {"skills": ["Python"], "cargo_objetivo": "Estágio Backend"}
        analise.avaliacao = {"nota_geral": 75}
        analise.vagas = []
        db.add(analise)
        db.commit()
        db.refresh(analise)
        analise_id = analise.id

        # Adiciona 2 adaptações vinculadas
        ad1 = CurriculoAdaptado(
            analise_id=analise_id,
            titulo_vaga="Vaga A",
            modo="otimizado_para_vaga",
            score_compatibilidade=85.0,
        )
        ad1.resultado = {"modo": "otimizado_para_vaga"}

        ad2 = CurriculoAdaptado(
            analise_id=analise_id,
            titulo_vaga="Vaga B",
            modo="generico",
            score_compatibilidade=70.0,
        )
        ad2.resultado = {"modo": "generico"}

        db.add_all([ad1, ad2])
        db.commit()

        # Recarrega a análise
        analise_recarregada = db.query(Analise).filter(Analise.id == analise_id).first()
        resumo = analise_recarregada.to_dict()
        assert resumo["total_adaptacoes"] == 2
        assert len(resumo["adaptacoes"]) == 2

        # Deleta a análise e valida cascata
        db.delete(analise_recarregada)
        db.commit()

        filhos_restantes = db.query(CurriculoAdaptado).filter(CurriculoAdaptado.analise_id == analise_id).count()
        assert filhos_restantes == 0
    finally:
        db.close()


def test_endpoint_adaptar_curriculo_persiste_com_analise_id():
    """Valida que POST /adaptar-curriculo grava registro no SQLite e devolve ID da versão adaptada."""
    mock_retorno_ia = {
        "modo": "otimizado_para_vaga",
        "titulo_vaga_alvo": "Estágio em Engenharia de Software",
        "score_compatibilidade": 82,
        "alerta_eliminatorio": {"inelegivel": False, "motivo": ""},
        "analise_match": {
            "requisitos_obrigatorios": [{"requisito": "Python", "evidencia_no_perfil": "Python", "status": "MATCH"}],
            "requisitos_desejaveis": [],
            "gaps": []
        },
        "resumo_otimizado": "Resumo alinhado à vaga",
        "skills_priorizadas": ["Python"],
        "bullets_projetos_otimizados": [],
        "dicas_palavras_chave_ats": [],
        "curriculo_formatado_markdown": "# Teste Adaptado",
    }

    db = SessionLocal()
    analise_id = None
    try:
        # Cria uma análise base no banco
        base = Analise(texto_curriculo="CV Base", nota_geral=80.0)
        base.dados_curriculo = {"skills": ["Python"]}
        base.avaliacao = {"nota_geral": 80}
        db.add(base)
        db.commit()
        db.refresh(base)
        analise_id = base.id
    finally:
        db.close()

    with patch("app.services.otimizador.chamar_ia", return_value=mock_retorno_ia):
        payload = {
            "analise_id": analise_id,
            "texto_curriculo": "Estudante de computação com projetos em Python",
            "dados_curriculo": {"skills": ["Python"]},
            "descricao_vaga": "Buscamos estagiário com conhecimento em Python e SQLite.",
            "titulo_vaga": "Estágio em Engenharia de Software",
        }
        res = client.post("/adaptar-curriculo", json=payload)
        assert res.status_code == 200
        dados = res.json()
        assert dados.get("id") is not None
        assert dados.get("analise_id") == analise_id

        adaptacao_id = dados["id"]

        # Valida consulta pelo histórico de adaptações
        res_hist = client.get(f"/adaptar-curriculo/historico/{analise_id}")
        assert res_hist.status_code == 200
        lista = res_hist.json()
        assert len(lista) >= 1
        assert any(item["id"] == adaptacao_id for item in lista)

        # Valida detalhe da adaptação específica
        res_detalhe = client.get(f"/adaptar-curriculo/{adaptacao_id}")
        assert res_detalhe.status_code == 200
        assert res_detalhe.json()["titulo_vaga"] == "Estágio em Engenharia de Software"

        # Valida remoção da adaptação
        res_del = client.delete(f"/adaptar-curriculo/{adaptacao_id}")
        assert res_del.status_code == 200

    # Limpeza da análise base
    db = SessionLocal()
    try:
        b = db.query(Analise).filter(Analise.id == analise_id).first()
        if b:
            db.delete(b)
            db.commit()
    finally:
        db.close()


def test_endpoint_gerar_curriculo_generico_persiste_no_banco():
    """Valida que POST /gerar-curriculo-generico grava registro no SQLite."""
    mock_retorno_ia = {
        "modo": "generico",
        "titulo_vaga_alvo": "Perfil Geral de Tecnologia",
        "resumo_otimizado": "Resumo geral ATS",
        "skills_priorizadas": ["Python"],
        "bullets_projetos_otimizados": [],
        "dicas_palavras_chave_ats": [],
        "curriculo_formatado_markdown": "# Perfil Geral",
    }

    with patch("app.services.otimizador.chamar_ia", return_value=mock_retorno_ia):
        payload = {
            "texto_curriculo": "Estudante de tecnologia",
            "dados_curriculo": {"skills": ["Python"]},
        }
        res = client.post("/gerar-curriculo-generico", json=payload)
        assert res.status_code == 200
        dados = res.json()
        assert dados.get("id") is not None

        adaptacao_id = dados["id"]
        # Limpa do banco
        client.delete(f"/adaptar-curriculo/{adaptacao_id}")


def test_upload_curriculo_propaga_localizacao_ao_buscador():
    """Garante que X-Localizacao informado na requisição chega ao buscador de vagas."""
    pdf_bytes_simulado = b"%PDF-1.4 Fake PDF Content for Unit Test with More than 50 characters of minimum text length required for passing validation successfully."

    with patch("app.services.curriculo.extrair_texto_pdf", return_value="Texto de teste de currículo de desenvolvedor com mais de cinquenta caracteres."), \
         patch("app.services.ia.analisar_curriculo", return_value={"skills": ["Python"], "cargo_objetivo": "Estagiário"}), \
         patch("app.services.avaliador.avaliar_curriculo", return_value={"nota_geral": 85, "pontos_fortes": [], "pontos_melhoria": []}), \
         patch("app.services.buscador.buscar_vagas_do_curriculo", return_value=[]) as mock_busca, \
         patch("app.services.matcher.calcular_compatibilidade_lote", return_value=[]):

        response = client.post(
            "/curriculo",
            files={"arquivo": ("curriculo.pdf", pdf_bytes_simulado, "application/pdf")},
            headers={"X-Localizacao": "Belo Horizonte"},
        )
        assert response.status_code == 200
        mock_busca.assert_called_once()
        _, kwargs = mock_busca.call_args
        assert kwargs.get("localizacao") == "Belo Horizonte"
