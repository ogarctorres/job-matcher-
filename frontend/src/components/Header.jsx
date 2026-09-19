import {
  FileText,
  Award,
  Briefcase,
  Code2,
  FileCheck,
  History,
  TrendingUp,
  Settings,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import LogoVektor from './LogoVektor'

function Header() {
  const { telaAtiva, setTelaAtiva, resultado, limparAnaliseAtiva } = useApp()
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
      id: 'desafios',
      label: 'LeetCode',
      icone: Code2,
    },
    {
      id: 'adaptar',
      label: 'Adequar p/ Vaga',
      icone: FileCheck,
      destaque: true,
    },
    { id: 'dashboard', label: 'Tendências', icone: TrendingUp },
    { id: 'historico', label: 'Histórico', icone: History },
    { id: 'configuracoes', label: 'Ajustes', icone: Settings },
  ]

  return (
    <header className="app-header">
      <div className="app-header-conteudo">
        {/* Logo Vektor Oficial com elemento interativo semântico */}
        <button
          type="button"
          className="header-logo-btn"
          onClick={limparAnaliseAtiva}
          aria-label="Ir para a tela de envio de currículo e iniciar nova análise"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <LogoVektor tamanho={26} />
        </button>

        {/* Menu Horizontal de Navegação com semântica e estados de acessibilidade */}
        <nav className="header-nav" aria-label="Navegação principal">
          {itensNav.map((item) => {
            const Icone = item.icone
            const ativo = telaAtiva === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`header-nav-item ${ativo ? 'ativo' : ''} ${item.destaque ? 'item-destaque' : ''}`}
                onClick={() => {
                  if (item.id === 'upload') {
                    limparAnaliseAtiva()
                  } else {
                    setTelaAtiva(item.id)
                  }
                }}
                aria-current={ativo ? 'page' : undefined}
              >
                <Icone size={15} strokeWidth={ativo ? 2.2 : 1.8} aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge && <span className="header-badge tabular-nums">{item.badge}</span>}
              </button>
            )
          })}
        </nav>

        {/* Status da Plataforma */}
        <div className="header-status" role="status" aria-label="Status da Plataforma: Vektor Carreiras Ativo">
          <span
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}
            aria-hidden="true"
          />
          <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Vektor Carreiras
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
