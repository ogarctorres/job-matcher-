"""Testes para resiliência de IA, fallback de modelos, fallback entre provedores e timeouts."""

from unittest.mock import MagicMock, patch
import pytest

from app.core import ia_client
from app.core.config import GEMINI_MODEL, GEMINI_MODEL_FALLBACK


def test_gemini_sucesso_com_modelo_primario():
    """Garante que a chamada ao Gemini utiliza o modelo primário oficial e repassa timeout de 30s."""
    with patch.object(ia_client, "GEMINI_API_KEY", "fake_gemini_key"), \
         patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as mock_model_cls:

        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"status": "ok"}'
        mock_instance.generate_content.return_value = mock_response
        mock_model_cls.return_value = mock_instance

        resposta = ia_client._chamar_gemini("Prompt de teste")

        assert resposta == '{"status": "ok"}'
        mock_model_cls.assert_called_with(GEMINI_MODEL)
        mock_instance.generate_content.assert_called_once()
        _, kwargs = mock_instance.generate_content.call_args
        assert kwargs.get("request_options") == {"timeout": 30.0}


def test_gemini_fallback_para_modelo_secundario():
    """Garante que se o modelo primário falhar, o cliente recorre ao modelo secundário oficial com timeout."""
    with patch.object(ia_client, "GEMINI_API_KEY", "fake_gemini_key"), \
         patch("google.generativeai.configure"), \
         patch("google.generativeai.GenerativeModel") as mock_model_cls:

        mock_primario = MagicMock()
        mock_primario.generate_content.side_effect = RuntimeError("Quota primária excedida")

        mock_secundario = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"status": "fallback_model_ok"}'
        mock_secundario.generate_content.return_value = mock_response

        # Primeiro retorno é o primário, segundo é o fallback
        mock_model_cls.side_effect = [mock_primario, mock_secundario]

        resposta = ia_client._chamar_gemini("Prompt de teste com fallback de modelo")

        assert resposta == '{"status": "fallback_model_ok"}'
        assert mock_model_cls.call_count == 2
        mock_model_cls.assert_any_call(GEMINI_MODEL)
        mock_model_cls.assert_any_call(GEMINI_MODEL_FALLBACK)
        mock_secundario.generate_content.assert_called_once()
        _, kwargs = mock_secundario.generate_content.call_args
        assert kwargs.get("request_options") == {"timeout": 30.0}


def test_chamar_ia_fallback_entre_provedores_desbloqueado():
    """Garante que quando o Gemini falha todas as tentativas, o fallback para Ollama NÃO é bloqueado."""
    with patch.object(ia_client, "IA_PROVIDER", "gemini"), \
         patch.object(ia_client, "_chamar_gemini", side_effect=RuntimeError("Gemini indisponível")), \
         patch.object(ia_client, "_chamar_ollama", return_value='{"provedor": "ollama_fallback"}') as mock_ollama:

        resultado = ia_client.chamar_ia("Qualifique o candidato", tentativas=2, espera_segundos=0)

        assert resultado == {"provedor": "ollama_fallback"}
        mock_ollama.assert_called_once_with("Qualifique o candidato")


def test_chamar_ia_falha_total_lanca_excecao():
    """Garante que se tanto provedor primário quanto o fallback falharem, é lançado ValueError informativo."""
    with patch.object(ia_client, "IA_PROVIDER", "gemini"), \
         patch.object(ia_client, "_chamar_gemini", side_effect=RuntimeError("Gemini down")), \
         patch.object(ia_client, "_chamar_ollama", side_effect=RuntimeError("Ollama down")):

        with pytest.raises(ValueError) as exc_info:
            ia_client.chamar_ia("Teste falha total", tentativas=2, espera_segundos=0)

        assert "Falha após 2 tentativas no provedor 'gemini'" in str(exc_info.value)


def test_chamar_ollama_configura_timeout():
    """Garante que a chamada ao Ollama inicializa o cliente com timeout configurado."""
    with patch("ollama.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.chat.return_value = {"message": {"content": '{"modo": "local"}'}}
        mock_client_cls.return_value = mock_client

        resposta = ia_client._chamar_ollama("Teste prompt ollama")

        assert resposta == '{"modo": "local"}'
        mock_client_cls.assert_called_once_with(timeout=30.0)
        mock_client.chat.assert_called_once()
