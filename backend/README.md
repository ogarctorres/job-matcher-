# Documentação da API Job Matcher 📡

A API do Job Matcher foi desenvolvida utilizando **FastAPI** e segue o padrão RESTful.

## Base URL
- Desenvolvimento local: `http://127.0.0.1:8000`

## Endpoints Principais

### 1. Currículo & Match
- `POST /curriculo`: Envia o PDF do currículo, executa extração, análise via Gemini e busca vagas correspondentes.
- `POST /sugestao-vaga`: Recebe dados do candidato e detalhes da vaga para sugerir melhorias de perfil.

### 2. Cartas de Apresentação
- `POST /carta`: Gera carta de apresentação contextualizada e personalizada por IA.

### 3. Histórico (SQLite)
- `GET /historico/`: Lista todas as análises salvas anteriormente.
- `GET /historico/{id}`: Consulta dados completos de uma análise específica.
- `DELETE /historico/{id}`: Remove uma análise do banco de dados.

### 4. Estatísticas & Inteligência
- `GET /estatisticas/`: Métricas consolidadas de pontuações e competências mais frequentes.
- `GET /tendencias/`: Mineração em tempo real de skills requisitadas no mercado.

### 5. Diagnóstico
- `GET /health`: Informa o status operacional dos provedores de IA e APIs externas.
