"""
Testes automatizados para o motor de Job Matching e Tailoring de Currículos.
Cobre os 5 cenários requeridos:
1. Vaga Backend Python
2. Vaga Dados / BI
3. Vaga Instituição Financeira / Fintech
4. Tecnologia não possuída pelo candidato (Zero-Hallucination & Detecção de GAPs)
5. Requisito eliminatório de formação (Dealbreaker / Inelegibilidade)
+ Testes de despacho de modo (Genérico vs Vaga Específica) e endpoints da API.
"""

from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.otimizador import (
    gerar_curriculo_generico,
    otimizar_curriculo_para_vaga,
    adaptar_curriculo,
)

client = TestClient(app)

PERFIL_CANDIDATO_BASE = {
    "skills": ["Python", "FastAPI", "SQL", "Pandas", "PostgreSQL", "Docker", "Git"],
    "cargo_objetivo": "Estágio em Desenvolvimento de Software / Dados",
    "resumo": "Estudante de Ciência da Computação com projetos práticos em Python e automação.",
}

TEXTO_CURRICULO_BASE = """
João Silva
Estudante de Ciência da Computação na USP (Previsão de Formatura: Dez/2026).
Competências: Python, FastAPI, SQL, PostgreSQL, Docker, Git, Pandas.
Experiência/Projetos:
- Desenvolveu API REST com FastAPI e PostgreSQL, reduzindo tempo de resposta de 40s para 3s.
- Criou pipelines de ETL em Python para extração de relatórios de dados.
"""


def test_dispatcher_modo_generico_quando_sem_descricao():
    """Se a descrição da vaga for vazia, deve executar o MODO 1 (Genérico ATS)."""
    with patch("app.services.otimizador.chamar_ia") as mock_ia:
        mock_ia.return_value = {
            "modo": "generico",
            "titulo_vaga_alvo": "Perfil Geral de Tecnologia",
            "resumo_otimizado": "Estudante de Ciência da Computação com experiência prática em Python.",
            "skills_priorizadas": ["Python", "FastAPI", "PostgreSQL"],
            "bullets_projetos_otimizados": [],
            "dicas_palavras_chave_ats": ["Utilize verbos de ação"],
            "curriculo_formatado_markdown": "# João Silva\n\n## Resumo...",
        }

        res = adaptar_curriculo(
            texto_curriculo=TEXTO_CURRICULO_BASE,
            dados_curriculo=PERFIL_CANDIDATO_BASE,
            descricao_vaga="",
        )

        assert res["modo"] == "generico"
        mock_ia.assert_called_once()
        prompt_enviado = mock_ia.call_args[0][0]
        assert "Geração de Currículo Genérico" in prompt_enviado or "MODO 1" in prompt_enviado or "Perfil Geral" in prompt_enviado


def test_dispatcher_modo_vaga_quando_com_descricao():
    """Se a descrição da vaga for fornecida, deve executar o MODO 2 (Job Matching Estratégico)."""
    with patch("app.services.otimizador.chamar_ia") as mock_ia:
        mock_ia.return_value = {
            "modo": "otimizado_para_vaga",
            "titulo_vaga_alvo": "Desenvolvedor Backend Python",
            "score_compatibilidade": 92,
            "alerta_eliminatorio": {"inelegivel": False, "motivo": "Nenhum impedimento"},
            "analise_match": {"requisitos_obrigatorios": [], "requisitos_desejaveis": [], "gaps": []},
            "resumo_otimizado": "Desenvolvedor focado em Python e APIs de alta performance.",
            "skills_priorizadas": ["Python", "FastAPI", "PostgreSQL"],
            "bullets_projetos_otimizados": [],
            "dicas_palavras_chave_ats": ["FastAPI", "Docker"],
            "curriculo_formatado_markdown": "# João Silva",
        }

        res = adaptar_curriculo(
            texto_curriculo=TEXTO_CURRICULO_BASE,
            dados_curriculo=PERFIL_CANDIDATO_BASE,
            descricao_vaga="Requisitos: Python, FastAPI, Docker e PostgreSQL.",
            titulo_vaga="Desenvolvedor Backend",
        )

        assert res["modo"] == "otimizado_para_vaga"
        mock_ia.assert_called_once()
        prompt_enviado = mock_ia.call_args[0][0]
        assert "Job Matching" in prompt_enviado
        assert "DETALHES DA VAGA ANUNCIADA" in prompt_enviado
        assert "Requisitos: Python, FastAPI" in prompt_enviado


def test_cenario_1_vaga_backend_python():
    """Cenário 1: Vaga de Backend Python enfatizando APIs, latência e bancos de dados."""
    descricao_vaga = """
    Vaga: Estágio / Júnior Backend Python
    Responsabilidades: Construir e otimizar APIs RESTful com FastAPI, banco de dados PostgreSQL e Docker.
    Requisitos: Python fluente, desenvolvimento de APIs, SQL, testes automatizados.
    """
    with patch("app.services.otimizador.chamar_ia") as mock_ia:
        mock_ia.return_value = {
            "modo": "otimizado_para_vaga",
            "titulo_vaga_alvo": "Estágio / Júnior Backend Python",
            "score_compatibilidade": 95,
            "alerta_eliminatorio": {"inelegivel": False, "motivo": "Critérios atendidos."},
            "analise_match": {
                "requisitos_obrigatorios": [
                    {"requisito": "Python fluente", "evidencia_no_perfil": "Python listado nas skills", "status": "MATCH"},
                    {"requisito": "FastAPI", "evidencia_no_perfil": "Projeto de API com FastAPI", "status": "MATCH"},
                    {"requisito": "PostgreSQL", "evidencia_no_perfil": "PostgreSQL no histórico", "status": "MATCH"}
                ],
                "requisitos_desejaveis": [],
                "gaps": []
            },
            "resumo_otimizado": "Desenvolvedor Backend com foco em APIs escaláveis com FastAPI e PostgreSQL.",
            "skills_priorizadas": ["FastAPI", "Python", "PostgreSQL", "Docker", "SQL"],
            "bullets_projetos_otimizados": [
                {
                    "foco": "API REST FastAPI",
                    "bullet_reescrito": "Desenvolveu API RESTful com FastAPI e PostgreSQL, otimizando queries e reduzindo tempo de resposta de 40s para 3s."
                }
            ],
            "dicas_palavras_chave_ats": ["FastAPI", "PostgreSQL", "Docker"],
            "curriculo_formatado_markdown": "# João Silva - Backend Python",
        }

        res = otimizar_curriculo_para_vaga(
            texto_curriculo=TEXTO_CURRICULO_BASE,
            dados_curriculo=PERFIL_CANDIDATO_BASE,
            descricao_vaga=descricao_vaga,
            titulo_vaga="Estágio Backend Python",
        )

        assert res["score_compatibilidade"] >= 90
        assert not res["alerta_eliminatorio"]["inelegivel"]
        assert "FastAPI" in res["skills_priorizadas"]
        # Verifica preservação de métrica real
        assert "40s para 3s" in res["bullets_projetos_otimizados"][0]["bullet_reescrito"]


def test_cenario_2_vaga_dados_bi():
    """Cenário 2: Vaga de Dados / BI deve priorizar Pandas, SQL, relatórios e ETL."""
    descricao_vaga = """
    Vaga: Estágio em Business Intelligence & Dados
    Requisitos: Python, manipulação de dados com Pandas, consultas SQL e geração de relatórios.
    Diferenciais: Power BI, pipelines de ETL.
    """
    with patch("app.services.otimizador.chamar_ia") as mock_ia:
        mock_ia.return_value = {
            "modo": "otimizado_para_vaga",
            "titulo_vaga_alvo": "Estágio em Business Intelligence & Dados",
            "score_compatibilidade": 88,
            "alerta_eliminatorio": {"inelegivel": False, "motivo": "Atende aos pré-requisitos."},
            "analise_match": {
                "requisitos_obrigatorios": [
                    {"requisito": "Pandas", "evidencia_no_perfil": "Pandas nas skills", "status": "MATCH"},
                    {"requisito": "SQL", "evidencia_no_perfil": "SQL e PostgreSQL", "status": "MATCH"}
                ],
                "requisitos_desejaveis": [
                    {"requisito": "Power BI", "evidencia_no_perfil": "Não encontrado", "status": "GAP"}
                ],
                "gaps": ["Power BI"]
            },
            "resumo_otimizado": "Estudante de Ciência da Computação com prática em análise de dados, ETL e consultas SQL em Python.",
            "skills_priorizadas": ["Pandas", "SQL", "Python", "PostgreSQL"],
            "bullets_projetos_otimizados": [
                {
                    "foco": "Pipelines de ETL",
                    "bullet_reescrito": "Implementou pipelines de ETL em Python e SQL para extração e consolidação de dados estruturados."
                }
            ],
            "dicas_palavras_chave_ats": ["ETL", "Pandas", "SQL", "Análise de Dados"],
            "curriculo_formatado_markdown": "# João Silva - Dados / BI",
        }

        res = otimizar_curriculo_para_vaga(
            texto_curriculo=TEXTO_CURRICULO_BASE,
            dados_curriculo=PERFIL_CANDIDATO_BASE,
            descricao_vaga=descricao_vaga,
            titulo_vaga="Estágio em Dados",
        )

        # Priorização de dados no topo
        assert res["skills_priorizadas"][0] in ["Pandas", "SQL", "Python"]
        assert "gaps" in res["analise_match"]
        assert "Power BI" in res["analise_match"]["gaps"]


def test_cenario_3_vaga_instituicao_financeira():
    """Cenário 3: Vaga em instituição financeira exige confiabilidade, resiliência e métricas reais."""
    descricao_vaga = """
    Vaga: Estágio em Engenharia de Software - Fintech / Banco
    Requisitos: Alta responsabilidade, precisão em dados, APIs de baixa latência e resiliência.
    """
    with patch("app.services.otimizador.chamar_ia") as mock_ia:
        mock_ia.return_value = {
            "modo": "otimizado_para_vaga",
            "titulo_vaga_alvo": "Estágio em Software - Fintech",
            "score_compatibilidade": 90,
            "alerta_eliminatorio": {"inelegivel": False, "motivo": "Critérios alinhados."},
            "analise_match": {"requisitos_obrigatorios": [], "requisitos_desejaveis": [], "gaps": []},
            "resumo_otimizado": "Desenvolvedor com experiência em sistemas de alta disponibilidade e otimização de latência em APIs.",
            "skills_priorizadas": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "bullets_projetos_otimizados": [
                {
                    "foco": "Otimização de Latência",
                    "bullet_reescrito": "Arquitetou otimização de consultas e rotas em FastAPI, reduzindo tempo de resposta de 40s para 3s com integridade transacional."
                }
            ],
            "dicas_palavras_chave_ats": ["Baixa latência", "Resiliência", "Transacionalidade"],
            "curriculo_formatado_markdown": "# João Silva",
        }

        res = otimizar_curriculo_para_vaga(
            texto_curriculo=TEXTO_CURRICULO_BASE,
            dados_curriculo=PERFIL_CANDIDATO_BASE,
            descricao_vaga=descricao_vaga,
            titulo_vaga="Estágio Fintech",
        )

        assert "40s para 3s" in res["bullets_projetos_otimizados"][0]["bullet_reescrito"]


def test_cenario_4_anti_alucinacao_tecnologia_nao_possui():
    """
    Cenário 4: REGRA CRÍTICA DE ANTI-ALUCINAÇÃO.
    Se a vaga exige tecnologia que o candidato NÃO possui (ex: VBA, Golang, Kubernetes):
    - A tecnologia NÃO DEVE constar em skills_priorizadas.
    - Ela DEVE ser listada explicitamente em analise_match.gaps.
    """
    descricao_vaga = """
    Vaga: Desenvolvedor Júnior
    Requisitos Obrigatórios: Domínio de Golang e automação com macros VBA. Conhecimento em Kubernetes.
    """
    with patch("app.services.otimizador.chamar_ia") as mock_ia:
        mock_ia.return_value = {
            "modo": "otimizado_para_vaga",
            "titulo_vaga_alvo": "Desenvolvedor Júnior",
            "score_compatibilidade": 45,
            "alerta_eliminatorio": {"inelegivel": False, "motivo": "Gaps técnicos relevantes"},
            "analise_match": {
                "requisitos_obrigatorios": [
                    {"requisito": "Golang", "evidencia_no_perfil": "Não encontrado", "status": "GAP"},
                    {"requisito": "VBA", "evidencia_no_perfil": "Não encontrado", "status": "GAP"}
                ],
                "requisitos_desejaveis": [
                    {"requisito": "Kubernetes", "evidencia_no_perfil": "Não encontrado", "status": "GAP"}
                ],
                "gaps": ["Golang", "VBA", "Kubernetes"]
            },
            "resumo_otimizado": "Estudante com forte base em Python e APIs, pronto para rápida assimilação de novas linguagens.",
            "skills_priorizadas": ["Python", "Docker", "SQL"],
            "bullets_projetos_otimizados": [],
            "dicas_palavras_chave_ats": ["Mencione facilidade de aprendizado em Go durante a entrevista"],
            "curriculo_formatado_markdown": "# João Silva",
        }

        res = otimizar_curriculo_para_vaga(
            texto_curriculo=TEXTO_CURRICULO_BASE,
            dados_curriculo=PERFIL_CANDIDATO_BASE,
            descricao_vaga=descricao_vaga,
            titulo_vaga="Desenvolvedor Júnior",
        )

        # GAPs devem conter as tecnologias faltantes
        assert "Golang" in res["analise_match"]["gaps"]
        assert "VBA" in res["analise_match"]["gaps"]
        assert "Kubernetes" in res["analise_match"]["gaps"]

        # ZERO ALUCINAÇÃO: As tecnologias faltantes NÃO podem estar nas skills do candidato!
        assert "Golang" not in res["skills_priorizadas"]
        assert "VBA" not in res["skills_priorizadas"]
        assert "Kubernetes" not in res["skills_priorizadas"]


def test_cenario_5_requisito_eliminatorio_formacao():
    """
    Cenário 5: DEALBREAKER / REQUISITO ELIMINATÓRIO DE FORMAÇÃO.
    Se a vaga exige janela estrita de formatura que o candidato não atende:
    - Deve sinalizar inelegivel: True
    - Deve conter alerta no formato '⚠️ POSSÍVEL INELEGIBILIDADE'
    - Deve penalizar severamente o score_compatibilidade (<= 60)
    """
    descricao_vaga = """
    Vaga: Programa de Estágio 2024
    REQUISITO ELIMINATÓRIO: Formatura estritamente entre Dezembro/2023 e Julho/2024.
    Local de trabalho presencial obrigatório em Manaus/AM.
    """
    with patch("app.services.otimizador.chamar_ia") as mock_ia:
        mock_ia.return_value = {
            "modo": "otimizado_para_vaga",
            "titulo_vaga_alvo": "Programa de Estágio 2024",
            "score_compatibilidade": 35,
            "alerta_eliminatorio": {
                "inelegivel": True,
                "motivo": "⚠️ POSSÍVEL INELEGIBILIDADE: Formatura prevista para Dez/2026, fora da janela obrigatória exigida (Jul/2024)."
            },
            "analise_match": {
                "requisitos_obrigatorios": [
                    {"requisito": "Formatura até Jul/2024", "evidencia_no_perfil": "Formatura Dez/2026", "status": "GAP"}
                ],
                "requisitos_desejaveis": [],
                "gaps": ["Janela de Formatura"]
            },
            "resumo_otimizado": "Estudante de Ciência da Computação com sólida formação prática.",
            "skills_priorizadas": ["Python", "SQL"],
            "bullets_projetos_otimizados": [],
            "dicas_palavras_chave_ats": [],
            "curriculo_formatado_markdown": "# João Silva",
        }

        res = otimizar_curriculo_para_vaga(
            texto_curriculo=TEXTO_CURRICULO_BASE,
            dados_curriculo=PERFIL_CANDIDATO_BASE,
            descricao_vaga=descricao_vaga,
            titulo_vaga="Programa de Estágio 2024",
        )

        assert res["alerta_eliminatorio"]["inelegivel"] is True
        assert "POSSÍVEL INELEGIBILIDADE" in res["alerta_eliminatorio"]["motivo"]
        assert res["score_compatibilidade"] <= 60


def test_endpoint_adaptar_curriculo_api_sucesso():
    """Testa endpoint HTTP POST /adaptar-curriculo."""
    with patch("app.services.otimizador.chamar_ia") as mock_ia:
        mock_ia.return_value = {
            "modo": "otimizado_para_vaga",
            "titulo_vaga_alvo": "Dev Python",
            "score_compatibilidade": 85,
            "alerta_eliminatorio": {"inelegivel": False, "motivo": "Ok"},
            "analise_match": {"gaps": []},
            "resumo_otimizado": "Resumo...",
            "skills_priorizadas": ["Python"],
            "bullets_projetos_otimizados": [],
            "dicas_palavras_chave_ats": [],
            "curriculo_formatado_markdown": "# Markdown",
        }

        response = client.post("/adaptar-curriculo", json={
            "texto_curriculo": TEXTO_CURRICULO_BASE,
            "dados_curriculo": PERFIL_CANDIDATO_BASE,
            "descricao_vaga": "Vaga Python Júnior",
            "titulo_vaga": "Dev Python",
        })

        assert response.status_code == 200
        data = response.json()
        assert data["modo"] == "otimizado_para_vaga"
        assert data["score_compatibilidade"] == 85


def test_endpoint_gerar_curriculo_generico_api():
    """Testa endpoint HTTP POST /gerar-curriculo-generico."""
    with patch("app.services.otimizador.chamar_ia") as mock_ia:
        mock_ia.return_value = {
            "modo": "generico",
            "titulo_vaga_alvo": "Perfil Geral de Tecnologia",
            "resumo_otimizado": "Resumo factual...",
            "skills_priorizadas": ["Python", "SQL"],
            "bullets_projetos_otimizados": [],
            "dicas_palavras_chave_ats": [],
            "curriculo_formatado_markdown": "# Markdown Geral",
        }

        response = client.post("/gerar-curriculo-generico", json={
            "texto_curriculo": TEXTO_CURRICULO_BASE,
            "dados_curriculo": PERFIL_CANDIDATO_BASE,
        })

        assert response.status_code == 200
        data = response.json()
        assert data["modo"] == "generico"
