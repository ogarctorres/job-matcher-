from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import curriculo
import ia
import avaliador
import buscador
import matcher

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TAMANHO_MAXIMO_MB = 8


@app.get("/")
def raiz():
    return {"mensagem": "Job Matcher API rodando!"}


@app.post("/curriculo")
async def enviar_curriculo(arquivo: UploadFile):
    if arquivo.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Envie um arquivo em PDF. Formato recebido: " + str(arquivo.content_type),
        )

    conteudo = await arquivo.read()

    tamanho_mb = len(conteudo) / (1024 * 1024)
    if tamanho_mb > TAMANHO_MAXIMO_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Arquivo muito grande ({tamanho_mb:.1f}MB). O limite é {TAMANHO_MAXIMO_MB}MB.",
        )

    try:
        texto = curriculo.extrair_texto_pdf(conteudo)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Não conseguimos ler esse PDF. Ele pode estar corrompido ou protegido.",
        )

    if not texto or len(texto.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Não encontramos texto suficiente nesse PDF. Ele pode ser uma imagem escaneada.",
        )

    try:
        dados_estruturados = ia.analisar_curriculo(texto)
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="A IA local não respondeu corretamente. Verifique se o Ollama está rodando e tente novamente.",
        )

    try:
        avaliacao = avaliador.avaliar_curriculo(texto)
    except Exception as erro:
        print(f"[debug] erro na avaliacao: {erro}")
        avaliacao = {
            "nota_geral": 0,
            "pontos_fortes": [],
            "pontos_melhoria": [],
            "comentario_geral": "Não foi possível gerar a avaliação dessa vez.",
        }

    try:
        vagas_encontradas = buscador.buscar_vagas_do_curriculo(dados_estruturados)
    except Exception as erro:
        print(f"[debug] erro na busca de vagas: {erro}")
        vagas_encontradas = []

    for vaga in vagas_encontradas:
        try:
            compatibilidade = matcher.calcular_compatibilidade(dados_estruturados, vaga)
            vaga["score"] = compatibilidade.get("score", 0)
            vaga["explicacao_score"] = compatibilidade.get("explicacao", "")
        except Exception:
            vaga["score"] = 0
            vaga["explicacao_score"] = "Não foi possível calcular a compatibilidade."

    vagas_encontradas.sort(key=lambda v: v["score"], reverse=True)

    return {
        "dados_curriculo": dados_estruturados,
        "avaliacao": avaliacao,
        "vagas_encontradas": vagas_encontradas,
    }