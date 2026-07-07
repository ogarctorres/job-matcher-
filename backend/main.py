from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import ia
import curriculo
import buscador
import matcher


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def raiz():
    return {"mensagem": "Job Matcher API rodando!"}


@app.post("/curriculo")
async def enviar_curriculo(arquivo: UploadFile):
    conteudo = await arquivo.read()
    texto = curriculo.extrair_texto_pdf(conteudo)
    dados_estruturados = ia.analisar_curriculo(texto)
    vagas_encontradas = buscador.buscar_vagas_do_curriculo(dados_estruturados)

    for vaga in vagas_encontradas:
        compatibilidade = matcher.calcular_compatibilidade(dados_estruturados, vaga)
        vaga["score"] = compatibilidade.get("score", 0)
        vaga["explicacao_score"] = compatibilidade.get("explicacao", "")

    vagas_encontradas.sort(key=lambda v: v["score"], reverse=True)

    return {
        "dados_curriculo": dados_estruturados,
        "vagas_encontradas": vagas_encontradas,
    }