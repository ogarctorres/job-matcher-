from pypdf import PdfReader
import io


def extrair_texto_pdf(conteudo_arquivo: bytes) -> str:
    leitor = PdfReader(io.BytesIO(conteudo_arquivo))

    texto_completo = ""
    for pagina in leitor.pages:
        texto_completo += pagina.extract_text() or ""

    return texto_completo