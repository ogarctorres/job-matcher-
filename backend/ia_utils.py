import json
import re


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