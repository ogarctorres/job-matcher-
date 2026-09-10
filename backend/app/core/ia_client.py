"""
Cliente centralizado de IA.
Suporta Gemini (cloud) e Ollama (local) com fallback automático.
"""

import json
import re
import time
import logging

from app.core.config import IA_PROVIDER, GEMINI_API_KEY, OLLAMA_MODEL

logger = logging.getLogger(__name__)


def extrair_json(texto_resposta: str) -> dict:
    """
    Tenta converter a resposta da IA em JSON, mesmo quando ela vem com
    pequenos erros de formatação ou texto extra ao redor.
    """
    texto = texto_resposta.strip()

    # Remove blocos de código markdown (```json ... ```), se existirem
    texto = re.sub(r"^```(?:json)?\s*", "", texto)
    texto = re.sub(r"\s*```$", "", texto)

    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        pass

    # Tenta extrair só o trecho entre a primeira { e a última }
    inicio = texto.find("{")
    fim = texto.rfind("}")

    if inicio != -1 and fim != -1 and fim > inicio:
        trecho = texto[inicio:fim + 1]
        try:
            return json.loads(trecho)
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Não foi possível interpretar a resposta da IA como JSON: {texto[:200]}")


def _chamar_gemini(prompt: str) -> str:
    """Chama a API do Google Gemini."""
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text


def _chamar_ollama(prompt: str) -> str:
    """Chama o Ollama local."""
    import ollama

    resposta = ollama.chat(
        model=OLLAMA_MODEL,
        messages=[{"role": "user", "content": prompt}],
        options={"num_predict": 1024, "num_ctx": 8192},
    )
    return resposta["message"]["content"]


def chamar_ia(prompt: str, tentativas: int = 3, espera_segundos: int = 2) -> dict:
    """
    Chama a IA configurada e retorna o JSON parseado.
    Tenta o provedor principal e, em caso de falha, tenta o fallback.
    """
    provedores = {
        "gemini": _chamar_gemini,
        "ollama": _chamar_ollama,
    }

    # Define ordem: provedor principal primeiro, depois o fallback
    principal = provedores.get(IA_PROVIDER, _chamar_gemini)
    fallback_nome = "ollama" if IA_PROVIDER == "gemini" else "gemini"
    fallback = provedores.get(fallback_nome)

    ultimo_erro = None

    for tentativa in range(1, tentativas + 1):
        try:
            texto_resposta = principal(prompt)
            return extrair_json(texto_resposta)
        except Exception as erro:
            ultimo_erro = erro
            logger.warning(f"[{IA_PROVIDER}] tentativa {tentativa}/{tentativas} falhou: {erro}")
            if tentativa < tentativas:
                time.sleep(espera_segundos)

    # Tenta o fallback uma vez
    if fallback:
        try:
            logger.info(f"[ia_client] Tentando fallback com {fallback_nome}...")
            texto_resposta = fallback(prompt)
            return extrair_json(texto_resposta)
        except Exception as erro_fallback:
            logger.warning(f"[{fallback_nome}] fallback também falhou: {erro_fallback}")

    raise ValueError(f"Falha após {tentativas} tentativas. Último erro: {ultimo_erro}")
