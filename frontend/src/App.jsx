import Sidebar from './components/Sidebar'
import TelaUpload from './components/TelaUpload'
import TelaAvaliacao from './components/TelaAvaliacao'
import TelaVagas from './components/TelaVagas'
import TelaHistorico from './components/TelaHistorico'
import TelaDashboard from './components/TelaDashboard'
import { AppProvider, useApp } from './contexts/AppContext'
import './App.css'

function ConteudoPrincipal() {
  const { telaAtiva } = useApp()

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="conteudo-principal">
        {telaAtiva === 'upload' && <TelaUpload />}
        {telaAtiva === 'avaliacao' && <TelaAvaliacao />}
        {telaAtiva === 'vagas' && <TelaVagas />}
        {telaAtiva === 'historico' && <TelaHistorico />}
        {telaAtiva === 'dashboard' && <TelaDashboard />}
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