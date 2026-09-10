import io
from pypdf import PdfWriter

def criar_pdf_teste_em_memoria(texto="Currículo de Teste Engenheiro de Dados Python SQL"):
    buffer = io.BytesIO()
    writer = PdfWriter()
    page = writer.add_blank_page(width=200, height=200)
    writer.write(buffer)
    buffer.seek(0)
    return buffer.getvalue()
