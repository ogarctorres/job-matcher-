import {
  FileText,
  Award,
  Briefcase,
  Wand2,
  History,
  TrendingUp,
  Settings,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import LogoVektor from './LogoVektor'

function Header() {
  const { telaAtiva, setTelaAtiva, resultado } = useApp()
  const totalVagas = resultado ? resultado.vagas_encontradas?.length || 0 : 0

  const itensNav = [
    { id: 'upload', label: 'Novo Currículo', icone: FileText },
    {
      id: 'avaliacao',
      label: 'Raio-X',
      icone: Award,
      badge: resultado ? `${resultado.avaliacao.nota_geral}%` : null,
    },
    {
      id: 'vagas',
      label: 'Vagas',
      icone: Briefcase,
      badge: totalVagas > 0 ? totalVagas : null,
    },
    {
      id: 'adaptar',
      label: 'Otimizar p/ Vaga',
      icone: Wand2,
      destaque: true,
    },
    { id: 'dashboard', label: 'Tendências', icone: TrendingUp },
    { id: 'historico', label: 'Histórico', icone: History },
    { id: 'configuracoes', label: 'Ajustes', icone: Settings },
  ]

  return (
    <header className="app-header">
      <div className="app-header-conteudo">
        {/* Logo Vektor Oficial */}
        <div className="header-logo" onClick={() => setTelaAtiva('upload')} style={{ cursor: 'pointer' }}>
          <LogoVektor tamanho={26} />
        </div>

        {/* Menu Horizontal de Navegação */}
        <nav className="header-nav">
          {itensNav.map((item) => {
            const Icone = item.icone
            const ativo = telaAtiva === item.id
            return (
              <button
                key={item.id}
                className={`header-nav-item ${ativo ? 'ativo' : ''} ${item.destaque ? 'item-destaque' : ''}`}
                onClick={() => setTelaAtiva(item.id)}
              >
                <Icone size={15} strokeWidth={ativo ? 2.2 : 1.8} />
                <span>{item.label}</span>
                {item.badge && <span className="header-badge">{item.badge}</span>}
              </button>
            )
          })}
        </nav>

        {/* Status / Ação Rápida */}
        <div className="header-status">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Gemini 3.6 Flash
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
