import { Component, lazy, Suspense } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import ModalAuth from './components/ModalAuth'
import TelaUpload from './components/TelaUpload'
import TelaAuthGate from './components/TelaAuthGate'
import { AppProvider, useApp } from './contexts/AppContext'
import './App.css'

// Carregamento sob demanda (Code Splitting via React.lazy) para reduzir bundle inicial
const TelaAvaliacao = lazy(() => import('./components/TelaAvaliacao'))
const TelaVagas = lazy(() => import('./components/TelaVagas'))
const TelaAdaptarCurriculo = lazy(() => import('./components/TelaAdaptarCurriculo'))
const TelaDesafios = lazy(() => import('./components/TelaDesafios'))
const TelaDashboard = lazy(() => import('./components/TelaDashboard'))
const TelaHistorico = lazy(() => import('./components/TelaHistorico'))
const TelaConfiguracoes = lazy(() => import('./components/TelaConfiguracoes'))

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro na renderização da tela:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tela" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Ocorreu um erro ao carregar esta tela</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {this.state.error?.message || 'Erro inesperado na aplicação.'}
            </p>
            <button
              type="button"
              className="botao-primario"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function TelaCarregandoFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '360px',
        gap: '16px',
        color: 'var(--text-secondary)',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid var(--accent-subtle)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Carregando módulo…</span>
    </div>
  )
}

function ConteudoPrincipal() {
  const { usuario, carregandoSessao, estaDesbloqueando, telaAtiva } = useApp()

  // 1. Enquanto o Supabase valida a sessão segura no carregamento inicial
  if (carregandoSessao) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '3px solid var(--border-card)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Validando sessão segura...
        </span>
      </div>
    )
  }

  // 2. Se o usuário NÃO estiver logado, bloqueia completamente o acesso ao site
  if (!usuario) {
    return <TelaAuthGate />
  }

  // 3. Se estiver autenticado, libera a plataforma com transição suave
  return (
    <div className={`app-layout-superior ${estaDesbloqueando ? 'app-desbloqueado-transicao' : ''}`}>
      {/* Overlay momentâneo com badge elegante de desbloqueio */}
      {estaDesbloqueando && (
        <div className="desbloqueio-overlay" aria-live="assertive">
          <div className="desbloqueio-badge">
            <CheckCircle2 size={16} />
            <span>Acesso liberado • Bem-vindo(a), {usuario.nome || 'Usuário'}</span>
          </div>
        </div>
      )}

      {/* Skip Link para navegadores e leitores de tela (WCAG / Web Interface Guidelines) */}
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo-principal" className="conteudo-principal" tabIndex={-1}>
        <ErrorBoundary key={telaAtiva}>
          <Suspense fallback={<TelaCarregandoFallback />}>
            {telaAtiva === 'upload' && <TelaUpload />}
            {telaAtiva === 'avaliacao' && <TelaAvaliacao />}
            {telaAtiva === 'vagas' && <TelaVagas />}
            {telaAtiva === 'desafios' && <TelaDesafios />}
            {telaAtiva === 'adaptar' && <TelaAdaptarCurriculo />}
            {telaAtiva === 'dashboard' && <TelaDashboard />}
            {telaAtiva === 'historico' && <TelaHistorico />}
            {telaAtiva === 'configuracoes' && <TelaConfiguracoes />}
          </Suspense>
        </ErrorBoundary>
      </main>
      <BottomNav />
      <ModalAuth />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <ConteudoPrincipal />
    </AppProvider>
  )
}

export default App