"""
Job Matcher API — Ponto de entrada da aplicação.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS, validar_config
from app.routes.curriculo import router as curriculo_router

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


@app.get("/")
def raiz():
    return {"mensagem": "Job Matcher API v2.0 rodando! 🚀"}
