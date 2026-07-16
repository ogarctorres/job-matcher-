function Sidebar({ telaAtiva, mudarTela, totalVagas}) {
    return (
    <aside className="sidebar">
      <div className="sidebar-topo">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icone">
            <span className="barra b1" />
            <span className="barra b2" />
            <span className="barra b3" />
          </div>
          <span className="sidebar-logo-texto">Job Matcher</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <button className={`sidebar-item ${telaAtiva === 'upload' ? 'ativo' : ''}`} onClick={() => mudarTela('upload')}>
          <span className="sidebar-item-icone">📄</span>
          Novo currículo
        </button>
        <button className={`sidebar-item ${telaAtiva === 'vagas' ? 'ativo' : ''}`} onClick={() => mudarTela('vagas')}>
          <span className="sidebar-item-icone">💼</span>
          Vagas encontradas
          {totalVagas > 0 && <span className="sidebar-badge">{totalVagas}</span>}
        </button>
      </nav>
      <div className="sidebar-rodape"><p>Rodando com IA local via Ollama</p></div>
    </aside>
  )
}
export default Sidebar