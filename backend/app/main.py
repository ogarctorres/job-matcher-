"""
Job Matcher API — Ponto de entrada da aplicação.
"""

import os
import time
import logging
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from app.core.config import CORS_ORIGINS, validar_config
from app.core.constantes import VERSAO_SISTEMA
from app.routes.curriculo import router as curriculo_router
from app.routes.historico import router as historico_router
from app.routes.estatisticas import router as estatisticas_router
from app.routes.carta import router as carta_router
from app.routes.tendencias import router as tendencias_router
from app.routes.health import router as health_router
from app.routes.adaptador import router as adaptador_router
from app.routes.vagas import router as vagas_router
from app.routes.desafios import router as desafios_router
from app.routes.roadmap import router as roadmap_router
from app.database import criar_tabelas
from app.models import Analise  # noqa: F401 — registra modelos no SQLAlchemy

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# Validar configuração
validar_config()

# Criar app
app = FastAPI(
    title="Vektor API",
    description="Plataforma de Inteligência de Vagas e Carreira com IA.",
    version=VERSAO_SISTEMA,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Middleware de Cabeçalhos de Segurança HTTP (Clickjacking & Content Sniffing)
# ---------------------------------------------------------------------------
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response


# ---------------------------------------------------------------------------
# Middleware de Proteção contra Bruteforce e DoS (Rate Limiting Granular por IP)
# ---------------------------------------------------------------------------
MAX_REQ_GERAL_MINUTO = 60
MAX_REQ_IA_MINUTO = 5  # Limite rígido para rotas de alto custo computacional/IA

_historico_ip_geral: dict[str, list[float]] = defaultdict(list)
_historico_ip_ia: dict[str, list[float]] = defaultdict(list)

ROTAS_IA_PESADAS = {"/curriculo", "/adaptar-curriculo", "/gerar-curriculo-generico", "/carta", "/roadmap/gerar"}

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    agora = time.time()
    # Extrai o IP de origem considerando proxies reversos de produção (Render / Cloudflare)
    encaminhado = request.headers.get("x-forwarded-for")
    client_ip = (
        encaminhado.split(",")[0].strip()
        if encaminhado
        else (request.client.host if request.client else "127.0.0.1")
    )

    # Isenta rotas estáticas, healthchecks e execução de testes automatizados (testclient)
    if (
        os.getenv("TESTING") == "1"
        or client_ip in ["testclient", "testserver"]
        or request.url.path in ["/", "/health", "/docs", "/openapi.json"]
    ):
        return await call_next(request)

    # 1. Proteção de Cota de IA (Prevenção de Financial DoS)
    if request.url.path in ROTAS_IA_PESADAS and request.method == "POST":
        ts_ia = [t for t in _historico_ip_ia[client_ip] if agora - t < 60]
        _historico_ip_ia[client_ip] = ts_ia
        if len(ts_ia) >= MAX_REQ_IA_MINUTO:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Limite de operações de IA excedido (máx {MAX_REQ_IA_MINUTO} requisições/min). Aguarde 1 minuto."
                },
                headers={"Retry-After": "60"},
            )
        _historico_ip_ia[client_ip].append(agora)

    # 2. Rate Limiting Geral da API
    ts_geral = [t for t in _historico_ip_geral[client_ip] if agora - t < 60]
    _historico_ip_geral[client_ip] = ts_geral

    if len(ts_geral) >= MAX_REQ_GERAL_MINUTO:
        return JSONResponse(
            status_code=429,
            content={
                "detail": f"Limite de requisições excedido (máx {MAX_REQ_GERAL_MINUTO} req/min). Aguarde um instante."
            },
            headers={"Retry-After": "60"},
        )

    _historico_ip_geral[client_ip].append(agora)
    return await call_next(request)


# Rotas
app.include_router(curriculo_router)
app.include_router(historico_router)
app.include_router(estatisticas_router)
app.include_router(carta_router)
app.include_router(tendencias_router)
app.include_router(health_router)
app.include_router(adaptador_router)
app.include_router(vagas_router)
app.include_router(desafios_router)
app.include_router(roadmap_router)


# Startup
@app.on_event("startup")
def startup():
    criar_tabelas()
    logging.getLogger(__name__).info("Banco de dados inicializado ✅")


@app.get("/")
def raiz():
    return {"mensagem": "Vektor API v2.0 rodando! 🚀"}
