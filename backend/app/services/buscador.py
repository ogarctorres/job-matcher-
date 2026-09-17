"""Busca de vagas de emprego usando múltiplas fontes com cache LRU/TTL."""

import logging
import time
from threading import Lock
from collections import OrderedDict
import requests

from app.core.config import LOCALIZACAO

logger = logging.getLogger(__name__)


class CacheVagasTTL:
    """Cache em memória thread-safe com TTL e limite LRU para consultas de vagas."""

    def __init__(self, maxsize: int = 256, ttl_seconds: int = 3600):
        self.maxsize = maxsize
        self.ttl_seconds = ttl_seconds
        self._cache = OrderedDict()
        self._lock = Lock()

    def _gerar_chave(self, termo: str, localizacao: str = None) -> tuple[str, str]:
        t = (termo or "").strip().lower()
        loc = (localizacao or "").strip().lower()
        return (t, loc)

    def obter(self, termo: str, localizacao: str = None) -> list[dict] | None:
        chave = self._gerar_chave(termo, localizacao)
        with self._lock:
            if chave not in self._cache:
                return None
            itens, timestamp = self._cache[chave]
            if time.time() - timestamp > self.ttl_seconds:
                del self._cache[chave]
                return None
            self._cache.move_to_end(chave)
            return [dict(v) for v in itens]

    def salvar(self, termo: str, localizacao: str, vagas: list[dict]) -> None:
        chave = self._gerar_chave(termo, localizacao)
        with self._lock:
            if chave in self._cache:
                del self._cache[chave]
            elif len(self._cache) >= self.maxsize:
                self._cache.popitem(last=False)
            self._cache[chave] = ([dict(v) for v in vagas], time.time())

    def limpar(self) -> None:
        with self._lock:
            self._cache.clear()

    def tamanho(self) -> int:
        with self._lock:
            return len(self._cache)


# Instância global de cache de vagas (1 hora de TTL)
cache_vagas = CacheVagasTTL(maxsize=256, ttl_seconds=3600)


def buscar_vagas(termo: str, localizacao: str = None) -> list[dict]:
    """
    Busca vagas reais de estágio usando cache LRU/TTL, com chamadas às APIs públicas
    do Jooble e fallback Adzuna quando necessário.
    """
    loc = localizacao or LOCALIZACAO

    # 1. Consultar cache em memória (LRU + TTL)
    vagas_em_cache = cache_vagas.obter(termo, loc)
    if vagas_em_cache is not None:
        logger.info(f"[buscador] Cache HIT para termo='{termo}', localizacao='{loc}' ({len(vagas_em_cache)} vagas)")
        return vagas_em_cache

    logger.info(f"[buscador] Cache MISS para termo='{termo}', localizacao='{loc}'. Consultando provedores externos...")
    vagas = _buscar_via_jooble(termo, loc)

    if not vagas:
        logger.warning("[buscador] Jooble não retornou vagas, tentando fonte alternativa...")
        vagas = _buscar_via_adzuna_fallback(termo, localizacao=loc)

    # 2. Armazenar em cache resultados bem-sucedidos
    if vagas:
        cache_vagas.salvar(termo, loc, vagas)

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


def _buscar_via_adzuna_fallback(termo: str, localizacao: str = None) -> list[dict]:
    """Fallback: busca na Adzuna se configurada."""
    import os
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")

    if not app_id or not app_key:
        return []

    try:
        from app.core.config import PAIS, DISTANCIA_KM
        loc = localizacao or LOCALIZACAO
        url = f"https://api.adzuna.com/v1/api/jobs/{PAIS}/search/1"
        parametros = {
            "app_id": app_id,
            "app_key": app_key,
            "what": termo,
            "where": loc,
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
