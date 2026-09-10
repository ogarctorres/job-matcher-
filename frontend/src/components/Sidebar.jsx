import { useApp } from '../contexts/AppContext'

function Sidebar() {
  const { telaAtiva, setTelaAtiva, resultado } = useApp()
  const totalVagas = resultado ? resultado.vagas_encontradas.length : 0

  return (
    <aside className="sidebar">
      <div className="sidebar-topo">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icone">◈</span>
          <span className="sidebar-logo-texto">Job Matcher</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${telaAtiva === 'upload' ? 'ativo' : ''}`}
          onClick={() => setTelaAtiva('upload')}
        >
          <span className="sidebar-item-icone">01</span>
          Novo currículo
        </button>

        <button
          className={`sidebar-item ${telaAtiva === 'avaliacao' ? 'ativo' : ''}`}
          onClick={() => setTelaAtiva('avaliacao')}
        >
          <span className="sidebar-item-icone">02</span>
          Avaliação
          {resultado && <span className="sidebar-badge">{resultado.avaliacao.nota_geral}%</span>}
        </button>

        <button
          className={`sidebar-item ${telaAtiva === 'vagas' ? 'ativo' : ''}`}
          onClick={() => setTelaAtiva('vagas')}
        >
          <span className="sidebar-item-icone">03</span>
          Vagas encontradas
          {totalVagas > 0 && <span className="sidebar-badge">{totalVagas}</span>}
        </button>

        <button
          className={`sidebar-item ${telaAtiva === 'historico' ? 'ativo' : ''}`}
          onClick={() => setTelaAtiva('historico')}
        >
          <span className="sidebar-item-icone">04</span>
          Histórico Salvo
        </button>

        <button
          className={`sidebar-item ${telaAtiva === 'dashboard' ? 'ativo' : ''}`}
          onClick={() => setTelaAtiva('dashboard')}
        >
          <span className="sidebar-item-icone">05</span>
          Tendências TI
        </button>
      </nav>

      <div className="sidebar-rodape">
        <p>Job Matcher v2.0 • Powered by Gemini & SQLite</p>
      </div>
    </aside>
  )
}

export default Sidebar