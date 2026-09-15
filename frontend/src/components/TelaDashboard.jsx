import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, Target, Briefcase, RefreshCw } from 'lucide-react'
import { api } from '../services/api'

function TelaDashboard() {
  const [stats, setStats] = useState(null)
  const [tendencias, setTendencias] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    setErro(null)
    try {
      const [resStats, resTendencias] = await Promise.all([
        api.obterEstatisticas(),
        api.obterTendencias('estagio ti'),
      ])
      setStats(resStats)
      setTendencias(resTendencias)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="rotulo">Inteligência de Mercado</span>
            <h1>Tendências & Demandas do Setor</h1>
            <p className="tela-descricao">
              Estatísticas consolidadas das suas análises combinadas com mineração em tempo real das vagas de tecnologia abertas no Brasil.
            </p>
          </div>
          <button
            type="button"
            className="botao-secundario"
            onClick={carregarDados}
            disabled={carregando}
            aria-label="Atualizar dados e tendências do mercado"
            style={{ fontSize: '12.5px', padding: '7px 14px' }}
          >
            <RefreshCw size={14} className={carregando ? 'animar-spin' : ''} style={carregando ? { animation: 'spin 1s linear infinite' } : {}} aria-hidden="true" />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </header>

      {erro && <div className="mensagem-erro" role="alert" style={{ marginBottom: '24px' }}>{erro}</div>}

      {/* Grid de Métricas Principais com números tabulares */}
      {stats && (
        <div className="dashboard-grid-metricas">
          <div className="card-metrica">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-metrica-rotulo">Currículos Avaliados</span>
              <Target size={18} color="var(--accent)" aria-hidden="true" />
            </div>
            <span className="card-metrica-valor tabular-nums">{stats.total_analises}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registrados no banco SQLite</span>
          </div>

          <div className="card-metrica">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-metrica-rotulo">Score Médio Geral</span>
              <BarChart3 size={18} color="var(--success)" aria-hidden="true" />
            </div>
            <span className="card-metrica-valor tabular-nums">{stats.nota_media}%</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Média ponderada do perfil</span>
          </div>

          <div className="card-metrica">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-metrica-rotulo">Vagas Monitoradas</span>
              <Briefcase size={18} color="var(--warning)" aria-hidden="true" />
            </div>
            <span className="card-metrica-valor tabular-nums">{tendencias?.total_vagas_analisadas || 0}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Anúncios recentes analisados</span>
          </div>
        </div>
      )}

      {/* Gráfico de Habilidades em Alta */}
      {tendencias?.top_skills_em_alta && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={18} color="var(--accent)" aria-hidden="true" />
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Skills Mais Requisitadas nos Anúncios de Estágio
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tendencias.top_skills_em_alta.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '130px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                  {item.skill}
                </span>
                <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.porcentagem}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--accent), #60a5fa)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <span className="tabular-nums" style={{ width: '60px', textAlign: 'right', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {item.porcentagem}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TelaDashboard
