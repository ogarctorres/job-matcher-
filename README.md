# Job Matcher 🎯

> **Plataforma de Inteligência de Carreira com IA e Dados para Estudantes de Tecnologia**

O **Job Matcher** é uma aplicação Full Stack que utiliza Inteligência Artificial generativa (Google Gemini) e engenharia de dados para analisar currículos em PDF, comparar competências com vagas reais de estágio no mercado brasileiro (via Jooble API) e gerar métricas, cartas de apresentação e recomendações personalizadas.

---

## 🌟 Principais Funcionalidades

- 📄 **Leitura e Extração de PDF**: Extração limpa e estruturação de texto em dados relacionais.
- 🤖 **Análise de Competências com IA**: Avaliação profunda do perfil para posições de entrada (estágio em dados, software e infraestrutura).
- 💼 **Busca Integrada de Vagas Reais**: Conexão em tempo real com APIs de vagas brasileiras (Jooble & Adzuna).
- 🎯 **Score de Compatibilidade Explicado**: Classificação percentual de aderência candidato-vaga com raciocínio analítico.
- ✉️ **Gerador de Cartas de Apresentação**: Criação instantânea de cartas formais e contextualizadas por vaga.
- 💾 **Histórico Persistente (SQLite)**: Armazenamento e consulta de todas as análises anteriores.
- 📊 **Dashboard & Tendências de Mercado**: Mineração e visualização das habilidades mais demandadas nos anúncios de estágio.

---

## 🛠️ Stack Tecnológica

### Backend
- **Linguagem**: Python 3.11+
- **Framework Web**: FastAPI + Uvicorn
- **Inteligência Artificial**: Google Gemini API (`gemini-3.6-flash`) + Suporte local via Ollama
- **Banco de Dados**: SQLite + SQLAlchemy ORM
- **Processamento de Dados**: Pydantic, Requests, PyPDF
- **Testes**: Pytest, FastAPI TestClient

### Frontend
- **Biblioteca**: React 19 + Vite
- **Gerenciamento de Estado**: React Context API
- **Estilização**: CSS Puro com design system temático e responsivo

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/ogarctorres/job-matcher-.git
cd job-matcher-
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
```

Crie o arquivo `.env` baseado no `.env.example`:
```env
GEMINI_API_KEY=sua_chave_aqui
IA_PROVIDER=gemini
JOOBLE_API_KEY=sua_chave_jooble
```

Inicie o servidor:
```bash
python -m uvicorn app.main:app --reload
```
Acesse a documentação Swagger em: `http://127.0.0.1:8000/docs`

### 3. Frontend
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```
Acesse: `http://localhost:5173`

---

## 📄 Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
