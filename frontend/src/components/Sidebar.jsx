import {
  FileText,
  Award,
  Briefcase,
  History,
  TrendingUp,
  Settings,
  Compass,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'

function Sidebar() {
  const { telaAtiva, setTelaAtiva, resultado } = useApp()
  const totalVagas = resultado ? resultado.vagas_encontradas.length : 0

  const itensNav = [
    { id: 'upload', label: 'Novo Currículo', icone: FileText },
    {
      id: 'avaliacao',
      label: 'Avaliação & Raio-X',
      icone: Award,
      badge: resultado ? `${resultado.avaliacao.nota_geral}%` : null,
    },
    {
      id: 'vagas',
      label: 'Vagas Compatíveis',
      icone: Briefcase,
      badge: totalVagas > 0 ? totalVagas : null,
    },
    { id: 'historico', label: 'Histórico Salvo', icone: History },
    { id: 'dashboard', label: 'Tendências do Mercado', icone: TrendingUp },
    { id: 'configuracoes', label: 'Configurações', icone: Settings },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-topo">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icone-box">
            <Compass size={18} strokeWidth={2.4} />
          </div>
          <span className="sidebar-logo-texto">Job Matcher</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {itensNav.map((item) => {
          const Icone = item.icone
          const ativo = telaAtiva === item.id
          return (
            <button
              key={item.id}
              className={`sidebar-item ${ativo ? 'ativo' : ''}`}
              onClick={() => setTelaAtiva(item.id)}
            >
              <span className="sidebar-item-icone">
                <Icone size={16} strokeWidth={ativo ? 2.2 : 1.8} />
              </span>
              <span>{item.label}</span>
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-rodape">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>v2.0 • Vektor Core</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar