import os
import sys
from dotenv import load_dotenv

load_dotenv()


# --- API Keys ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- Busca de vagas ---
PAIS = os.getenv("PAIS", "br")
LOCALIZACAO = os.getenv("LOCALIZACAO", "São Paulo")
DISTANCIA_KM = int(os.getenv("DISTANCIA_KM", "15"))

# --- CORS ---
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# --- IA ---
IA_PROVIDER = os.getenv("IA_PROVIDER", "gemini")  # "gemini" ou "ollama"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

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
