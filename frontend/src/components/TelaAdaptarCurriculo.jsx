import { useState, useEffect } from 'react'
import {
  Wand2,
  Copy,
  Check,
  Download,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Target,
  ChevronRight,
} from 'lucide-react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'
import { useCopiaClipboard } from '../hooks/useCopiaClipboard'
import SkillBadge from './SkillBadge'

function TelaAdaptarCurriculo() {
  const { resultado, vagaParaAdaptar, setVagaParaAdaptar, setTelaAtiva } = useApp()
  const [tituloVaga, setTituloVaga] = useState('')
  const [descricaoVaga, setDescricaoVaga] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [curriculoAdaptado, setCurriculoAdaptado] = useState(null)
  const { copiado, copiar } = useCopiaClipboard()

  // Se veio de um clique em uma vaga recomendada, preenche automaticamente
  useEffect(() => {
    if (vagaParaAdaptar) {
      setTituloVaga(vagaParaAdaptar.titulo || '')
      setDescricaoVaga(vagaParaAdaptar.descricao || '')
    }
  }, [vagaParaAdaptar])

  async function handleAdaptar(e, forcarGenerico = false) {
    e?.preventDefault()
    if (!forcarGenerico && !descricaoVaga.trim()) {
      setErro('Por favor, cole a descrição e requisitos da vaga desejada ou clique em "Gerar Versão Geral ATS".')
      return
    }

    if (!resultado?.dados_curriculo) {
      setErro('Envie primeiro um currículo na aba "Novo Currículo" para podermos utilizar seu histórico e competências.')
      return
    }

    setCarregando(true)
    setErro(null)

    try {
      const res = await api.adaptarCurriculo({
        textoCurriculo: resultado.dados_curriculo?.resumo || '',
        dadosCurriculo: resultado.dados_curriculo || {},
        descricaoVaga: forcarGenerico ? '' : descricaoVaga,
        tituloVaga: forcarGenerico ? 'Perfil Geral de Tecnologia' : (tituloVaga || 'Vaga de Tecnologia'),
        modoGenerico: forcarGenerico,
      })
      setCurriculoAdaptado(res)
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
    }
  }

  function handleBaixarTexto() {
    if (!curriculoAdaptado?.curriculo_formatado_markdown) return
    const blob = new Blob([curriculoAdaptado.curriculo_formatado_markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `curriculo_${curriculoAdaptado.modo === 'generico' ? 'geral_ats' : 'otimizado_vaga'}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <span className="rotulo">ATS Tailoring & Job Matching Estratégico</span>
        <h1>Otimizador de Currículo para Vagas Específicas</h1>
        <p className="tela-descricao">
          Cole a descrição de qualquer vaga (LinkedIn, Gupy ou das recomendações). O motor de Job Matching analisa os requisitos obrigatórios, identifica GAPs sem inventar competências e realinha seu currículo sob medida para a oportunidade.
        </p>
      </header>

      {/* Alerta se não houver currículo carregado */}
      {!resultado?.dados_curriculo && (
        <div
          style={{
            backgroundColor: 'var(--warning-subtle)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
              Nenhum currículo ativo encontrado. Envie um PDF para preenchermos sua base de competências reais.
            </span>
          </div>
          <button
            className="botao-secundario"
            onClick={() => setTelaAtiva('upload')}
            style={{ padding: '6px 12px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
          >
            Fazer Upload de PDF
          </button>
        </div>
      )}

      {/* Formulário de Entrada da Vaga */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          marginBottom: '32px',
        }}
      >
        <form onSubmit={(e) => handleAdaptar(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label
              htmlFor="input-titulo-vaga"
              style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Título do Cargo ou Vaga
            </label>
            <input
              id="input-titulo-vaga"
              name="tituloVaga"
              type="text"
              className="campo-busca-input"
              placeholder="Ex: Estágio em Engenharia de Dados, Desenvolvedor Python Júnior…"
              value={tituloVaga}
              onChange={(e) => setTituloVaga(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label
              htmlFor="textarea-descricao-vaga"
              style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Descrição e Requisitos da Vaga (Cole aqui o texto da publicação)
            </label>
            <textarea
              id="textarea-descricao-vaga"
              name="descricaoVaga"
              className="campo-busca-input"
              rows={6}
              placeholder="Cole aqui os requisitos, responsabilidades e tecnologias mencionadas no anúncio da vaga…"
              value={descricaoVaga}
              onChange={(e) => setDescricaoVaga(e.target.value)}
              style={{ width: '100%', resize: 'vertical', lineHeight: '1.5' }}
            />
          </div>

          {erro && <div className="mensagem-erro" role="alert">{erro}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              className="botao-secundario"
              disabled={carregando}
              onClick={(e) => handleAdaptar(e, true)}
              title="Gera uma versão profissional ATS-friendly baseada no perfil geral sem necessidade de vaga específica"
              style={{ fontSize: '13px' }}
            >
              <Sparkles size={15} />
              <span>Gerar Versão Geral ATS</span>
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              {vagaParaAdaptar && (
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={() => {
                    setVagaParaAdaptar(null)
                    setTituloVaga('')
                    setDescricaoVaga('')
                  }}
                >
                  Limpar Campos
                </button>
              )}
              <button
                type="submit"
                className="botao-primario"
                disabled={carregando || !descricaoVaga.trim()}
              >
                {carregando ? (
                  <>
                    <Loader2 size={16} className="animar-spin" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                    <span>Executando Job Matching com IA…</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={16} aria-hidden="true" />
                    <span>Otimizar para esta Vaga (Job Match)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Resultados da Otimização */}
      {curriculoAdaptado && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {/* Cabeçalho de Resultados */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {curriculoAdaptado.modo === 'generico' ? 'Currículo Geral ATS Gerado' : 'Currículo Adaptado para a Vaga'}
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: curriculoAdaptado.modo === 'generico' ? 'var(--accent-subtle)' : 'var(--success-subtle)',
                    color: curriculoAdaptado.modo === 'generico' ? 'var(--accent)' : 'var(--success)',
                    border: `1px solid ${curriculoAdaptado.modo === 'generico' ? 'var(--accent-border)' : 'var(--success-border)'}`,
                  }}
                >
                  {curriculoAdaptado.modo === 'generico' ? 'MODO 1: GENÉRICO' : 'MODO 2: JOB MATCHING'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Alvo: <strong>{curriculoAdaptado.titulo_vaga_alvo || 'Perfil Geral'}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="botao-secundario"
                onClick={handleBaixarTexto}
                style={{ fontSize: '12.5px', padding: '8px 14px' }}
              >
                <Download size={14} />
                <span>Baixar .md</span>
              </button>
              <button
                className="botao-primario"
                onClick={() => copiar(curriculoAdaptado.curriculo_formatado_markdown)}
                style={{
                  fontSize: '12.5px',
                  padding: '8px 16px',
                  backgroundColor: copiado ? 'var(--success)' : 'var(--accent)',
                }}
              >
                {copiado ? (
                  <>
                    <Check size={14} />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copiar Texto Completo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Alerta de Requisito Eliminatório / Dealbreaker */}
          {curriculoAdaptado.alerta_eliminatorio?.inelegivel && (
            <div
              style={{
                backgroundColor: 'var(--danger-subtle)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '18px 22px',
                marginBottom: '20px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}
            >
              <AlertTriangle size={22} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--danger)', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                  ⚠️ POSSÍVEL INELEGIBILIDADE DETECTADA
                </strong>
                <p style={{ color: 'var(--text-primary)', fontSize: '13.5px', margin: 0, lineHeight: '1.5' }}>
                  {curriculoAdaptado.alerta_eliminatorio.motivo}
                </p>
              </div>
            </div>
          )}

          {/* Gauge de Score de Compatibilidade (Modo 2) */}
          {curriculoAdaptado.score_compatibilidade !== undefined && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px 24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 800,
                    backgroundColor:
                      curriculoAdaptado.score_compatibilidade >= 80
                        ? 'var(--success-subtle)'
                        : curriculoAdaptado.score_compatibilidade >= 60
                        ? 'var(--warning-subtle)'
                        : 'var(--danger-subtle)',
                    color:
                      curriculoAdaptado.score_compatibilidade >= 80
                        ? 'var(--success)'
                        : curriculoAdaptado.score_compatibilidade >= 60
                        ? 'var(--warning)'
                        : 'var(--danger)',
                    border: `2px solid ${
                      curriculoAdaptado.score_compatibilidade >= 80
                        ? 'var(--success)'
                        : curriculoAdaptado.score_compatibilidade >= 60
                        ? 'var(--warning)'
                        : 'var(--danger)'
                    }`,
                  }}
                  className="tabular-nums"
                >
                  {curriculoAdaptado.score_compatibilidade}%
                </div>
                <div>
                  <span className="rotulo">Score de Aderência com a Vaga</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                    {curriculoAdaptado.score_compatibilidade >= 80
                      ? 'Alta Compatibilidade Técnica'
                      : curriculoAdaptado.score_compatibilidade >= 60
                      ? 'Compatibilidade Parcial / Requisitos em Desenvolvimento'
                      : 'Baixa Compatibilidade ou Gaps Críticos'}
                  </h3>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={16} color="var(--accent)" />
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Alinhado contra {curriculoAdaptado.analise_match?.requisitos_obrigatorios?.length || 0} requisitos avaliados
                </span>
              </div>
            </div>
          )}

          {/* Matriz de Match & Gaps (Zero-Hallucination) */}
          {curriculoAdaptado.analise_match && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Target size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Matriz de Compatibilidade & GAPs
                </h3>
              </div>

              {/* GAPs Identificados com destaque de Anti-Alucinação */}
              {curriculoAdaptado.analise_match.gaps?.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 18px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <ShieldCheck size={16} color="var(--danger)" />
                    <strong style={{ fontSize: '13px', color: 'var(--danger)' }}>
                      GAPs Identificados na Vaga
                    </strong>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.4' }}>
                    O Vektor não alucina nem inventa tecnologias. As seguintes competências foram pedidas pela vaga, mas mantidas <strong>fora do seu currículo</strong> por segurança e veracidade:
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {curriculoAdaptado.analise_match.gaps.map((gap, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--danger)',
                          backgroundColor: 'var(--danger-subtle)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--danger-border)',
                        }}
                      >
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid de Requisitos Obrigatórios e Desejáveis */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {curriculoAdaptado.analise_match.requisitos_obrigatorios?.length > 0 && (
                  <div>
                    <span className="rotulo" style={{ marginBottom: '8px', display: 'block' }}>
                      Requisitos Obrigatórios
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {curriculoAdaptado.analise_match.requisitos_obrigatorios.map((req, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '12.5px',
                          }}
                        >
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{req.requisito}</span>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor:
                                req.status === 'MATCH'
                                  ? 'var(--success-subtle)'
                                  : req.status === 'PARTIAL'
                                  ? 'var(--warning-subtle)'
                                  : 'var(--danger-subtle)',
                              color:
                                req.status === 'MATCH'
                                  ? 'var(--success)'
                                  : req.status === 'PARTIAL'
                                  ? 'var(--warning)'
                                  : 'var(--danger)',
                            }}
                          >
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {curriculoAdaptado.analise_match.requisitos_desejaveis?.length > 0 && (
                  <div>
                    <span className="rotulo" style={{ marginBottom: '8px', display: 'block' }}>
                      Diferenciais & Desejáveis
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {curriculoAdaptado.analise_match.requisitos_desejaveis.map((req, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '12.5px',
                          }}
                        >
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{req.requisito}</span>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: req.status === 'MATCH' ? 'var(--success-subtle)' : 'var(--bg-app)',
                              color: req.status === 'MATCH' ? 'var(--success)' : 'var(--text-muted)',
                            }}
                          >
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cards de Seções Estratégicas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Resumo Profissional Alinhado */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '22px',
              }}
            >
              <span className="rotulo" style={{ marginBottom: '8px' }}>Resumo Factual de Alto Impacto</span>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', marginTop: '8px' }}>
                {curriculoAdaptado.resumo_otimizado}
              </p>
            </div>

            {/* Palavras-chave ATS & Skills */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '22px',
              }}
            >
              <span className="rotulo" style={{ marginBottom: '8px' }}>Skills & Termos Prioritários Reais</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {curriculoAdaptado.skills_priorizadas?.map((s, idx) => (
                  <SkillBadge key={idx} skill={s} />
                ))}
              </div>
              {curriculoAdaptado.dicas_palavras_chave_ats?.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Orientações para ATS & Entrevista:
                  </span>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {curriculoAdaptado.dicas_palavras_chave_ats.join(' • ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bullets de Projetos Adaptados */}
          {curriculoAdaptado.bullets_projetos_otimizados?.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <span className="rotulo" style={{ marginBottom: '12px' }}>
                Projetos & Experiências Reformulados com Métricas Reais
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                {curriculoAdaptado.bullets_projetos_otimizados.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <strong style={{ fontSize: '13.5px', color: 'var(--accent)', display: 'block', marginBottom: '4px' }}>
                      {item.foco}
                    </strong>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.5' }}>
                      {item.bullet_reescrito}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visualização Completa em Markdown */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="rotulo">Visualização do Currículo Completo</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Formato Markdown Profissional</span>
            </div>
            <pre
              style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              {curriculoAdaptado.curriculo_formatado_markdown}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default TelaAdaptarCurriculo

