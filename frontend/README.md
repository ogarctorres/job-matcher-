# Frontend - Job Matcher 💻

Interface visual reativa desenvolvida com **React 19** e empacotada com **Vite**.

## Estrutura de Pastas

```
src/
├── components/          # Telas e componentes reutilizáveis
│   ├── CardVaga.jsx     # Card de vaga com sintonia e modal de carta
│   ├── LoadingSkeleton.jsx # Placeholders visuais durante loading
│   ├── ModalCarta.jsx   # Modal de geração de carta com IA
│   ├── ScoreGauge.jsx   # Gráfico circular de score
│   ├── Sidebar.jsx      # Navegação lateral
│   ├── SkillBadge.jsx   # Badge visual de competência
│   ├── TelaAvaliacao.jsx# Tela raio-X da pontuação
│   ├── TelaDashboard.jsx# Métricas e inteligência de mercado
│   ├── TelaHistorico.jsx# Histórico persistente do SQLite
│   ├── TelaUpload.jsx   # Upload e envio do PDF
│   └── TelaVagas.jsx    # Vagas encontradas com filtros
├── contexts/            # React Context API para estado global
│   └── AppContext.jsx
├── services/            # Camada de comunicação HTTP com a API
│   └── api.js
├── App.jsx              # Ponto de entrada modular da UI
└── index.css            # Variáveis globais de cores e tipografia
```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento na porta 5173.
- `npm run build`: Compila os assets minificados e otimizados na pasta `dist/`.
