"""
Job Matcher API — Ponto de entrada da aplicação.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


# Startup
@app.on_event("startup")
def startup():
    criar_tabelas()
    logging.getLogger(__name__).info("Banco de dados inicializado ✅")


@app.get("/")
def raiz():
    return {"mensagem": "Vektor API v2.0 rodando! 🚀"}
