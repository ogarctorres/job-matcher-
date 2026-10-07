import { useState, useEffect, useMemo } from 'react'
import {
  Target,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Building2,
  Flame,
  Check,
  Compass,
  AlertCircle,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { api } from '../services/api'

export default function TelaRoadmap() {
  const { resultado, vagaParaRoadmap, setVagaParaRoadmap } = useApp()

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [dadosRoadmap, setDadosRoadmap] = useState(null)
  const [trilhasPadrao, setTrilhasPadrao] = useState([])
  const [trilhaAtivaId, setTrilhaAtivaId] = useState(null)

  // Checklist interativo persistido no localStorage
  const [tarefasConcluidas, setTarefasConcluidas] = useState(() => {
    try {
      const salvo = window.localStorage.getItem('vektor_roadmap_checks')
      return salvo ? JSON.parse(salvo) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem('vektor_roadmap_checks', JSON.stringify(tarefasConcluidas))
    } catch {
      // Ignora erro de localStorage
    }
  }, [tarefasConcluidas])

  // Busca trilhas padrão ao montar
  useEffect(() => {
    api.obterTrilhasRoadmap()
      .then((res) => {
        if (res && res.trilhas) {
          setTrilhasPadrao(res.trilhas)
        }
      })
      .catch((err) => console.warn('Erro ao carregar trilhas pré-definidas:', err))
  }, [])

  // Dispara geração do Roadmap
  useEffect(() => {
    let montado = true
    setCarregando(true)
    setErro(null)

    const skills = resultado?.dados_curriculo?.skills || []
    const cargoAlvo = vagaParaRoadmap?.titulo || resultado?.dados_curriculo?.cargo_objetivo || 'Desenvolvedor de Software'

    api.gerarRoadmap({
      skillsCandidato: skills,
      cargoAlvo,
      vagaAlvo: vagaParaRoadmap || null,
    })
      .then((resposta) => {
        if (montado) {
          setDadosRoadmap(resposta)
          setCarregando(false)
        }
      })
      .catch((err) => {
        if (montado) {
          console.warn('[roadmap] Falha na rota de IA, usando trilha base:', err)
          setErro('Não foi possível gerar um plano personalizado via IA agora. Exibindo trilha padrão.')
          setCarregando(false)
        }
      })

    return () => {
      montado = false
    }
  }, [resultado, vagaParaRoadmap])

  // Alternar checkbox de tarefa
  function toggleTarefa(semanaIdx, tarefaIdx) {
    const chave = `${dadosRoadmap?.cargo_analisado || 'default'}_s${semanaIdx}_t${tarefaIdx}`
    setTarefasConcluidas((prev) => ({
      ...prev,
      [chave]: !prev[chave],
    }))
  }

  // Contagem de tarefas para a barra de progresso
  const totalTarefas = useMemo(() => {
    if (!dadosRoadmap?.plano_30_dias) return 0
    return dadosRoadmap.plano_30_dias.reduce((total, sem) => total + (sem.tarefas?.length || 0), 0)
  }, [dadosRoadmap])

  const tarefasMarcadas = useMemo(() => {
    if (!dadosRoadmap?.plano_30_dias) return 0
    let count = 0
    dadosRoadmap.plano_30_dias.forEach((sem, sIdx) => {
      sem.tarefas?.forEach((_, tIdx) => {
        const chave = `${dadosRoadmap?.cargo_analisado || 'default'}_s${sIdx}_t${tIdx}`
        if (tarefasConcluidas[chave]) count++
      })
    })
    return count
  }, [dadosRoadmap, tarefasConcluidas])

  const percentualProgresso = totalTarefas > 0 ? Math.round((tarefasMarcadas / totalTarefas) * 100) : 0

  function selecionarTrilhaModelo(trilha) {
    setTrilhaAtivaId(trilha.id)
    setDadosRoadmap(trilha)
    setVagaParaRoadmap(null)
  }

  return (
    <div className="tela tela-roadmap" style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 16px 80px' }}>
      {/* Banner de contextualização com vaga selecionada */}
      {vagaParaRoadmap && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 18px',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={18} color="#c084fc" />
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              Plano de 30 dias calibrado para a oportunidade: <strong>{vagaParaRoadmap.titulo}</strong> na <strong>{vagaParaRoadmap.empresa}</strong>
            </span>
          </div>
          <button
            type="button"
            className="botao-secundario"
            onClick={() => setVagaParaRoadmap(null)}
            style={{ fontSize: '11.5px', padding: '4px 10px' }}
          >
            Focar no Perfil Geral
          </button>
        </div>
      )}

      {erro && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            fontSize: '12.5px',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
          <span>{erro}</span>
        </div>
      )}

      {/* Header Principal da Tela */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
            }}
          >
            <Compass size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Skill Gap & Plano de Estudos de 30 Dias
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Identificação precisa de lacunas técnicas e cronograma semanal acelerado para atingir aprovação nas vagas.
            </p>
          </div>
        </div>

        {/* Trilhas rápidas pré-definidas */}
        {trilhasPadrao.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Trilhas Prontas:</span>
            {trilhasPadrao.map((trilha) => (
              <button
                key={trilha.id}
                type="button"
                className={`botao-secundario ${trilhaAtivaId === trilha.id ? 'ativo' : ''}`}
                onClick={() => selecionarTrilhaModelo(trilha)}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-full)',
                  borderColor: trilhaAtivaId === trilha.id ? 'var(--accent)' : 'var(--border-subtle)',
                }}
              >
                <span>{trilha.icone} {trilha.nome}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {carregando && (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-card)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid rgba(168, 85, 247, 0.2)',
              borderTopColor: '#c084fc',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Mapeando Gaps e Desenhando seu Plano de 30 Dias com IA...
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Comparando seu histórico com os requisitos reais do mercado de tecnologia.
          </p>
        </div>
      )}

      {!carregando && dadosRoadmap && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Card Resumo & Barra de Progresso do Checklist */}
          <div
            style={{
              padding: '20px 24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Diagnóstico Estratégico
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                  {dadosRoadmap.cargo_analisado}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                  }}
                >
                  Nível: {dadosRoadmap.nivel_aderencia || 'Em Desenvolvimento'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tarefasMarcadas} de {totalTarefas} metas concluídas ({percentualProgresso}%)
                </span>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${percentualProgresso}%`,
                  height: '100%',
                  backgroundColor: percentualProgresso === 100 ? '#10b981' : '#c084fc',
                  transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            </div>
          </div>

          {/* Matriz de Gaps de Habilidades */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="var(--accent)" />
              Matriz de Gaps de Habilidades
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {/* Gaps Críticos */}
              <div
                style={{
                  padding: '18px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f87171', margin: 0 }}>
                    Gaps Críticos (Eliminatórios)
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dadosRoadmap.gaps_criticos?.map((gap, i) => (
                    <div key={i} style={{ padding: '8px 10px', backgroundColor: 'rgba(239, 68, 68, 0.06)', borderRadius: '6px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>{gap.skill}</strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{gap.motivo}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaps Diferenciais */}
              <div
                style={{
                  padding: '18px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c084fc' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#c084fc', margin: 0 }}>
                    Gaps Diferenciais (Destaque)
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dadosRoadmap.gaps_diferenciais?.map((gap, i) => (
                    <div key={i} style={{ padding: '8px 10px', backgroundColor: 'rgba(168, 85, 247, 0.06)', borderRadius: '6px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>{gap.skill}</strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{gap.motivo}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competências que você já tem */}
              <div
                style={{
                  padding: '18px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#34d399', margin: 0 }}>
                    Competências Consolidadas
                  </h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {dadosRoadmap.skills_consolidadas?.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#34d399',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Check size={12} />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cronograma de 4 Semanas (30 Dias) */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#60a5fa" />
              Cronograma Semanal de 30 Dias (Sprints de Aceleração)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {dadosRoadmap.plano_30_dias?.map((semana, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    padding: '22px 24px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Cabeçalho da Semana */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {semana.semana || sIdx + 1}
                      </span>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {semana.titulo}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      <span>{semana.horas_semana || 6}h estimadas na semana</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    <strong>Foco:</strong> {semana.foco}
                  </p>

                  {/* Checklist de Tarefas Práticas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Metas da Semana (Clique para concluir):
                    </span>

                    {semana.tarefas?.map((tarefa, tIdx) => {
                      const chave = `${dadosRoadmap?.cargo_analisado || 'default'}_s${sIdx}_t${tIdx}`
                      const feita = Boolean(tarefasConcluidas[chave])
                      return (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => toggleTarefa(sIdx, tIdx)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: feita ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                            border: `1px solid ${feita ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ marginTop: '2px', color: feita ? '#10b981' : 'var(--text-muted)' }}>
                            {feita ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                          </div>
                          <div>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: feita ? 'var(--text-muted)' : 'var(--text-primary)',
                                textDecoration: feita ? 'line-through' : 'none',
                                display: 'block',
                              }}
                            >
                              {tarefa.titulo}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {tarefa.descricao}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Destaque: Projeto Prático & Dica para Entrevista */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '6px' }}>
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'rgba(59, 130, 246, 0.06)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <BookOpen size={13} />
                        Projeto de Portfólio da Semana
                      </span>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                        {semana.projeto_pratico}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'rgba(234, 179, 8, 0.06)',
                        border: '1px solid rgba(234, 179, 8, 0.2)',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#facc15', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Flame size={13} />
                        Como Defender na Entrevista (STAR)
                      </span>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                        {semana.dica_entrevista}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
