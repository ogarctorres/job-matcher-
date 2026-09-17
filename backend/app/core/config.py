import os
import sys
from dotenv import load_dotenv

load_dotenv()


# --- API Keys ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
JOOBLE_API_KEY = os.getenv("JOOBLE_API_KEY", "")
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "")

# --- IA ---
IA_PROVIDER = os.getenv("IA_PROVIDER", "gemini")  # "gemini" ou "ollama"
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
GEMINI_MODEL_FALLBACK = os.getenv("GEMINI_MODEL_FALLBACK", "gemini-3.1-flash-lite")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
IA_TIMEOUT_SEGUNDOS = int(os.getenv("IA_TIMEOUT_SEGUNDOS", "30"))

# --- Busca de vagas ---
PAIS = os.getenv("PAIS", "br")
LOCALIZACAO = os.getenv("LOCALIZACAO", "São Paulo")
DISTANCIA_KM = int(os.getenv("DISTANCIA_KM", "15"))

# --- CORS ---
DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
CORS_ORIGINS = [origem.strip() for origem in CORS_ORIGINS_RAW.split(",") if origem.strip()]

# --- Upload ---
TAMANHO_MAXIMO_MB = int(os.getenv("TAMANHO_MAXIMO_MB", "8"))


def validar_config():
    """Valida configurações obrigatórias no startup."""
    avisos = []

    if IA_PROVIDER == "gemini" and not GEMINI_API_KEY:
        avisos.append("GEMINI_API_KEY não configurada. Defina no .env ou mude IA_PROVIDER para 'ollama'.")

    if avisos:
        for aviso in avisos:
            print(f"[config] ⚠️  {aviso}")
        print("[config] Copie .env.example para .env e preencha os valores.")
