# Job Matcher 🎯

Aplicação full stack que analisa seu currículo em PDF com IA, busca vagas de
estágio em TI reais e calcula o quanto cada vaga combina com o seu perfil —
com explicação do porquê.

## Como funciona

1. Você faz upload do seu currículo (PDF) pela interface web.
2. O backend extrai o texto do PDF.
4. Uma IA local (rodando via [Ollama](https://ollama.com), sem custo de API)
   analisa o currículo e extrai skills, objetivo de carreira e um resumo do
   perfil.
5. O sistema busca vagas reais de estágio em TI na região configurada,
   usando a [API da Adzuna](https://developer.adzuna.com/).
6. Para cada vaga encontrada, a IA compara a descrição da vaga com o perfil
   do candidato e gera um **score de compatibilidade (0-100%)** com uma
   explicação.
7. Tudo isso é exibido num dashboard, com as vagas mais compatíveis em
   destaque.

## Stack técnica

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — framework web em Python
- [Ollama](https://ollama.com/) + `llama3.2` — IA rodando localmente, sem
  custo por token
- [pypdf](https://pypi.org/project/pypdf/) — extração de texto de PDF
- [Adzuna API](https://developer.adzuna.com/) — busca de vagas reais

**Frontend**
- [React](https://react.dev/) + [Vite](https://vite.dev/)
- CSS puro, sem framework de estilos

## Rodando o projeto localmente

### Pré-requisitos

- [Python 3.11+](https://www.python.org/)
- [Node.js](https://nodejs.org/) (LTS)
- [Ollama](https://ollama.com/download) instalado, com o modelo `llama3.2`
  baixado (`ollama pull llama3.2`)
- Uma conta gratuita na [Adzuna](https://developer.adzuna.com/) para obter
  `app_id` e `app_key`

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

Cria um arquivo `.env` dentro de `backend/` com:

```
ADZUNA_APP_ID=sua_app_id
ADZUNA_APP_KEY=sua_app_key
```

Depois, sobe a API:

```bash
python -m uvicorn main:app --reload
```

A API fica disponível em `http://127.0.0.1:8000` (documentação interativa em
`/docs`).

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.

⚠️ Backend e frontend precisam estar rodando **ao mesmo tempo**, em
terminais separados.

## Estrutura do projeto

```
job-matcher/
├── backend/
│   ├── main.py         # endpoints da API
│   ├── curriculo.py    # extração de texto do PDF
│   ├── ia.py            # análise do currículo via IA
│   ├── buscador.py      # busca de vagas na Adzuna
│   ├── matcher.py       # cálculo do score de compatibilidade
│   └── config.py        # configurações e chaves
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            └── CardVaga.jsx
```

## Limitações conhecidas

- O modelo de IA roda localmente via CPU, então a análise pode levar alguns
  segundos por vaga.
- Como não há garantia de determinismo em modelos de linguagem, os termos de
  busca gerados a partir do currículo podem variar entre execuções.
- A busca de vagas está configurada para a região de São Paulo (capital),
  ajustável em `config.py`.

## Próximos passos

- [ ] Permitir configurar a localização e o raio de busca pela interface
- [ ] Cache de resultados para não reprocessar o mesmo currículo
- [ ] Deploy público (atualmente roda apenas localmente)
