import { useState, useEffect } from 'react'
import {
  FileText,
  FileUp,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Search,
} from 'lucide-react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'

const ETAPAS_PROCESSAMENTO = [
  { id: 1, titulo: 'Validando formato e integridade do documento PDF', progresso: 25 },
  { id: 2, titulo: 'Processando histórico acadêmico e competências técnicas', progresso: 55 },
  { id: 3, titulo: 'Avaliando conformidade com critérios ATS e requisitos de estágio', progresso: 80 },
  { id: 4, titulo: 'Buscando vagas no mercado e calculando índices de compatibilidade', progresso: 95 },
]

function TelaUpload() {
  const { setResultado, setTelaAtiva, carregando, setCarregando, erro, setErro } = useApp()
  const [arquivo, setArquivo] = useState(null)
  const [arrastando, setArrastando] = useState(false)
  const [carregandoDemo, setCarregandoDemo] = useState(false)
  const [etapaIndice, setEtapaIndice] = useState(0)
  const [progressoPorcentagem, setProgressoPorcentagem] = useState(25)
  const [abaConsole, setAbaConsole] = useState('upload')

  useEffect(() => {
    let timer
    if (carregando) {
      setEtapaIndice(0)
      setProgressoPorcentagem(25)
      timer = setInterval(() => {
        setEtapaIndice((prev) => {
          const prox = Math.min(prev + 1, ETAPAS_PROCESSAMENTO.length - 1)
          setProgressoPorcentagem(ETAPAS_PROCESSAMENTO[prox].progresso)
          return prox
        })
      }, 1400)
    } else {
      setEtapaIndice(0)
      setProgressoPorcentagem(0)
    }
    return () => clearInterval(timer)
  }, [carregando])

  function validarEAtribuirArquivo(file) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErro('Por favor, envie um documento em formato PDF.')
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
    if (!bytes) return '0\u00A0KB'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)}\u00A0KB`
    return `${(kb / 1024).toFixed(1)}\u00A0MB`
  }

  async function enviarCurriculo() {
    if (!arquivo) return
    setCarregando(true)
    setErro(null)

    try {
      const dados = await api.enviarCurriculo(arquivo)
      setResultado(dados)
      setTelaAtiva('avaliacao')
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
      setResultado(dados)
      setTelaAtiva('avaliacao')
    } catch {
      // Fallback estático garantido caso a API esteja em manutenção
      const demoFallback = {
        id: null,
        dados_curriculo: {
          nome: "Lucas Mendes",
          email: "lucas.mendes@email.com",
          cidade: "São Paulo",
          estado: "SP",
          cargo_objetivo: "Estágio em Desenvolvimento Backend",
          resumo: "Estudante de Ciência da Computação apaixonado por desenvolvimento backend com Python, APIs RESTful e bancos relacionais. Prática com FastAPI, Docker e testes automatizados.",
          skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "Git", "REST APIs", "pytest", "SQL", "Redis"],
          formacao: "Ciência da Computação — Mackenzie (Previsão: 12/2026)",
          previsao_formatura: "12/2026",
          termo_busca_vaga: "estágio backend python",
        },
        avaliacao: {
          nota_geral: 88,
          pontos_fortes: [
            "Excelente especificação de stack moderna de backend (FastAPI, Docker, PostgreSQL).",
            "Métricas concretas em projetos pessoais (cobertura de testes > 85%).",
            "Clareza de objetivo profissional e alinhamento estrito com estágio."
          ],
          pontos_melhoria: [
            "Adicionar menção a mensageria ou background jobs (RabbitMQ ou Celery).",
            "Destacar vivência com cloud computing básica (AWS ou GCP)."
          ],
          comentario_geral: "Perfil altamente competitivo para estágio em engenharia de software e backend."
        },
        vagas_encontradas: [
          {
            titulo: "Estágio em Engenharia de Software (Python / FastAPI)",
            empresa: "Fintech Vektor Labs",
            localizacao: "São Paulo, SP (Híbrido)",
            descricao: "Buscamos estudante de Ciência da Computação ou Engenharia de Software com interesse em desenvolvimento backend. Requisitos: conhecimento em Python, APIs RESTful, SQL e Git. Diferenciais: Docker e testes automatizados.",
            link: "https://linkedin.com",
            score: 92,
            explicacao_score: "Altíssima compatibilidade: domina tecnologias mandatórias (Python, FastAPI, SQL) e possui diferenciais em Docker e pytest."
          }
        ],
        demo: true,
      }
      setResultado(demoFallback)
      setTelaAtiva('avaliacao')
    } finally {
      setCarregandoDemo(false)
    }
  }

  return (
    <div className="tela tela-upload-split">
      {/* Coluna Esquerda: Proposta de Valor Executiva & Pipeline de 3 Etapas */}
      <div className="upload-coluna-info">
        <div className="upload-badge-categoria">
          <ShieldCheck size={13} color="var(--accent)" />
          <span>DIAGNÓSTICO ATS & MERCADO REAL</span>
        </div>

        <h1 className="upload-titulo-hero">
          Avalie a maturidade técnica do seu currículo contra o mercado real.
        </h1>

        <p className="upload-descricao-hero">
          O Vektor valida a estrutura, legibilidade e densidade de competências do seu perfil acadêmico em relação aos critérios de contratação e sistemas ATS corporativos.
        </p>

        {/* Pipeline Explicativo de 3 Passos */}
        <div className="upload-workflow-steps">
          <div className="workflow-step-item">
            <div className="workflow-step-num">01</div>
            <div>
              <h4 className="workflow-step-titulo">Auditoria Estrutural ATS</h4>
              <p className="workflow-step-desc">
                Análise de conformidade de cabeçalho, legibilidade por robôs de triagem e densidade de palavras-chave técnicas.
              </p>
            </div>
          </div>

          <div className="workflow-step-item">
            <div className="workflow-step-num">02</div>
            <div>
              <h4 className="workflow-step-titulo">Mapeamento Factual de Gaps</h4>
              <p className="workflow-step-desc">
                Diagnóstico de requisitos obrigatórios vs. diferenciais desejáveis para vagas de entrada e estágio.
              </p>
            </div>
          </div>

          <div className="workflow-step-item">
            <div className="workflow-step-num">03</div>
            <div>
              <h4 className="workflow-step-titulo">Matching & Preparação Técnica</h4>
              <p className="workflow-step-desc">
                Cálculo auditável de compatibilidade com vagas reais no Brasil e simulador de testes práticos no LeetCode.
              </p>
            </div>
          </div>
        </div>

        {/* Métricas e Garantias de Rigor */}
        <div className="upload-trust-metrics">
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
        <div className="upload-card-console">
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
                  >
                    <input
                      id="upload-curriculo-pdf"
                      type="file"
                      accept=".pdf"
                      onChange={handleMudancaArquivo}
                      disabled={carregando || carregandoDemo}
                      aria-label="Selecione ou arraste seu currículo em formato PDF"
                    />
                    <div className="dropzone-icone-box">
                      <FileUp size={22} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <p className="dropzone-titulo">
                      {arrastando ? 'Solte o arquivo PDF aqui' : 'Arraste seu currículo ou clique para escolher'}
                    </p>
                    <p className="dropzone-subtitulo">
                      Formatos aceitos: exclusivamente PDF (limite de até 8&nbsp;MB).
                    </p>
                    <div style={{ marginTop: '14px' }}>
                      <span className="botao-secundario" style={{ pointerEvents: 'none', fontSize: '12.5px', padding: '6px 14px' }}>
                        Escolher Arquivo do Computador
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', lineHeight: '1.4' }}>
                    Seus dados são analisados de forma estritamente privada para cálculo de compatibilidade.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Prévia do Arquivo Selecionado */}
                  <div className="card-arquivo-selecionado">
                    <div className="card-arquivo-info">
                      <div style={{ color: 'var(--accent)', display: 'flex' }}>
                        <FileText size={22} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="card-arquivo-nome">{arquivo.name}</p>
                        <p className="card-arquivo-tamanho tabular-nums">{formatarTamanho(arquivo.size)}</p>
                      </div>
                    </div>
                    {!carregando && (
                      <button
                        type="button"
                        onClick={() => setArquivo(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          padding: '4px',
                        }}
                        title="Remover arquivo selecionado"
                        aria-label="Remover arquivo selecionado"
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Ações */}
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="botao-primario"
                      onClick={enviarCurriculo}
                      disabled={carregando}
                      style={{ flex: 1, padding: '10px 18px' }}
                    >
                      {carregando ? (
                        <>
                          <Loader2 size={16} className="animar-spin" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                          <span>Analisando Documento…</span>
                        </>
                      ) : (
                        <>
                          <span>Iniciar Diagnóstico</span>
                          <ArrowRight size={15} aria-hidden="true" />
                        </>
                      )}
                    </button>
                    {!carregando && (
                      <button type="button" className="botao-secundario" onClick={() => setArquivo(null)}>
                        Trocar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Aba de Perfil de Exemplo (Onboarding Instantâneo) */
            <div className="console-demo-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span className="header-badge" style={{ fontSize: '10px' }}>PERFIL ACADÊMICO</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Lucas Mendes</strong>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 12px' }}>
                Ciência da Computação (Mackenzie • 2026). Perfil com foco em desenvolvimento Backend Python, FastAPI, Docker e PostgreSQL.
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
                style={{ width: '100%' }}
              >
                {carregandoDemo ? (
                  <>
                    <Loader2 size={15} className="animar-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Carregando Dados de Demonstração…</span>
                  </>
                ) : (
                  <>
                    <span>Testar com este Perfil de Exemplo</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Stepper de Processamento Realista */}
          {carregando && (
            <div
              className="stepper-processamento"
              role="status"
              aria-live="polite"
              style={{
                marginTop: '18px',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={15} className="animar-spin" style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                    {ETAPAS_PROCESSAMENTO[etapaIndice]?.titulo}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700, fontSize: '12.5px' }}>
                  {progressoPorcentagem}%
                </span>
              </div>

              <div
                className="barra-progresso-trilho"
                role="progressbar"
                aria-label="Progresso da análise do currículo"
                aria-valuenow={progressoPorcentagem}
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--bg-app)', overflow: 'hidden' }}
              >
                <div
                  className="barra-progresso-preenchimento"
                  style={{
                    width: `${progressoPorcentagem}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent)',
                    transition: 'width 0.4s ease-in-out',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {ETAPAS_PROCESSAMENTO.map((etapa, idx) => {
                  const concluida = idx < etapaIndice
                  const ativa = idx === etapaIndice
                  return (
                    <div key={etapa.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      {concluida ? (
                        <CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                      ) : ativa ? (
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: '2px solid var(--accent)',
                            borderTopColor: 'transparent',
                            animation: 'spin 1s linear infinite',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: '1px solid var(--border-subtle)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span
                        style={{
                          color: concluida ? 'var(--text-secondary)' : ativa ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontWeight: ativa ? 600 : 400,
                        }}
                      >
                        {etapa.titulo}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {erro && (
            <div style={{ marginTop: '14px' }} className="mensagem-erro" role="alert" aria-live="assertive">
              {erro}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TelaUpload