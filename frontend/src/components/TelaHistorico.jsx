import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'

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
    if (!confirm('Deseja realmente excluir esta análise do histórico?')) return
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
        <p className="rotulo">Histórico Salvo</p>
        <h1>Análises Anteriores</h1>
        <p className="tela-descricao">
          Todas as análises de currículos processadas são armazenadas com SQLite para você acompanhar sua evolução.
        </p>
      </header>

      {carregando && <p style={{ color: 'var(--tinta-suave)' }}>Carregando histórico do banco...</p>}
      {erro && <p className="mensagem-erro">{erro}</p>}

      {!carregando && lista.length === 0 && (
        <div className="estado-vazio">
          <h2>Nenhuma análise salva ainda</h2>
          <p>Faça o upload do seu currículo em PDF para registrar sua primeira análise.</p>
          <button className="botao-secundario" onClick={() => setTelaAtiva('upload')}>
            Novo currículo
          </button>
        </div>
      )}

      <div className="lista-historico" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {lista.map((item) => (
          <div
            key={item.id}
            onClick={() => abrirAnalise(item.id)}
            style={{
              padding: '18px 22px',
              border: '1px solid var(--linha)',
              borderRadius: '4px',
              backgroundColor: 'var(--papel)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'border-color 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="rotulo-pequeno" style={{ margin: 0 }}>
                  {item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : 'Data não informada'}
                </span>
                <span className="sidebar-badge">{item.total_vagas} vagas</span>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontFamily: 'var(--fonte-titulo)' }}>
                {item.cargo_objetivo || 'Perfil de TI / Dados'}
              </h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {item.skills.slice(0, 5).map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--fonte-dado)',
                      backgroundColor: 'var(--latao-fundo)',
                      color: 'var(--latao)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <span className="rotulo-pequeno" style={{ display: 'block' }}>Score</span>
                <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--latao)', fontFamily: 'var(--fonte-dado)' }}>
                  {item.nota_geral}%
                </span>
              </div>
              <button
                onClick={(e) => deletar(e, item.id)}
                title="Excluir"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--tinta-suave)',
                  fontSize: '16px',
                  padding: '6px',
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TelaHistorico
