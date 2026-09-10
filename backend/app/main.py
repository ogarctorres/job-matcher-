"""
Job Matcher API — Ponto de entrada da aplicação.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS, validar_config
from app.routes.curriculo import router as curriculo_router
from app.routes.historico import router as historico_router
from app.routes.estatisticas import router as estatisticas_router
from app.routes.carta import router as carta_router
from app.routes.tendencias import router as tendencias_router
from app.routes.health import router as health_router
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
    title="Job Matcher API",
    description="Analisa currículos com IA e encontra vagas compatíveis.",
    version="2.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(curriculo_router)
app.include_router(historico_router)
app.include_router(estatisticas_router)
app.include_router(carta_router)
app.include_router(tendencias_router)
app.include_router(health_router)


# Startup
@app.on_event("startup")
def startup():
    criar_tabelas()
    logging.getLogger(__name__).info("Banco de dados inicializado ✅")


@app.get("/")
def raiz():
    return {"mensagem": "Job Matcher API v2.0 rodando! 🚀"}
