import { useState, useEffect } from 'react'
import { Calendar, Trash2, History } from 'lucide-react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'
import SkillBadge from './SkillBadge'

function TelaHistorico() {
  const { setResultado, setTelaAtiva } = useApp()
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregarHistorico()
  }, [])

  async function carregarHistorico() {
    setCarregando(true)
    setErro(null)
    try {
      const dados = await api.listarHistorico()
      setLista(dados)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  async function abrirAnalise(id) {
    try {
      const detalhe = await api.detalheAnalise(id)
      setResultado(detalhe)
      setTelaAtiva('avaliacao')
    } catch (e) {
      alert('Erro ao carregar análise: ' + e.message)
    }
  }

  async function deletar(e, id) {
    e.stopPropagation()
    if (!window.confirm('Tem certeza que deseja remover esta análise do histórico?')) return
    try {
      await api.deletarAnalise(id)
      setLista((prev) => prev.filter((item) => item.id !== id))
    } catch (erroDelete) {
      alert('Erro ao deletar: ' + erroDelete.message)
    }
  }

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <span className="rotulo">Registro Permanente</span>
        <h1>Histórico de Avaliações</h1>
        <p className="tela-descricao">
          Todas as análises processadas ficam salvas localmente no banco de dados SQLite para você acompanhar seu progresso.
        </p>
      </header>

      {carregando && <p style={{ color: 'var(--text-muted)' }}>Carregando histórico do banco...</p>}
      {erro && <div className="mensagem-erro" style={{ marginBottom: '20px' }}>{erro}</div>}

      {!carregando && lista.length === 0 && (
        <div className="estado-vazio">
          <div className="estado-vazio-icone-box">
            <History size={24} />
          </div>
          <h2>Nenhum histórico registrado ainda</h2>
          <p>Envie seu currículo pela primeira vez para começar a construir seu histórico de evolução.</p>
          <button className="botao-primario" onClick={() => setTelaAtiva('upload')}>
            Novo Currículo
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {lista.map((item) => (
          <div
            key={item.id}
            onClick={() => abrirAnalise(item.id)}
            style={{
              padding: '20px 24px',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-focus)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-card)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Calendar size={13} />
                  {item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : 'Data recente'}
                </span>
                <span className="sidebar-badge" style={{ fontSize: '10.5px' }}>
                  {item.total_vagas} vagas encontradas
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {item.cargo_objetivo || 'Perfil de Tecnologia / TI'}
              </h3>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {item.skills?.slice(0, 6).map((skill, idx) => (
                  <SkillBadge key={idx} skill={skill} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>
                  Score Geral
                </span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {item.nota_geral}%
                </span>
              </div>

              <button
                onClick={(e) => deletar(e, item.id)}
                title="Excluir do histórico"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TelaHistorico
