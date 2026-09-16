"""Testes para upload de PDF e protecao contra abuso."""

from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.services.curriculo import extrair_texto_pdf, MAX_PAGINAS_CURRICULO

client = TestClient(app)


def test_upload_pdf_mime_invalido():
    """Garante que arquivos com MIME type diferente de application/pdf sao rejeitados com 400."""
    response = client.post(
        "/curriculo",
        files={"arquivo": ("arquivo.txt", b"Texto simples", "text/plain")}
    )
    assert response.status_code == 400
    assert "Envie um arquivo em PDF" in response.json()["detail"]


def test_upload_pdf_magic_number_invalido():
    """Garante que arquivos com MIME application/pdf forjado mas sem magic number %PDF- sao rejeitados com 400."""
    arquivo_falso = b"Conteudo malicioso ou texto fingindo ser PDF"
    response = client.post(
        "/curriculo",
        files={"arquivo": ("falso.pdf", arquivo_falso, "application/pdf")}
    )
    assert response.status_code == 400
    assert "cabeçalho de arquivo inválido" in response.json()["detail"]


def test_upload_pdf_tamanho_excedido_retorna_413():
    """Garante que payload acima do limite maximo (8MB) e abortado em streaming com HTTP 413."""
    tamanho_excedido = 9 * 1024 * 1024  # 9MB
    arquivo_gigante = b"%PDF-" + b"A" * (tamanho_excedido - 5)

    response = client.post(
        "/curriculo",
        files={"arquivo": ("gigante.pdf", arquivo_gigante, "application/pdf")}
    )
    assert response.status_code == 413
    assert "Arquivo muito grande" in response.json()["detail"]


def test_upload_pdf_corrompido_retorna_400():
    """Garante que arquivos com cabecalho %PDF- mas corrompidos retornam 400 com mensagem amigavel."""
    pdf_corrompido = b"%PDF-1.4\nConteudo corrompido que faz o leitor quebrar"
    response = client.post(
        "/curriculo",
        files={"arquivo": ("quebrado.pdf", pdf_corrompido, "application/pdf")}
    )
    assert response.status_code == 400
    assert "Não conseguimos ler esse PDF" in response.json()["detail"]


def test_upload_pdf_texto_insuficiente_retorna_400():
    """Garante que PDFs sem texto suficiente (menos de 50 chars, ex: escaneados) retornam 400."""
    with patch("app.routes.curriculo.curriculo.extrair_texto_pdf", return_value="Texto curto"):
        response = client.post(
            "/curriculo",
            files={"arquivo": ("curto.pdf", b"%PDF-1.4\nTexto curto", "application/pdf")}
        )
        assert response.status_code == 400
        assert "Não encontramos texto suficiente" in response.json()["detail"]


def test_extrair_texto_pdf_separacao_paginas():
    """Garante que o texto de multiplas paginas e unido com quebra limpa (\\n\\n) evitando fusao de palavras."""
    with patch("app.services.curriculo.PdfReader") as mock_reader:
        pagina1 = MagicMock()
        pagina1.extract_text.return_value = "Primeira linha da página um"
        pagina2 = MagicMock()
        pagina2.extract_text.return_value = "Primeira linha da página dois"

        mock_reader.return_value.pages = [pagina1, pagina2]

        resultado = extrair_texto_pdf(b"%PDF-1.4 mock")

        assert resultado == "Primeira linha da página um\n\nPrimeira linha da página dois"
        assert "página um\n\nPrimeira" in resultado


def test_extrair_texto_pdf_limite_max_paginas():
    """Garante que o leitor limita a extracao a MAX_PAGINAS_CURRICULO paginas para evitar DoS."""
    with patch("app.services.curriculo.PdfReader") as mock_reader:
        paginas = []
        for i in range(16):
            p = MagicMock()
            p.extract_text.return_value = f"Conteúdo da página {i + 1}"
            paginas.append(p)

        mock_reader.return_value.pages = paginas

        resultado = extrair_texto_pdf(b"%PDF-1.4 mock", max_paginas=MAX_PAGINAS_CURRICULO)
        partes = resultado.split("\n\n")

        assert len(partes) == 10
        assert f"página {MAX_PAGINAS_CURRICULO}" in resultado
        assert "página 11" not in resultado
        assert "página 16" not in resultado


def test_upload_pdf_sucesso_com_mocks():
    """Garante o fluxo completo de upload quando o PDF e valido e os servicos sao processados com sucesso."""
    texto_mock = "João da Silva - Engenheiro de Software Python Sênior com vasta experiência em FastAPI e PostgreSQL"

    with patch("app.routes.curriculo.curriculo.extrair_texto_pdf", return_value=texto_mock), \
         patch("app.routes.curriculo.ia.analisar_curriculo", return_value={"nome": "João", "cargo": "Engenheiro"}), \
         patch("app.routes.curriculo.avaliador.avaliar_curriculo", return_value={"nota_geral": 85}), \
         patch("app.routes.curriculo.buscador.buscar_vagas_do_curriculo", return_value=[]), \
         patch("app.routes.curriculo.matcher.calcular_compatibilidade_lote", return_value=[]):

        response = client.post(
            "/curriculo",
            files={"arquivo": ("curriculo_valido.pdf", b"%PDF-1.4\nConteudo ficticio", "application/pdf")}
        )

        assert response.status_code == 200
        dados = response.json()
        assert "dados_curriculo" in dados
        assert dados["dados_curriculo"]["nome"] == "João"
        assert "avaliacao" in dados
        assert dados["avaliacao"]["nota_geral"] == 85
        assert "vagas_encontradas" in dados
