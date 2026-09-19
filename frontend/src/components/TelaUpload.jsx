import { useState, useEffect, useRef } from 'react'
import {
  FileText,
  FileUp,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Layers,
  Search,
  Check,
  Terminal,
  Building2,
  Lock,
  RefreshCw,
  Sparkles,
  Award,
  AlertTriangle,
} from 'lucide-react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'

const ETAPAS_PROCESSAMENTO = [
  {
    id: 1,
    titulo: 'Extraindo texto e estrutura semântica do documento PDF...',
    icone: '📄',
    log: 'Extração estruturada de blocos textuais e cabeçalhos realizada.',
    progresso: 25,
  },
  {
    id: 2,
    titulo: 'Simulando triagem e filtros ATS corporativos...',
    icone: '🤖',
    log: 'Auditoria de legibilidade por robôs e densidade de palavras-chave.',
    progresso: 55,
  },
  {
    id: 3,
    titulo: 'Mapeando gaps em relação a requisitos do mercado...',
    icone: '🎯',
    log: 'Classificação factual de competências mandatórias vs. diferenciais.',
    progresso: 82,
  },
  {
    id: 4,
    titulo: 'Cruzando compatibilidade com vagas reais ativas no Brasil...',
    icone: '💼',
    log: 'Índices de compatibilidade e oportunidades de estágio calculados.',
    progresso: 98,
  },
]

const EMPRESAS_COMPATIVEIS = [
  'Nubank',
  'Mercado Livre',
  'Stone',
  'Itaú Unibanco',
  'iFood',
  'QuintoAndar',
  'Startups Globais',
]

function TelaUpload() {
  const {
    setResultado,
    setTelaAtiva,
    carregando,
    setCarregando,
    erro,
    setErro,
    usuario,
    abrirModalAuth,
  } = useApp()

  const [arquivo, setArquivo] = useState(null)
  const [arrastando, setArrastando] = useState(false)
  const [carregandoDemo, setCarregandoDemo] = useState(false)
  const [etapaIndice, setEtapaIndice] = useState(0)
  const [progressoPorcentagem, setProgressoPorcentagem] = useState(25)
  const [abaConsole, setAbaConsole] = useState('upload')
  const [resultadoPendente, setResultadoPendente] = useState(null)
  const [modalSoftGate, setModalSoftGate] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let timer
    if (carregando || carregandoDemo) {
      setEtapaIndice(0)
      setProgressoPorcentagem(25)
      timer = setInterval(() => {
        setEtapaIndice((prev) => {
          const prox = Math.min(prev + 1, ETAPAS_PROCESSAMENTO.length - 1)
          setProgressoPorcentagem(ETAPAS_PROCESSAMENTO[prox].progresso)
          return prox
        })
      }, 950)
    } else {
      setEtapaIndice(0)
      setProgressoPorcentagem(0)
    }
    return () => clearInterval(timer)
  }, [carregando, carregandoDemo])

  function validarEAtribuirArquivo(file) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErro('Por favor, selecione exclusivamente um arquivo em formato PDF.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setErro('O arquivo excede o limite máximo permitido de 8 MB.')
      return
    }
    setArquivo(file)
    setErro(null)
  }

  function handleMudancaArquivo(e) {
    const file = e.target.files?.[0]
    validarEAtribuirArquivo(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setArrastando(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setArrastando(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setArrastando(false)
    const file = e.dataTransfer.files?.[0]
    validarEAtribuirArquivo(file)
  }

  function formatarTamanho(bytes) {
    if (!bytes) return '0 KB'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  function concluirAnalise(dados) {
    setResultado(dados)
    // Se o usuário não estiver autenticado, exibe o Soft Gate elegante de produto SaaS
    if (!usuario) {
      setResultadoPendente(dados)
      setModalSoftGate(true)
    } else {
      setTelaAtiva('avaliacao')
    }
  }

  async function enviarCurriculo() {
    if (!arquivo) return
    setCarregando(true)
    setErro(null)

    try {
      const dados = await api.enviarCurriculo(arquivo)
      concluirAnalise(dados)
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
    }
  }

  async function carregarPerfilDemo() {
    setCarregandoDemo(true)
    setErro(null)
    try {
      const dados = await api.carregarDemo()
      concluirAnalise(dados)
    } catch {
      // Fallback estático garantido caso a API esteja em manutenção
      const demoFallback = {
        id: null,
        dados_curriculo: {
          nome: 'Lucas Mendes',
          email: 'lucas.mendes@email.com',
          cidade: 'São Paulo',
          estado: 'SP',
          cargo_objetivo: 'Estágio em Desenvolvimento Backend',
          resumo:
            'Estudante de Ciência da Computação apaixonado por desenvolvimento backend com Python, APIs RESTful e bancos relacionais. Prática com FastAPI, Docker e testes automatizados.',
          skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'REST APIs', 'pytest', 'SQL', 'Redis'],
          formacao: 'Ciência da Computação — Mackenzie (Previsão: 12/2026)',
          previsao_formatura: '12/2026',
          termo_busca_vaga: 'estágio backend python',
        },
        avaliacao: {
          nota_geral: 88,
          pontos_fortes: [
            'Excelente especificação de stack moderna de backend (FastAPI, Docker, PostgreSQL).',
            'Métricas concretas em projetos pessoais (cobertura de testes > 85%).',
            'Clareza de objetivo profissional e alinhamento estrito com estágio.',
          ],
          pontos_melhoria: [
            'Adicionar menção a mensageria ou background jobs (RabbitMQ ou Celery).',
            'Destacar vivência com cloud computing básica (AWS ou GCP).',
          ],
          comentario_geral: 'Perfil altamente competitivo para estágio em engenharia de software e backend.',
        },
        vagas_encontradas: [
          {
            titulo: 'Estágio em Engenharia de Software (Python / FastAPI)',
            empresa: 'Fintech Vektor Labs',
            localizacao: 'São Paulo, SP (Híbrido)',
            descricao:
              'Buscamos estudante de Ciência da Computação ou Engenharia de Software com interesse em desenvolvimento backend. Requisitos: conhecimento em Python, APIs RESTful, SQL e Git. Diferenciais: Docker e testes automatizados.',
            link: 'https://linkedin.com',
            score: 92,
            explicacao_score:
              'Altíssima compatibilidade: domina tecnologias mandatórias (Python, FastAPI, SQL) e possui diferenciais em Docker e pytest.',
          },
        ],
        demo: true,
      }
      concluirAnalise(demoFallback)
    } finally {
      setCarregandoDemo(false)
    }
  }

  return (
    <div className="tela-upload-container">
      {/* Atmosfera e Profundidade de Fundo (Backdrop Glow & Engineering Grid) */}
      <div className="upload-atmosphere-glow" aria-hidden="true" />
      <div className="upload-tech-grid" aria-hidden="true" />

      {/* Input de Arquivo Oculto (acessível via ref) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleMudancaArquivo}
        aria-hidden="true"
      />

      {/* Grid Principal em 2 Colunas */}
      <div className="tela tela-upload-split">
        {/* Coluna Esquerda: Proposta de Valor Executiva & Pipeline de 3 Etapas */}
        <div className="upload-coluna-info">
          <div className="upload-badge-categoria anim-fade-up-1">
            <span className="badge-ping-wrapper">
              <span className="badge-ping-dot" />
              <span className="badge-ping-ring" />
            </span>
            <span>Motor de Triagem ATS v2.4 Ativo</span>
          </div>

          <h1 className="upload-titulo-hero anim-fade-up-2">
            Avalie a maturidade técnica do seu currículo contra o mercado real.
          </h1>

          <p className="upload-descricao-hero anim-fade-up-2">
            O Vektor valida a estrutura, legibilidade e densidade de competências do seu perfil acadêmico em relação aos critérios de contratação e sistemas ATS corporativos.
          </p>

          {/* Pipeline Explicativo de 3 Passos */}
          <div className="upload-workflow-steps anim-fade-up-3">
            <div className="workflow-step-item">
              <div className="workflow-step-num">01</div>
              <div>
                <h4 className="workflow-step-titulo">Auditoria Estrutural ATS</h4>
                <p className="workflow-step-desc">
                  Conformidade de cabeçalho, legibilidade por robôs de triagem corporativos e densidade semântica de palavras-chave.
                </p>
              </div>
            </div>

            <div className="workflow-step-item">
              <div className="workflow-step-num">02</div>
              <div>
                <h4 className="workflow-step-titulo">Mapeamento Factual de Gaps</h4>
                <p className="workflow-step-desc">
                  Classificação rigorosa entre requisitos mandatórios e diferenciais competitivos para estágios em tecnologia.
                </p>
              </div>
            </div>

            <div className="workflow-step-item">
              <div className="workflow-step-num">03</div>
              <div>
                <h4 className="workflow-step-titulo">Matching & Preparação Técnica</h4>
                <p className="workflow-step-desc">
                  Cálculo auditável de aderência com vagas ativas no Brasil e simulador de testes práticos no LeetCode.
                </p>
              </div>
            </div>
          </div>

          {/* Métricas e Garantias de Rigor */}
          <div className="upload-trust-metrics anim-fade-up-4">
            <div className="trust-metric-box">
              <div className="trust-metric-icon">
                <CheckCircle2 size={16} color="var(--success)" />
              </div>
              <div>
                <span className="trust-metric-label">100% Factual</span>
                <p className="trust-metric-sub">Sem invenção de dados</p>
              </div>
            </div>

            <div className="trust-metric-box">
              <div className="trust-metric-icon">
                <Layers size={16} color="var(--accent)" />
              </div>
              <div>
                <span className="trust-metric-label">Padrão ATS</span>
                <p className="trust-metric-sub">Triagem corporativa</p>
              </div>
            </div>

            <div className="trust-metric-box">
              <div className="trust-metric-icon">
                <Search size={16} color="#a1a1aa" />
              </div>
              <div>
                <span className="trust-metric-label">Tempo Real</span>
                <p className="trust-metric-sub">Vagas ativas no Brasil</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Console de Upload Compacto & Perfil de Exemplo */}
        <div className="upload-coluna-acao">
          <div className="upload-card-console anim-fade-up-3">
            {/* Abas no topo da caixa: Enviar PDF | Usar Perfil Demo */}
            <div className="console-tabs-header">
              <button
                type="button"
                className={`console-tab-btn ${abaConsole === 'upload' ? 'ativo' : ''}`}
                onClick={() => setAbaConsole('upload')}
              >
                <FileUp size={14} />
                <span>Enviar Currículo (PDF)</span>
              </button>
              <button
                type="button"
                className={`console-tab-btn ${abaConsole === 'exemplo' ? 'ativo' : ''}`}
                onClick={() => setAbaConsole('exemplo')}
              >
                <FileText size={14} />
                <span>Perfil de Exemplo</span>
              </button>
            </div>

            {abaConsole === 'upload' ? (
              <div>
                {!arquivo ? (
                  <div>
                    <div
                      className={`dropzone ${arrastando ? 'arrastando' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      aria-label="Área de envio de currículo em formato PDF"
                    >
                      <div className="dropzone-icone-box">
                        <FileUp size={22} strokeWidth={2} aria-hidden="true" />
                      </div>
                      <p className="dropzone-titulo">
                        {arrastando ? 'Solte o arquivo PDF aqui' : 'Arraste seu currículo ou clique para escolher'}
                      </p>
                      <p className="dropzone-subtitulo">
                        Formato aceito: exclusivamente PDF (limite de até 8&nbsp;MB).
                      </p>
                      <div style={{ marginTop: '16px' }}>
                        <span className="botao-secundario" style={{ fontSize: '12.5px', padding: '7px 16px', pointerEvents: 'none' }}>
                          Escolher Arquivo do Computador
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '14px', lineHeight: '1.4' }}>
                      Seus dados são analisados de forma estritamente privada para cálculo de conformidade técnica.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Card de Prévia com Microinterações e Ações Diretas */}
                    <div className="card-arquivo-selecionado">
                      <div className="card-arquivo-info">
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                          <FileText size={22} aria-hidden="true" />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <p className="card-arquivo-nome" title={arquivo.name}>{arquivo.name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                            <span className="card-arquivo-tamanho tabular-nums">{formatarTamanho(arquivo.size)}</span>
                            <span style={{ fontSize: '11px', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={11} strokeWidth={3} /> PDF Pronto
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setArquivo(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          padding: '6px',
                          borderRadius: '4px',
                        }}
                        title="Remover arquivo selecionado"
                        aria-label="Remover arquivo selecionado"
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Botões de Ação Imediata */}
                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="botao-secundario"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ fontSize: '12.5px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <RefreshCw size={13} />
                        <span>Substituir</span>
                      </button>

                      <button
                        type="button"
                        className="botao-primario"
                        onClick={enviarCurriculo}
                        disabled={carregando}
                        style={{ flex: 1, padding: '10px 18px', fontSize: '13.5px', fontWeight: 600, justifyContent: 'center' }}
                      >
                        <span>Iniciar Diagnóstico ATS</span>
                        <ArrowRight size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Aba de Perfil de Exemplo (Onboarding Instantâneo) */
              <div className="console-demo-box">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="header-badge" style={{ fontSize: '10px' }}>PERFIL DEMO • BACKEND</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Mackenzie • 2026</span>
                </div>
                <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Lucas Mendes
                </strong>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 12px' }}>
                  Estágio em Engenharia de Software Backend com foco em Python, FastAPI, Docker, PostgreSQL e testes automatizados.
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  {['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'pytest', 'SQL'].map((sk) => (
                    <span
                      key={sk}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="botao-primario"
                  onClick={carregarPerfilDemo}
                  disabled={carregandoDemo}
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
                >
                  <span>Testar com este Perfil de Exemplo</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Mensagem de Erro */}
            {erro && (
              <div style={{ marginTop: '14px' }} className="mensagem-erro" role="alert" aria-live="assertive">
                {erro}
              </div>
            )}
          </div>

          {/* Mini-Dashboard / Glassmorphism Preview do Relatório ATS */}
          <div className="preview-diagnostico-card anim-fade-up-4">
            <div className="preview-card-header">
              <div className="preview-card-title-group">
                <div className="preview-card-icon">
                  <Sparkles size={14} />
                </div>
                <div>
                  <span className="preview-card-title">Prévia de Diagnóstico em Tempo Real</span>
                  <span className="preview-card-subtitle">Exemplo de auditoria gerada para vagas tech</span>
                </div>
              </div>
              <div className="preview-score-badge">
                <Award size={12} />
                <span>Score 84/100</span>
              </div>
            </div>

            <div className="preview-card-body">
              {/* Gauge Radial + Métricas de Triagem */}
              <div className="preview-gauge-row">
                <div className="preview-radial-wrapper">
                  <svg className="preview-radial-svg" viewBox="0 0 72 72">
                    <circle
                      className="preview-radial-track"
                      cx="36"
                      cy="36"
                      r="30"
                      strokeWidth="6"
                    />
                    <circle
                      className="preview-radial-fill"
                      cx="36"
                      cy="36"
                      r="30"
                      strokeWidth="6"
                      strokeDasharray="188.4"
                      strokeDashoffset="30.14"
                    />
                  </svg>
                  <div className="preview-radial-center">
                    <span className="preview-radial-val">84%</span>
                    <span className="preview-radial-lbl">ATS Match</span>
                  </div>
                </div>

                <div className="preview-stats-list">
                  <div className="preview-stat-item">
                    <span className="preview-stat-dot dot-green" />
                    <span className="preview-stat-name">Legibilidade ATS</span>
                    <strong className="preview-stat-val">Alta (96%)</strong>
                  </div>
                  <div className="preview-stat-item">
                    <span className="preview-stat-dot dot-cyan" />
                    <span className="preview-stat-name">Densidade Semântica</span>
                    <strong className="preview-stat-val">Forte (88%)</strong>
                  </div>
                  <div className="preview-stat-item">
                    <span className="preview-stat-dot dot-amber" />
                    <span className="preview-stat-name">Gaps Críticos</span>
                    <strong className="preview-stat-val text-amber">1 Requisito</strong>
                  </div>
                </div>
              </div>

              {/* Chips de Competências Analisadas */}
              <div className="preview-chips-container">
                <span className="preview-chips-label">Competências Auditadas:</span>
                <div className="preview-chips-grid">
                  <span className="preview-chip chip-sucesso">
                    <Check size={11} strokeWidth={3} /> Python 3.11
                  </span>
                  <span className="preview-chip chip-sucesso">
                    <Check size={11} strokeWidth={3} /> FastAPI & REST
                  </span>
                  <span className="preview-chip chip-sucesso">
                    <Check size={11} strokeWidth={3} /> PostgreSQL
                  </span>
                  <span className="preview-chip chip-sucesso">
                    <Check size={11} strokeWidth={3} /> Docker
                  </span>
                  <span className="preview-chip chip-alerta">
                    <AlertTriangle size={11} strokeWidth={2.5} /> AWS / Nuvem (Gap)
                  </span>
                  <span className="preview-chip chip-diferencial">
                    <Sparkles size={11} /> Pytest & CI/CD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Prova Social & Enquadramento de Viewport */}
      <div className="upload-barra-social anim-fade-up-5">
        <div className="social-proof-header">
          <span>Compatível com sistemas ATS e padrões de triagem corporativos de empresas líderes:</span>
        </div>
        <div className="social-proof-badges">
          {EMPRESAS_COMPATIVEIS.map((empresa) => (
            <div key={empresa} className="social-proof-pill">
              <Building2 size={12} color="var(--text-muted)" />
              <span>{empresa}</span>
            </div>
          ))}
        </div>

        <div className="upload-rodape-links">
          <span>© 2026 Vektor Carreiras • Diagnóstico Factual para Universitários</span>
          <div className="upload-rodape-menu">
            <button type="button" onClick={() => abrirModalAuth('login')} className="link-discreto">
              Privacidade
            </button>
            <span className="divisor-ponto">•</span>
            <button type="button" onClick={() => abrirModalAuth('login')} className="link-discreto">
              Termos de Uso
            </button>
            <span className="divisor-ponto">•</span>
            <span className="status-sistema-badge">
              <span className="status-bolinha" />
              Status: 99.9% Operacional
            </span>
          </div>
        </div>
      </div>

      {/* OVERLAY DE ANÁLISE / FEEDBACK DE ALTO PADRÃO (Estilo Linear / Vercel Logs) */}
      {(carregando || carregandoDemo) && (
        <div
          className="modal-overlay-analise"
          role="dialog"
          aria-modal="true"
          aria-label="Processamento e auditoria do currículo em andamento"
        >
          <div className="modal-analise-card">
            {/* Header do Card de Processamento */}
            <div className="analise-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="analise-scanner-pulse">
                  <span className="scanner-dot" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Auditoria ATS & Processamento em Tempo Real
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Analisando sintaxe, competências e densidade métrica
                  </p>
                </div>
              </div>
              <span className="analise-porcentagem tabular-nums">{progressoPorcentagem}%</span>
            </div>

            {/* Barra de Progresso Gradiente */}
            <div className="analise-progresso-trilho">
              <div
                className="analise-progresso-barra"
                style={{ width: `${progressoPorcentagem}%` }}
              />
            </div>

            {/* Etapas Fatuais Sequenciais */}
            <div className="analise-etapas-lista">
              {ETAPAS_PROCESSAMENTO.map((etapa, idx) => {
                const concluida = idx < etapaIndice
                const ativa = idx === etapaIndice
                return (
                  <div
                    key={etapa.id}
                    className={`analise-etapa-item ${concluida ? 'concluida' : ativa ? 'ativa' : 'pendente'}`}
                  >
                    <div className="analise-etapa-indicador">
                      {concluida ? (
                        <CheckCircle2 size={15} color="var(--success)" />
                      ) : ativa ? (
                        <Loader2 size={15} className="animar-spin" style={{ color: 'var(--accent)' }} />
                      ) : (
                        <span className="etapa-dot" />
                      )}
                    </div>
                    <div className="analise-etapa-texto">
                      <span className="etapa-titulo">{etapa.titulo}</span>
                      {concluida && <span className="etapa-sublog">{etapa.log}</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stream de Terminal / Logs de Processamento */}
            <div className="analise-terminal-logs">
              <div className="terminal-log-header">
                <Terminal size={12} color="var(--text-muted)" />
                <span>engine_log_stream • v2.0</span>
              </div>
              <div className="terminal-log-linhas">
                <div className="log-linha">$ vektor audit --format=pdf --engine=ats-enterprise</div>
                {etapaIndice >= 0 && <div className="log-linha log-check">✓ Extração de blocos de texto (pdfplumber 0.11)</div>}
                {etapaIndice >= 1 && <div className="log-linha log-check">✓ Parsing de formação, cursos e stack técnica</div>}
                {etapaIndice >= 2 && <div className="log-linha log-check">✓ Avaliação de legibilidade e palavras-chave ATS</div>}
                {etapaIndice >= 3 && <div className="log-linha log-check">✓ Mapeamento contra vagas no mercado brasileiro</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOFT GATE ELEGANTE DE PRODUTO SAAS (Exibido se o usuário não for logado ao finalizar a análise) */}
      {modalSoftGate && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setModalSoftGate(false)
            setTelaAtiva('avaliacao')
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(9, 9, 11, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 1150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            className="modal-softgate-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-focus)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px 30px',
              boxShadow: 'var(--shadow-modal)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-subtle)',
                border: '1px solid var(--success-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--success)',
              }}
            >
              <CheckCircle2 size={24} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Seu Diagnóstico ATS está Pronto!
            </h3>

            {resultadoPendente?.avaliacao?.nota_geral && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', margin: '4px auto 14px' }}>
                Score Preliminar: {resultadoPendente.avaliacao.nota_geral}/100
              </div>
            )}

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 20px' }}>
              Avaliamos a estrutura, legibilidade e compatibilidade do seu currículo. Crie uma conta gratuita para salvar seu histórico e desbloquear o acompanhamento contínuo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="botao-primario"
                onClick={() => {
                  setModalSoftGate(false)
                  abrirModalAuth('cadastro')
                  setTelaAtiva('avaliacao')
                }}
                style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '13.5px' }}
              >
                <Lock size={14} />
                <span>Salvar Histórico & Desbloquear Acesso Completo</span>
              </button>

              <button
                type="button"
                className="botao-secundario"
                onClick={() => {
                  setModalSoftGate(false)
                  setTelaAtiva('avaliacao')
                }}
                style={{ width: '100%', justifyContent: 'center', padding: '9px 16px', fontSize: '12.5px' }}
              >
                <span>Acessar Diagnóstico como Convidado</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TelaUpload