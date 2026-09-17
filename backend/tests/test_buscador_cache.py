"""Testes unitarios para o cache LRU/TTL do buscador de vagas."""

import time
from unittest.mock import patch
from app.services.buscador import CacheVagasTTL, buscar_vagas, cache_vagas


def test_cache_vagas_salvar_e_obter():
    cache = CacheVagasTTL(maxsize=10, ttl_seconds=60)
    vagas_exemplo = [{"titulo": "Estágio Backend Python", "empresa": "Tech"}]

    cache.salvar("backend python", "São Paulo", vagas_exemplo)
    resultado = cache.obter("backend python", "São Paulo")

    assert resultado is not None
    assert len(resultado) == 1
    assert resultado[0]["titulo"] == "Estágio Backend Python"


def test_cache_vagas_case_insensitive_e_espacos():
    cache = CacheVagasTTL(maxsize=10, ttl_seconds=60)
    vagas_exemplo = [{"titulo": "Estágio Dados", "empresa": "DataCo"}]

    cache.salvar("  Python SQL  ", "  SÃO PAULO  ", vagas_exemplo)
    resultado = cache.obter("python sql", "são paulo")

    assert resultado is not None
    assert resultado[0]["titulo"] == "Estágio Dados"


def test_cache_vagas_isolamento_mutacao():
    cache = CacheVagasTTL(maxsize=10, ttl_seconds=60)
    vagas_original = [{"titulo": "Estágio Dev", "empresa": "Alpha"}]

    cache.salvar("dev", "SP", vagas_original)
    res1 = cache.obter("dev", "SP")
    res1[0]["titulo"] = "TITULO ALTERADO EXTERNAMENTE"

    res2 = cache.obter("dev", "SP")
    assert res2[0]["titulo"] == "Estágio Dev"


def test_cache_vagas_expiracao_ttl():
    # TTL de 0.1 segundo
    cache = CacheVagasTTL(maxsize=10, ttl_seconds=0.1)
    cache.salvar("termo", "loc", [{"titulo": "Vaga Rápida"}])

    assert cache.obter("termo", "loc") is not None
    time.sleep(0.15)
    assert cache.obter("termo", "loc") is None


def test_cache_vagas_lru_eviction():
    cache = CacheVagasTTL(maxsize=2, ttl_seconds=60)

    cache.salvar("t1", "loc", [{"titulo": "Vaga 1"}])
    cache.salvar("t2", "loc", [{"titulo": "Vaga 2"}])

    # Acessar t1 para torna-lo mais recentemente usado
    _ = cache.obter("t1", "loc")

    # Inserir t3 - deve descartar t2 (o LRU)
    cache.salvar("t3", "loc", [{"titulo": "Vaga 3"}])

    assert cache.obter("t1", "loc") is not None
    assert cache.obter("t2", "loc") is None
    assert cache.obter("t3", "loc") is not None


def test_buscar_vagas_usa_cache_em_chamadas_subsequentes():
    cache_vagas.limpar()

    vagas_mock = [{"titulo": "Estágio IA", "empresa": "Vektor", "descricao": "Python", "score": 90}]

    with patch("app.services.buscador._buscar_via_jooble", return_value=vagas_mock) as mock_jooble:
        # Primeira chamada: cache MISS -> chama Jooble
        r1 = buscar_vagas("inteligencia artificial", "Remoto")
        assert len(r1) == 1
        assert mock_jooble.call_count == 1

        # Segunda chamada com os mesmos parametros: cache HIT -> NAO chama Jooble
        r2 = buscar_vagas("inteligencia artificial", "Remoto")
        assert len(r2) == 1
        assert mock_jooble.call_count == 1  # Permanece 1!

        # Terceira chamada com termo diferente: cache MISS -> chama Jooble novamente
        r3 = buscar_vagas("engenharia de dados", "Remoto")
        assert len(r3) == 1
        assert mock_jooble.call_count == 2
