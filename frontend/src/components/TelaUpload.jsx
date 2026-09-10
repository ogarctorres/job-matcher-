import { useState } from 'react'
import {
  UploadCloud,
  FileText,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'

function TelaUpload() {
  const { setResultado, setTelaAtiva, carregando, setCarregando, erro, setErro } = useApp()
  const [arquivo, setArquivo] = useState(null)
  const [arrastando, setArrastando] = useState(false)
  const [etapaStatus, setEtapaStatus] = useState('')

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
    if (!bytes) return '0 KB'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  async function enviarCurriculo() {
    if (!arquivo) return
    setCarregando(true)
    setErro(null)
    setEtapaStatus('Extraindo dados do PDF...')

    try {
      setEtapaStatus('Analisando perfil técnico e competências...')
      const dados = await api.enviarCurriculo(arquivo)
      setResultado(dados)
      setTelaAtiva('avaliacao')
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
      setEtapaStatus('')
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
          <div
            className={`dropzone ${arrastando ? 'arrastando' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleMudancaArquivo}
              disabled={carregando}
            />
            <div className="dropzone-icone-box">
              <UploadCloud size={24} strokeWidth={2} />
            </div>
            <p className="dropzone-titulo">
              {arrastando ? 'Solte o arquivo PDF aqui' : 'Arraste seu currículo ou clique para procurar'}
            </p>
            <p className="dropzone-subtitulo">
              Suporta apenas documentos em formato PDF (tamanho máximo de 8MB).
            </p>
          </div>
        ) : (
          <div>
            {/* Card com prévia do arquivo selecionado */}
            <div className="card-arquivo-selecionado">
              <div className="card-arquivo-info">
                <div style={{ color: 'var(--accent)', display: 'flex' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <p className="card-arquivo-nome">{arquivo.name}</p>
                  <p className="card-arquivo-tamanho">{formatarTamanho(arquivo.size)}</p>
                </div>
              </div>
              {!carregando && (
                <button
                  onClick={() => setArquivo(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: '4px',
                  }}
                  title="Remover arquivo"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Ação principal */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                className="botao-buscar"
                onClick={enviarCurriculo}
                disabled={carregando}
                style={{ flex: 1 }}
              >
                {carregando ? (
                  <>
                    <Loader2 size={16} className="animar-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Processando com IA...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Análise</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              {!carregando && (
                <button className="botao-secundario" onClick={() => setArquivo(null)}>
                  Trocar PDF
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stepper durante o processamento */}
        {carregando && (
          <div className="stepper-processamento">
            <div className="stepper-cabecalho">
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Etapa atual:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{etapaStatus}</span>
            </div>
            <div className="barra-progresso-trilho">
              <div className="barra-progresso-preenchimento" style={{ width: '75%' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Cruzando requisitos de vagas em tempo real via Jooble API e analisando senioridade com Gemini.
            </p>
          </div>
        )}

        {/* Mensagem de Erro */}
        {erro && (
          <div style={{ marginTop: '16px' }} className="mensagem-erro">
            {erro}
          </div>
        )}
      </div>
    </div>
  )
}

export default TelaUpload