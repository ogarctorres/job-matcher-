import os
import sys
from dotenv import load_dotenv

load_dotenv()

# --- API Keys ---
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- Busca de vagas ---
PAIS = os.getenv("PAIS", "br")
LOCALIZACAO = os.getenv("LOCALIZACAO", "São Paulo")
DISTANCIA_KM = int(os.getenv("DISTANCIA_KM", "15"))

# --- CORS ---
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# --- Validação ---
_erros = []

if not ADZUNA_APP_ID:
    _erros.append("ADZUNA_APP_ID")
if not ADZUNA_APP_KEY:
    _erros.append("ADZUNA_APP_KEY")

if _erros:
    print(f"[config] ⚠️  Variáveis de ambiente faltando: {', '.join(_erros)}")
    print("[config] Copie .env.example para .env e preencha os valores.")