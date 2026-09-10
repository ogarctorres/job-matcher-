import pytest
from app.core.ia_client import extrair_json

def test_extrair_json_puro():
    entrada = '{"nota_geral": 85, "skills": ["Python", "SQL"]}'
    resultado = extrair_json(entrada)
    assert resultado["nota_geral"] == 85
    assert "Python" in resultado["skills"]

def test_extrair_json_com_markdown():
    entrada = '```json\n{"score": 90, "explicacao": "Ótimo perfil"}\n```'
    resultado = extrair_json(entrada)
    assert resultado["score"] == 90
    assert resultado["explicacao"] == "Ótimo perfil"

def test_extrair_json_com_texto_ao_redor():
    entrada = 'Aqui está a resposta:\n{"resultado": "sucesso"}\nEspero ter ajudado!'
    resultado = extrair_json(entrada)
    assert resultado["resultado"] == "sucesso"

def test_extrair_json_invalido():
    with pytest.raises(ValueError):
        extrair_json("isto nao e um json")
