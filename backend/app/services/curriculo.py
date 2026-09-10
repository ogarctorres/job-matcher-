"""Extração de texto de arquivos PDF."""

from pypdf import PdfReader
import io


def extrair_texto_pdf(conteudo_arquivo: bytes) -> str:
    """Extrai e concatena o texto de todas as páginas de um PDF."""
    leitor = PdfReader(io.BytesIO(conteudo_arquivo))

    texto_completo = ""
    for pagina in leitor.pages:
        texto_completo += pagina.extract_text() or ""

    return texto_completo
