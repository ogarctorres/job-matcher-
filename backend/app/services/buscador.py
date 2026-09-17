"""Busca de vagas de emprego usando múltiplas fontes."""

import logging
import requests

from app.core.config import LOCALIZACAO

logger = logging.getLogger(__name__)


def buscar_vagas(termo: str, localizacao: str = None) -> list[dict]:
    """
    Busca vagas reais de estágio usando a API pública do Google Jobs
    via SerpAPI-like approach, com fallback para busca alternativa.
    """
    loc = localizacao or LOCALIZACAO
    vagas = _buscar_via_jooble(termo, loc)

    if not vagas:
        logger.warning("[buscador] Jooble não retornou vagas, tentando fonte alternativa...")
        vagas = _buscar_via_adzuna_fallback(termo)

    return vagas


def _buscar_via_jooble(termo: str, localizacao: str) -> list[dict]:
    """Busca vagas via API pública do Jooble (sem chave necessária)."""
    url = "https://br.jooble.org/api/"

    # A Jooble oferece uma API gratuita para desenvolvedores
    # Registre em https://br.jooble.org/api/about para obter a chave
    import os
    jooble_key = os.getenv("JOOBLE_API_KEY", "")

    if not jooble_key:
        logger.info("[buscador] JOOBLE_API_KEY não configurada, pulando Jooble")
        return []

    try:
        payload = {
            "keywords": termo,
            "location": localizacao,
            "page": 1,
        }
        resposta = requests.post(
            f"{url}{jooble_key}",
            json=payload,
            timeout=10,
        )
        dados = resposta.json()

        vagas = []
        for job in dados.get("jobs", [])[:10]:
            vagas.append({
                "titulo": job.get("title", "Sem título"),
                "empresa": job.get("company", "Empresa não informada"),
                "descricao": job.get("snippet", ""),
                "link": job.get("link", ""),
                "localizacao": job.get("location", ""),
                "salario": job.get("salary", ""),
                "data_publicacao": job.get("updated", ""),
            })
        return vagas

    except Exception as erro:
        logger.error(f"[buscador] Erro ao buscar no Jooble: {erro}")
        return []


def _buscar_via_adzuna_fallback(termo: str) -> list[dict]:
    """Fallback: busca na Adzuna se configurada."""
    import os
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")

    if not app_id or not app_key:
        return []

    try:
        from app.core.config import PAIS, DISTANCIA_KM
        url = f"https://api.adzuna.com/v1/api/jobs/{PAIS}/search/1"
        parametros = {
            "app_id": app_id,
            "app_key": app_key,
            "what": termo,
            "where": LOCALIZACAO,
            "distance": DISTANCIA_KM,
            "results_per_page": 10,
        }

        resposta = requests.get(url, params=parametros, timeout=10)
        dados = resposta.json()

        vagas = []
        for vaga in dados.get("results", []):
            vagas.append({
                "titulo": vaga.get("title", "Sem título"),
                "empresa": vaga.get("company", {}).get("display_name", "Empresa não informada"),
                "descricao": vaga.get("description", ""),
                "link": vaga.get("redirect_url", ""),
                "localizacao": vaga.get("location", {}).get("display_name", ""),
                "salario": "",
                "data_publicacao": vaga.get("created", ""),
            })
        return vagas

    except Exception as erro:
        logger.error(f"[buscador] Erro no fallback Adzuna: {erro}")
        return []


def buscar_vagas_do_curriculo(dados_curriculo: dict, localizacao: str = None) -> list[dict]:
    """Busca vagas baseado nos dados extraídos do currículo e localização regional."""
    termo_busca_bruto = dados_curriculo.get("termo_busca_vaga", "estagio ti")
    primeiro_termo = termo_busca_bruto.split(",")[0].strip()
    termo_busca = f"estágio {primeiro_termo}"

    return buscar_vagas(termo_busca, localizacao=localizacao)
