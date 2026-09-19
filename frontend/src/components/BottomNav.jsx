import { useState } from 'react'
import {
  Award,
  Briefcase,
  FileCheck,
  Code2,
  Menu,
  X,
  History,
  TrendingUp,
  Settings,
  FileText,
  Compass,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'

function BottomNav() {
  const { telaAtiva, setTelaAtiva, resultado, limparAnaliseAtiva } = useApp()
  const [drawerAberto, setDrawerAberto] = useState(false)

  const totalVagas = resultado ? resultado.vagas_encontradas?.length || 0 : 0
  const notaGeral = resultado?.avaliacao?.nota_geral

  const itensPrincipais = [
    {
      id: 'avaliacao',
      label: 'Raio-X',
      icone: Award,
      badge: notaGeral ? `${notaGeral}%` : null,
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
      destaque: true,
    },
    {
      id: 'adaptar',
      label: 'Adequar',
      icone: FileCheck,
    },
  ]

  function navegar(telaId) {
    setTelaAtiva(telaId)
    setDrawerAberto(false)
  }

  function reiniciarCurriculo() {
    limparAnaliseAtiva()
    setDrawerAberto(false)
  }

  return (
    <>
      {/* Barra de Navegação Inferior para Celular */}
      <nav className="bottom-nav-mobile" aria-label="Navegação móvel principal">
        {itensPrincipais.map((item) => {
          const Icone = item.icone
          const ativo = telaAtiva === item.id

          if (item.destaque) {
            return (
              <button
                key={item.id}
                type="button"
                className={`bottom-nav-item bottom-nav-destaque ${ativo ? 'ativo' : ''}`}
                onClick={() => navegar(item.id)}
                aria-label="Acessar Desafios Técnicos estilo LeetCode"
              >
                <div className="bottom-nav-destaque-circle">
                  <Icone size={20} strokeWidth={2.4} />
                </div>
                <span style={{ fontSize: '10.5px', marginTop: '3px', fontWeight: 600 }}>{item.label}</span>
              </button>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav-item ${ativo ? 'ativo' : ''}`}
              onClick={() => navegar(item.id)}
              aria-current={ativo ? 'page' : undefined}
            >
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Icone size={20} strokeWidth={ativo ? 2.3 : 1.8} />
                {item.badge && <span className="bottom-nav-badge">{item.badge}</span>}
              </div>
              <span style={{ fontSize: '11px', marginTop: '2px' }}>{item.label}</span>
            </button>
          )
        })}

        {/* Botão Menu Mais */}
        <button
          type="button"
          className={`bottom-nav-item ${drawerAberto ? 'ativo' : ''}`}
          onClick={() => setDrawerAberto(!drawerAberto)}
          aria-label="Abrir menu de opções extras"
        >
          <Menu size={20} strokeWidth={1.8} />
          <span style={{ fontSize: '11px', marginTop: '2px' }}>Mais</span>
        </button>
      </nav>

      {/* Drawer / Menu Lateral Móvel para Opções Secundárias */}
      {drawerAberto && (
        <div className="bottom-nav-drawer-backdrop" onClick={() => setDrawerAberto(false)}>
          <div className="bottom-nav-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-nav-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>Vektor Menu</h3>
              </div>
              <button
                type="button"
                className="botao-fechar-drawer"
                onClick={() => setDrawerAberto(false)}
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bottom-nav-drawer-links">
              <button
                type="button"
                className="bottom-nav-drawer-btn"
                onClick={reiniciarCurriculo}
              >
                <FileText size={18} color="var(--accent)" />
                <span>Novo Currículo (Enviar outro PDF)</span>
              </button>

              <button
                type="button"
                className="bottom-nav-drawer-btn"
                onClick={() => navegar('dashboard')}
              >
                <TrendingUp size={18} color="var(--accent)" />
                <span>Tendências & Demanda do Setor</span>
              </button>

              <button
                type="button"
                className="bottom-nav-drawer-btn"
                onClick={() => navegar('historico')}
              >
                <History size={18} color="var(--accent)" />
                <span>Histórico de Análises</span>
              </button>

              <button
                type="button"
                className="bottom-nav-drawer-btn"
                onClick={() => navegar('configuracoes')}
              >
                <Settings size={18} color="var(--accent)" />
                <span>Ajustes & Localização</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BottomNav
