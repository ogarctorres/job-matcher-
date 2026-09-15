import Header from './components/Header'
import TelaUpload from './components/TelaUpload'
import TelaAvaliacao from './components/TelaAvaliacao'
import TelaVagas from './components/TelaVagas'
import TelaAdaptarCurriculo from './components/TelaAdaptarCurriculo'
import TelaHistorico from './components/TelaHistorico'
import TelaDashboard from './components/TelaDashboard'
import TelaConfiguracoes from './components/TelaConfiguracoes'
import { AppProvider, useApp } from './contexts/AppContext'
import './App.css'

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
        {telaAtiva === 'upload' && <TelaUpload />}
        {telaAtiva === 'avaliacao' && <TelaAvaliacao />}
        {telaAtiva === 'vagas' && <TelaVagas />}
        {telaAtiva === 'adaptar' && <TelaAdaptarCurriculo />}
        {telaAtiva === 'dashboard' && <TelaDashboard />}
        {telaAtiva === 'historico' && <TelaHistorico />}
        {telaAtiva === 'configuracoes' && <TelaConfiguracoes />}
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