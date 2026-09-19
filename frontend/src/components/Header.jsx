import { useState, useRef, useEffect } from 'react'
import {
  FileText,
  Award,
  Briefcase,
  Code2,
  FileCheck,
  History,
  TrendingUp,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import LogoVektor from './LogoVektor'

function Header() {
  const {
    telaAtiva,
    setTelaAtiva,
    resultado,
    limparAnaliseAtiva,
    usuario,
    abrirModalAuth,
    fazerLogout,
  } = useApp()

  const [dropdownAberto, setDropdownAberto] = useState(false)
  const dropdownRef = useRef(null)
  const totalVagas = resultado ? resultado.vagas_encontradas?.length || 0 : 0

  useEffect(() => {
    function handleClickFora(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

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

        {/* Menu Horizontal de Navegação */}
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

        {/* Área de Autenticação / Perfil do Usuário */}
        <div className="header-auth-area" ref={dropdownRef}>
          {!usuario ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="header-btn-ghost"
                onClick={() => abrirModalAuth('login')}
              >
                Entrar
              </button>
              <button
                type="button"
                className="header-btn-cta"
                onClick={() => abrirModalAuth('cadastro')}
              >
                Criar Conta Grátis
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="header-perfil-btn"
                onClick={() => setDropdownAberto(!dropdownAberto)}
                aria-expanded={dropdownAberto}
                aria-haspopup="true"
              >
                <div className="header-avatar-circle">
                  {usuario.avatar || 'LM'}
                </div>
                <div className="header-usuario-texto">
                  <span className="header-usuario-nome">{usuario.nome}</span>
                  <span className="header-plano-badge">{usuario.plano || 'Gratuito'}</span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transition: 'transform 0.15s ease', transform: dropdownAberto ? 'rotate(180deg)' : 'none' }} />
              </button>

              {dropdownAberto && (
                <div className="header-dropdown-menu" role="menu">
                  <div className="header-dropdown-header">
                    <p className="header-dropdown-user-nome">{usuario.nome}</p>
                    <p className="header-dropdown-user-email">{usuario.email}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span className="header-plano-pill">Plano {usuario.plano || 'Gratuito'}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• Vektor Free</span>
                    </div>
                  </div>

                  <div className="header-dropdown-divisor" />

                  <button
                    type="button"
                    className="header-dropdown-item"
                    onClick={() => {
                      setTelaAtiva('historico')
                      setDropdownAberto(false)
                    }}
                    role="menuitem"
                  >
                    <History size={14} />
                    <span>Histórico Salvo</span>
                  </button>

                  <button
                    type="button"
                    className="header-dropdown-item"
                    onClick={() => {
                      setTelaAtiva('configuracoes')
                      setDropdownAberto(false)
                    }}
                    role="menuitem"
                  >
                    <Settings size={14} />
                    <span>Ajustes da Conta</span>
                  </button>

                  <div className="header-dropdown-divisor" />

                  <button
                    type="button"
                    className="header-dropdown-item header-dropdown-item-logout"
                    onClick={() => {
                      fazerLogout()
                      setDropdownAberto(false)
                    }}
                    role="menuitem"
                  >
                    <LogOut size={14} />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
