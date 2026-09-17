import { useState, useEffect } from 'react'
import {
  UploadCloud,
  FileText,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'

const ETAPAS_PROCESSAMENTO = [
  { id: 1, titulo: 'Validando formato e integridade do documento PDF', progresso: 25 },
  { id: 2, titulo: 'Extraindo competências técnicas e formação com IA', progresso: 55 },
  { id: 3, titulo: 'Avaliando conformidade com critérios ATS e senioridade', progresso: 80 },
  { id: 4, titulo: 'Minerando vagas compatíveis e calculando scores', progresso: 95 },
]

function TelaUpload() {
  const { setResultado, setTelaAtiva, carregando, setCarregando, erro, setErro } = useApp()
  const [arquivo, setArquivo] = useState(null)
  const [arrastando, setArrastando] = useState(false)
  const [carregandoDemo, setCarregandoDemo] = useState(false)
  const [etapaIndice, setEtapaIndice] = useState(0)
  const [progressoPorcentagem, setProgressoPorcentagem] = useState(25)

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
    } catch (falha) {
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
    <div className="tela">
      <header className="tela-cabecalho">
        <span className="rotulo">Análise de Carreira</span>
        <h1>Diagnóstico de Perfil Técnico</h1>
        <p className="tela-descricao">
          Envie seu currículo em PDF para mapear suas competências, receber sugestões de aprimoramento e encontrar vagas ativas no mercado com alta compatibilidade.
        </p>
      </header>

      <div className="zona-upload-container">
        {/* Dropzone Interativo */}
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
                <UploadCloud size={24} strokeWidth={2} aria-hidden="true" />
              </div>
              <p className="dropzone-titulo">
                {arrastando ? 'Solte o arquivo PDF aqui' : 'Arraste seu currículo ou clique para procurar'}
              </p>
              <p className="dropzone-subtitulo">
                Suporta apenas documentos em formato PDF (tamanho máximo de 8&nbsp;MB).
              </p>
            </div>

            {/* Separador e Card de Demonstração (Onboarding instantâneo) */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 18px', gap: '16px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
                ou experimente instantaneamente
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--accent-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
                      Perfil de Demonstração Interativo
                    </strong>
                    <span className="sidebar-badge" style={{ fontSize: '10px' }}>Exemplo Pré-carregado</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Lucas Mendes • Ciência da Computação (Mackenzie) • Backend Python & FastAPI
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="botao-secundario"
                onClick={carregarPerfilDemo}
                disabled={carregando || carregandoDemo}
                style={{ fontSize: '12.5px', padding: '8px 14px', borderColor: 'var(--accent-border)' }}
              >
                {carregandoDemo ? (
                  <>
                    <Loader2 size={14} className="animar-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Carregando Demo…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} color="var(--accent)" />
                    <span>Experimentar sem PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Card com prévia do arquivo selecionado */}
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

            {/* Ação principal */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="botao-buscar"
                onClick={enviarCurriculo}
                disabled={carregando}
                style={{ flex: 1 }}
              >
                {carregando ? (
                  <>
                    <Loader2 size={16} className="animar-spin" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                    <span>Processando com IA…</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Análise</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
              {!carregando && (
                <button type="button" className="botao-secundario" onClick={() => setArquivo(null)}>
                  Trocar PDF
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stepper Dinâmico Realista durante o processamento */}
        {carregando && (
          <div
            className="stepper-processamento"
            role="status"
            aria-live="polite"
            style={{
              marginTop: '24px',
              padding: '20px 24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div className="stepper-cabecalho" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animar-spin" style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                  {ETAPAS_PROCESSAMENTO[etapaIndice]?.titulo}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700, fontSize: '13.5px' }}>
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
              style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-app)', overflow: 'hidden' }}
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

            {/* Lista com as 4 etapas de validação e mineração */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {ETAPAS_PROCESSAMENTO.map((etapa, idx) => {
                const concluida = idx < etapaIndice
                const ativa = idx === etapaIndice
                return (
                  <div key={etapa.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    {concluida ? (
                      <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                    ) : ativa ? (
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
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
                          width: '16px',
                          height: '16px',
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

        {/* Mensagem de Erro com role=alert */}
        {erro && (
          <div style={{ marginTop: '16px' }} className="mensagem-erro" role="alert" aria-live="assertive">
            {erro}
          </div>
        )}
      </div>
    </div>
  )
}

export default TelaUpload