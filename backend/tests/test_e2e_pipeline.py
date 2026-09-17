"""Teste de integracao Ponta a Ponta (E2E Pipeline) - Etapa 12 do Roadmap Vektor."""

import io
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.analise import Analise, CurriculoAdaptado

client = TestClient(app)


def test_pipeline_completo_upload_diagnostico_matching_adaptacao_e_limpeza():
    """Executa o ciclo de vida completo de uma aplicacao de estagio no Vektor."""

    # 1. Simular arquivo PDF valido de estagio
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"

    texto_cv_mock = (
        "Mariana Costa\n"
        "São Paulo, SP | mariana@email.com\n"
        "Bacharelado em Engenharia de Software - USP (Conclusão 12/2026)\n"
        "Competências: Python, FastAPI, SQL, Git, Docker\n"
        "Projetos: Desenvolvimento de APIs backend em Python e FastAPI com SQL."
    )

    mock_ia_extracao = {
        "nome": "Mariana Costa",
        "email": "mariana.costa@email.com",
        "telefone": "(11) 97654-3210",
        "cidade": "Sao Paulo",
        "estado": "SP",
        "cargo_objetivo": "Estagio em Engenharia de Software",
        "nivel": "Estagio",
        "resumo": "Estudante de Engenharia de Software com projetos em Python, FastAPI e bancos relacionais.",
        "skills": ["Python", "FastAPI", "SQL", "Git", "Docker"],
        "formacao": "Bacharelado em Engenharia de Software — USP (Previsao: 12/2026)",
        "previsao_formatura": "12/2026",
        "termo_busca_vaga": "estagio backend python",
    }

    mock_ia_avaliacao = {
        "nota_geral": 85.0,
        "pontos_fortes": ["Stack moderna e coerente.", "Formacao em instituicao de ponta."],
        "pontos_melhoria": ["Adicionar testes automatizados ao curriculo."],
        "comentario_geral": "Candidata muito promissora para posicoes de estagio.",
    }

    vaga_teste = {
        "titulo": "Estagio em Backend Python",
        "empresa": "Fintech Alpha",
        "localizacao": "Sao Paulo, SP",
        "descricao": "Vaga de estagio em tecnologia. Requisitos: cursando TI, Python e SQL. Desejavel Docker e Git. Conclusao prevista ate 2027.",
        "link": "https://linkedin.com/jobs/123",
        "score": 90,
        "explicacao_score": "Compatibilidade alta com a stack exigida.",
    }

    # STEP 1: Upload e extracao automatizada com integracao ao banco
    with patch("app.routes.curriculo.curriculo.extrair_texto_pdf", return_value=texto_cv_mock), \
         patch("app.routes.curriculo.ia.analisar_curriculo", return_value=mock_ia_extracao), \
         patch("app.routes.curriculo.avaliador.avaliar_curriculo", return_value=mock_ia_avaliacao), \
         patch("app.routes.curriculo.buscador.buscar_vagas_do_curriculo", return_value=[vaga_teste]), \
         patch("app.routes.curriculo.matcher.calcular_compatibilidade_lote", return_value=[vaga_teste]):

        arquivo_upload = ("curriculo_mariana.pdf", io.BytesIO(pdf_bytes), "application/pdf")
        resp_upload = client.post(
            "/curriculo",
            files={"arquivo": arquivo_upload},
            data={"localizacao": "Sao Paulo, SP"},
        )

        assert resp_upload.status_code == 200
        dados_upload = resp_upload.json()
        analise_id = dados_upload["id"]
        assert analise_id is not None
        assert dados_upload["dados_curriculo"]["nome"] == "Mariana Costa"
        assert len(dados_upload["vagas_encontradas"]) >= 1

    # STEP 2: Verificacao de persistencia no Historico
    resp_hist = client.get("/historico/")
    assert resp_hist.status_code == 200
    ids_historico = [item["id"] for item in resp_hist.json()]
    assert analise_id in ids_historico

    # STEP 3: Otimizacao cirurgica de curriculo (Job Matching) com protecao anti-alucinacao
    mock_resposta_ia_adaptador = {
        "modo": "otimizado_para_vaga",
        "titulo_vaga_alvo": vaga_teste["titulo"],
        "score_compatibilidade": 88,
        "alerta_eliminatorio": {"inelegivel": False, "motivo": "Ok"},
        "resumo_otimizado": "Estudante de Engenharia com foco em servicos backend Python e Docker.",
        "skills_priorizadas": ["Python", "SQL", "Docker", "Git", "Kubernetes"],  # Kubernetes eh ALUCINADA
        "bullets_projetos_otimizados": [
            "Desenvolveu APIs RESTful utilizando FastAPI e banco SQL.",
            "Conteinerizou aplicacoes com Docker garantindo consistencia em desenvolvimento.",
        ],
        "analise_match": {
            "pontos_fortes": ["Python e SQL declarados."],
            "gaps": ["Nao possui Kubernetes."],
            "diferenciais_atendidos": ["Docker"],
            "requisitos_faltantes": [],
        },
        "dicas_palavras_chave_ats": ["FastAPI", "Docker", "SQL"],
        "curriculo_formatado_markdown": "# Mariana Costa\n\n## Resumo\nEstudante de Engenharia...",
    }

    with patch("app.services.otimizador.chamar_ia", return_value=mock_resposta_ia_adaptador):
        payload_adaptar = {
            "analise_id": analise_id,
            "texto_curriculo": texto_cv_mock,
            "dados_curriculo": dados_upload["dados_curriculo"],
            "descricao_vaga": vaga_teste["descricao"],
            "titulo_vaga": vaga_teste["titulo"],
            "empresa": vaga_teste["empresa"],
        }

        resp_adaptar = client.post("/adaptar-curriculo", json=payload_adaptar)
        assert resp_adaptar.status_code == 200
        dados_adaptados = resp_adaptar.json()

        # Validacao do Trust Layer Anti-Alucinacao: Kubernetes deve ter sido PURGADO de skills_priorizadas
        assert "Kubernetes" not in dados_adaptados["skills_priorizadas"]
        assert "Python" in dados_adaptados["skills_priorizadas"]

        # Validacao do Match Engine Deterministo e Auditavel
        assert "memoria_calculo" in dados_adaptados
        assert "score_final" in dados_adaptados["memoria_calculo"]
        assert dados_adaptados["memoria_calculo"]["score_final"] > 0

        # Validacao da Geracao de Markdown e Bullet Points
        assert len(dados_adaptados["bullets_projetos_otimizados"]) >= 2
        assert "FastAPI" in dados_adaptados["bullets_projetos_otimizados"][0]
        assert "curriculo_formatado_markdown" in dados_adaptados

    # STEP 4: Verificacao da persistencia de CurriculoAdaptado no SQLite
    resp_recuperar = client.get(f"/adaptar-curriculo/historico/{analise_id}")
    assert resp_recuperar.status_code == 200
    adaptacoes_salvas = resp_recuperar.json()
    assert len(adaptacoes_salvas) >= 1
    assert adaptacoes_salvas[0]["titulo_vaga"] == vaga_teste["titulo"]

    # STEP 5: Limpeza e exclusao (Cascade Delete)
    resp_del = client.delete(f"/historico/{analise_id}")
    assert resp_del.status_code == 200

    # Certificar no banco que a analise e adaptacoes filhas foram removidas em cascata
    db = SessionLocal()
    try:
        assert db.query(Analise).filter(Analise.id == analise_id).first() is None
        assert db.query(CurriculoAdaptado).filter(CurriculoAdaptado.analise_id == analise_id).first() is None
    finally:
        db.close()
