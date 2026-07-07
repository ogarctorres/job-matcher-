import requests

import config


def buscar_vagas(termo: str) -> list[dict]:
    url = f"https://api.adzuna.com/v1/api/jobs/{config.PAIS}/search/1"
    parametros = {
        "app_id": config.ADZUNA_APP_ID,
        "app_key": config.ADZUNA_APP_KEY,
        "what": termo,
        "where": config.LOCALIZACAO,
        "distance": config.DISTANCIA_KM,
        "results_per_page": 10,
    }

    resposta = requests.get(url, params=parametros)
    dados = resposta.json()

    return dados.get("results", [])


def buscar_vagas_do_curriculo(dados_curriculo: dict) -> list[dict]:
    termo_busca_bruto = dados_curriculo.get("termo_busca_vaga", "estagio ti")
    primeiro_termo = termo_busca_bruto.split(",")[0].strip()
    termo_busca = f"estagio {primeiro_termo}"

    resultados_brutos = buscar_vagas(termo_busca)

    vagas = []
    for vaga in resultados_brutos:
        vagas.append({
            "titulo": vaga.get("title", "Sem título"),
            "empresa": vaga.get("company", {}).get("display_name", "Empresa não informada"),
            "descricao": vaga.get("description", ""),
            "link": vaga.get("redirect_url", ""),
        })

    return vagas