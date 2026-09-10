import { useState, useEffect } from 'react'
import { api } from '../services/api'

function TelaDashboard() {
  const [stats, setStats] = useState(null)
  const [tendencias, setTendencias] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true)
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
    carregarDados()
  }, [])

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <p className="rotulo">Inteligência de Mercado</p>
        <h1>Dashboard & Tendências</h1>
        <p className="tela-descricao">
          Métricas calculadas sobre suas análises de currículo cruzadas com as habilidades mais exigidas pelas vagas abertas no mercado brasileiro.
        </p>
      </header>

      {carregando && <p style={{ color: 'var(--tinta-suave)' }}>Processando estatísticas e mineração de vagas...</p>}
      {erro && <p className="mensagem-erro">{erro}</p>}

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '18px', border: '1px solid var(--linha)', backgroundColor: 'var(--papel)', borderRadius: '4px' }}>
            <span className="rotulo-pequeno">Total de Análises</span>
            <h2 style={{ margin: '8px 0 0', fontSize: '28px', fontFamily: 'var(--fonte-dado)', color: 'var(--latao)' }}>
              {stats.total_analises}
            </h2>
          </div>

          <div style={{ padding: '18px', border: '1px solid var(--linha)', backgroundColor: 'var(--papel)', borderRadius: '4px' }}>
            <span className="rotulo-pequeno">Média de Nota</span>
            <h2 style={{ margin: '8px 0 0', fontSize: '28px', fontFamily: 'var(--fonte-dado)', color: 'var(--latao)' }}>
              {stats.nota_media}%
            </h2>
          </div>

          <div style={{ padding: '18px', border: '1px solid var(--linha)', backgroundColor: 'var(--papel)', borderRadius: '4px' }}>
            <span className="rotulo-pequeno">Vagas Analisadas</span>
            <h2 style={{ margin: '8px 0 0', fontSize: '28px', fontFamily: 'var(--fonte-dado)', color: 'var(--tinta)' }}>
              {tendencias ? tendencias.total_vagas_analisadas : 0}
            </h2>
          </div>
        </div>
      )}

      {tendencias && tendencias.top_skills_em_alta && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--fonte-titulo)', marginBottom: '16px' }}>
            🔥 Skills Mais Demandadas em Estágio de TI
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tendencias.top_skills_em_alta.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '110px', fontSize: '13px', fontFamily: 'var(--fonte-dado)', textTransform: 'capitalize' }}>
                  {item.skill}
                </span>
                <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--linha)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.porcentagem}%`,
                      height: '100%',
                      backgroundColor: 'var(--latao)',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <span style={{ width: '50px', textAlign: 'right', fontSize: '12px', fontFamily: 'var(--fonte-dado)', color: 'var(--tinta-suave)' }}>
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
