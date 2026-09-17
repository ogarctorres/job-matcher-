import { lazy, Suspense } from 'react'
import Header from './components/Header'
import TelaUpload from './components/TelaUpload'
import { AppProvider, useApp } from './contexts/AppContext'
import './App.css'

// Carregamento sob demanda (Code Splitting via React.lazy) para reduzir bundle inicial
const TelaAvaliacao = lazy(() => import('./components/TelaAvaliacao'))
const TelaVagas = lazy(() => import('./components/TelaVagas'))
const TelaAdaptarCurriculo = lazy(() => import('./components/TelaAdaptarCurriculo'))
const TelaDashboard = lazy(() => import('./components/TelaDashboard'))
const TelaHistorico = lazy(() => import('./components/TelaHistorico'))
const TelaConfiguracoes = lazy(() => import('./components/TelaConfiguracoes'))

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
  const { telaAtiva } = useApp()

  return (
    <div className="app-layout-superior">
      {/* Skip Link para navegadores e leitores de tela (WCAG / Web Interface Guidelines) */}
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo-principal" className="conteudo-principal" tabIndex={-1}>
        <Suspense fallback={<TelaCarregandoFallback />}>
          {telaAtiva === 'upload' && <TelaUpload />}
          {telaAtiva === 'avaliacao' && <TelaAvaliacao />}
          {telaAtiva === 'vagas' && <TelaVagas />}
          {telaAtiva === 'adaptar' && <TelaAdaptarCurriculo />}
          {telaAtiva === 'dashboard' && <TelaDashboard />}
          {telaAtiva === 'historico' && <TelaHistorico />}
          {telaAtiva === 'configuracoes' && <TelaConfiguracoes />}
        </Suspense>
      </main>
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