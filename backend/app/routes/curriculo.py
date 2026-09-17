"""Rotas de análise de currículo."""

import logging
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, HTTPException, Depends, Header, Form
from sqlalchemy.orm import Session

from app.core.config import TAMANHO_MAXIMO_MB
from app.database import get_db
from app.models.analise import Analise
from app.services import curriculo, ia, avaliador, buscador, matcher

logger = logging.getLogger(__name__)
router = APIRouter()


class SugestaoRequest(BaseModel):
    dados_curriculo: dict
    vaga: dict


@router.post("/curriculo")
async def enviar_curriculo(
    arquivo: UploadFile,
    localizacao: Optional[str] = Form(None),
    x_localizacao: Optional[str] = Header(None, alias="X-Localizacao"),
    db: Session = Depends(get_db)
):
    """Recebe um PDF de currículo, analisa com IA e busca vagas compatíveis."""

    # 1. Validar tipo MIME informado no cabeçalho
    if arquivo.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Envie um arquivo em PDF. Formato recebido: " + str(arquivo.content_type),
        )

    # 2. Leitura em chunks com limite estrito de memória para proteção contra DoS
    limite_bytes = TAMANHO_MAXIMO_MB * 1024 * 1024
    chunks = []
    tamanho_total = 0

    while True:
        chunk = await arquivo.read(64 * 1024)
        if not chunk:
            break
        tamanho_total += len(chunk)
        if tamanho_total > limite_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"Arquivo muito grande. O limite máximo permitido é de {TAMANHO_MAXIMO_MB}MB.",
            )
        chunks.append(chunk)

    conteudo = b"".join(chunks)

    # 3. Validar assinatura binária do arquivo (Magic Numbers %PDF-)
    if not conteudo.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="O arquivo enviado não é um documento PDF válido (cabeçalho de arquivo inválido).",
        )

    # 4. Extrair texto de forma protegida
    try:
        texto = curriculo.extrair_texto_pdf(conteudo)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Não conseguimos ler esse PDF. Ele pode estar corrompido ou protegido por senha.",
        )

    if not texto or len(texto.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Não encontramos texto suficiente nesse PDF. Ele pode ser uma imagem escaneada.",
        )

    # Analisar com IA
    try:
        dados_estruturados = ia.analisar_curriculo(texto)
    except Exception as erro:
        logger.error(f"Erro na análise do currículo: {erro}")
        raise HTTPException(
            status_code=502,
            detail="A IA não respondeu corretamente. Tente novamente.",
        )

    # Avaliar currículo
    try:
        avaliacao = avaliador.avaliar_curriculo(texto)
    except Exception as erro:
        logger.warning(f"Erro na avaliação: {erro}")
        avaliacao = {
            "nota_geral": 0,
            "pontos_fortes": [],
            "pontos_melhoria": [],
            "comentario_geral": "Não foi possível gerar a avaliação dessa vez.",
        }

    # Buscar vagas
    loc_efetiva = (localizacao or x_localizacao or "").strip() or None
    try:
        vagas_encontradas = buscador.buscar_vagas_do_curriculo(dados_estruturados, localizacao=loc_efetiva)
    except Exception as erro:
        logger.warning(f"Erro na busca de vagas: {erro}")
        vagas_encontradas = []

    # Calcular compatibilidade em LOTE (1 única chamada rápida ao invés de loop N+1)
    if vagas_encontradas:
        try:
            vagas_encontradas = matcher.calcular_compatibilidade_lote(dados_estruturados, vagas_encontradas)
        except Exception as erro:
            logger.warning(f"Erro no matching em lote: {erro}")
            for vaga in vagas_encontradas:
                vaga["score"] = 50
                vaga["explicacao_score"] = "Compatibilidade estimada para estágio."

    vagas_encontradas.sort(key=lambda v: v.get("score", 0), reverse=True)

    # Salvar no banco
    try:
        analise = Analise(
            texto_curriculo=texto,
            nota_geral=avaliacao.get("nota_geral", 0),
        )
        analise.dados_curriculo = dados_estruturados
        analise.avaliacao = avaliacao
        analise.vagas = vagas_encontradas
        db.add(analise)
        db.commit()
        db.refresh(analise)
        analise_id = analise.id
        logger.info(f"Análise #{analise_id} salva no banco")
    except Exception as erro:
        logger.warning(f"Erro ao salvar no banco: {erro}")
        db.rollback()
        analise_id = None

    return {
        "id": analise_id,
        "dados_curriculo": dados_estruturados,
        "avaliacao": avaliacao,
        "vagas_encontradas": vagas_encontradas,
    }


@router.get("/curriculo/demo")
def obter_curriculo_demo(db: Session = Depends(get_db)):
    """Retorna um perfil de demonstração completo (Lucas Mendes - Ciência da Computação) e persiste no histórico."""
    texto_cv = """
    LUCAS MENDES
    São Paulo, SP | lucas.mendes@email.com | (11) 98765-4321 | linkedin.com/in/lucas-mendes-dev

    OBJETIVO
    Estágio em Desenvolvimento Backend / Engenharia de Software

    FORMAÇÃO
    Bacharelado em Ciência da Computação — Universidade Presbiteriana Mackenzie
    Previsão de conclusão: Dezembro de 2026 (4º semestre)

    COMPETÊNCIAS TÉCNICAS
    • Linguagens & Frameworks: Python (FastAPI, Flask, Django), SQL, JavaScript
    • Bancos de Dados: PostgreSQL, MySQL, SQLite, Redis
    • Ferramentas & Práticas: Git, GitHub, Docker, APIs RESTful, Testes Unitários (pytest), CI/CD

    PROJETOS PRÁTICOS
    API de Gestão de Tarefas & Microsserviços (Python / FastAPI / Docker)
    • Desenvolveu API RESTful com autenticação JWT, documentação Swagger automática e banco PostgreSQL conteinerizado.
    • Implementou cobertura de testes unitários superior a 85% utilizando pytest e GitHub Actions.

    Sistema de Monitoramento de Preços (Python / BeautifulSoup / SQLite)
    • Desenvolveu web scraper para coletar variações de preços de e-commerce e enviar alertas automatizados via Telegram Bot.
    """

    dados_estruturados = {
        "nome": "Lucas Mendes",
        "email": "lucas.mendes@email.com",
        "telefone": "(11) 98765-4321",
        "cidade": "São Paulo",
        "estado": "SP",
        "cargo_objetivo": "Estágio em Desenvolvimento Backend",
        "nivel": "Estágio",
        "resumo": "Estudante de Ciência da Computação com sólida base em desenvolvimento backend com Python, APIs RESTful e bancos relacionais. Prática em projetos pessoais com FastAPI, Docker e testes automatizados.",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git", "REST APIs", "pytest", "SQL", "Redis"],
        "formacao": "Ciência da Computação — Mackenzie (Previsão: 12/2026)",
        "previsao_formatura": "12/2026",
        "termo_busca_vaga": "estágio backend python",
    }

    avaliacao = {
        "nota_geral": 88.0,
        "pontos_fortes": [
            "Excelente especificação de stack moderna de backend (FastAPI, Docker, PostgreSQL).",
            "Métricas concretas em projetos pessoais (cobertura de testes > 85%, autenticação JWT).",
            "Clareza de objetivo profissional e compatibilidade estrita com estágio em tecnologia."
        ],
        "pontos_melhoria": [
            "Adicionar menção a mensageria assíncrona ou background jobs (RabbitMQ ou Celery).",
            "Destacar vivência com cloud computing básica (AWS EC2 ou GCP Cloud Run)."
        ],
        "comentario_geral": "Perfil altamente competitivo para estágio em engenharia de software e backend. Projetos bem estruturados com evidências de boas práticas de desenvolvimento."
    }

    vagas_encontradas = [
        {
            "titulo": "Estágio em Engenharia de Software (Python / FastAPI)",
            "empresa": "Fintech Vektor Labs",
            "localizacao": "São Paulo, SP (Híbrido)",
            "descricao": "Buscamos estudante de Ciência da Computação ou Engenharia de Software com interesse em desenvolvimento backend. Requisitos: conhecimento em Python, APIs RESTful, SQL e Git. Diferenciais: Docker e testes automatizados.",
            "link": "https://linkedin.com",
            "score": 92,
            "explicacao_score": "Altíssima compatibilidade: domina todas as tecnologias mandatórias (Python, FastAPI, SQL) e possui diferenciais em Docker e pytest."
        },
        {
            "titulo": "Estágio em Backend Developer",
            "empresa": "TechCorp Soluções",
            "localizacao": "São Paulo, SP (Remoto)",
            "descricao": "Oportunidade para atuar no time de APIs e microsserviços. Requisitos: Python ou Node.js, banco de dados relacional e controle de versão Git.",
            "link": "https://jooble.org",
            "score": 85,
            "explicacao_score": "Forte alinhamento com a stack de backend solicitada e formação acadêmica adequada."
        },
        {
            "titulo": "Estágio em Engenharia de Dados",
            "empresa": "DataPulse Analytics",
            "localizacao": "São Paulo, SP (Híbrido)",
            "descricao": "Atuação na criação de pipelines ETL. Requisitos: lógica de programação sólida, Python e manipulação de bancos SQL.",
            "link": "https://adzuna.com",
            "score": 74,
            "explicacao_score": "Boa base em Python e SQL para transição e aprendizado de pipelines ETL."
        }
    ]

    try:
        analise = Analise(
            texto_curriculo=texto_cv.strip(),
            nota_geral=88.0,
        )
        analise.dados_curriculo = dados_estruturados
        analise.avaliacao = avaliacao
        analise.vagas = vagas_encontradas
        db.add(analise)
        db.commit()
        db.refresh(analise)
        analise_id = analise.id
    except Exception as erro:
        logger.warning(f"Erro ao salvar perfil demo: {erro}")
        db.rollback()
        analise_id = None

    return {
        "id": analise_id,
        "dados_curriculo": dados_estruturados,
        "avaliacao": avaliacao,
        "vagas_encontradas": vagas_encontradas,
        "demo": True,
    }


@router.post("/sugestao-vaga")
async def gerar_sugestao(dados: SugestaoRequest):
    """Gera sugestões de como melhorar o currículo para uma vaga."""
    from app.services import sugestoes

    try:
        resultado = sugestoes.sugerir_melhorias(dados.dados_curriculo, dados.vaga)
    except Exception as erro:
        logger.error(f"Erro na sugestão: {erro}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível gerar sugestões agora. Tente novamente.",
        )

    return resultado
