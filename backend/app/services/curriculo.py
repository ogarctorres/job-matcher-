"""Extração de texto de arquivos PDF com proteção e limpeza."""

import io
from pypdf import PdfReader

MAX_PAGINAS_CURRICULO = 10


def extrair_texto_pdf(conteudo_arquivo: bytes, max_paginas: int = MAX_PAGINAS_CURRICULO) -> str:
    """
    Extrai e concatena o texto das páginas de um PDF.
    - Insere quebra de linha limpa (\n\n) entre páginas para evitar fusão de palavras.
    - Limita o processamento a no máximo max_paginas páginas para proteção contra DoS/PDF bombs.
    """
    leitor = PdfReader(io.BytesIO(conteudo_arquivo))

    paginas_texto = []
    for i, pagina in enumerate(leitor.pages):
        if i >= max_paginas:
            break
        texto = pagina.extract_text()
        if texto and texto.strip():
            paginas_texto.append(texto.strip())

    return "\n\n".join(paginas_texto)

