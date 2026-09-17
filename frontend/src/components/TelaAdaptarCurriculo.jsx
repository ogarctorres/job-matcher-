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
  RotateCcw,
  Columns,
  FileCode,
  Calculator,
  ArrowRight,
} from 'lucide-react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'
import { useCopiaClipboard } from '../hooks/useCopiaClipboard'
import { useLocalStorage } from '../hooks/useLocalStorage'
import SkillBadge from './SkillBadge'

function TelaAdaptarCurriculo() {
  const { resultado, vagaParaAdaptar, setVagaParaAdaptar, setTelaAtiva } = useApp()
  const [tituloVaga, setTituloVaga] = useState('')
  const [descricaoVaga, setDescricaoVaga] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [curriculoAdaptado, setCurriculoAdaptado] = useLocalStorage('vektor_curriculo_adaptado', null)
  const [modoVisualizacao, setModoVisualizacao] = useState('comparador')
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
        analiseId: resultado?.id,
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
            {descricaoVaga.trim().length > 0 && descricaoVaga.trim().length < 150 && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warning-subtle)',
                  border: '1px solid var(--warning-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <AlertCircle size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  <strong>Aviso de Precisão:</strong> A descrição informada contém apenas <strong>{descricaoVaga.trim().length} caracteres</strong> (snippet curto). Para que a análise de requisitos mandatórios e palavras-chave ATS atinja precisão máxima, sugerimos colar o anúncio completo da vaga.
                </span>
              </div>
            )}
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
                onClick={() => {
                  setCurriculoAdaptado(null)
                  setTituloVaga('')
                  setDescricaoVaga('')
                }}
                style={{ fontSize: '12.5px', padding: '8px 14px' }}
                title="Limpar e criar nova adaptação"
              >
                <RotateCcw size={14} />
                <span>Nova Adaptação</span>
              </button>
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

          {/* Painel da Memória de Cálculo Auditável (Etapa 6/9) */}
          {curriculoAdaptado.memoria_calculo && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={18} color="var(--accent)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Memória de Cálculo Auditável do Score
                  </h3>
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Fórmula: Obrigatórios (60) + Desejáveis (25) + Formação (15)
                </span>
              </div>

              {/* Teto Dealbreaker se aplicado */}
              {curriculoAdaptado.memoria_calculo.teto_dealbreaker_aplicado && (
                <div
                  style={{
                    backgroundColor: 'var(--danger-subtle)',
                    border: '1px solid var(--danger-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <AlertTriangle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--danger)', lineHeight: '1.4' }}>
                    <strong>Teto Limitador Aplicado:</strong> Score bruto ({curriculoAdaptado.memoria_calculo.score_bruto}%) foi limitado ao teto estrito de {curriculoAdaptado.memoria_calculo.score_final}% devido a: {curriculoAdaptado.memoria_calculo.motivo_teto}
                  </span>
                </div>
              )}

              {/* Grid dos 3 Pilares Matemáticos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {/* 1. Requisitos Obrigatórios */}
                {curriculoAdaptado.memoria_calculo.obrigatorios && (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Requisitos Mandatórios
                      </span>
                      <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                        {curriculoAdaptado.memoria_calculo.obrigatorios.pontos_obtidos} / {curriculoAdaptado.memoria_calculo.obrigatorios.pontos_maximos} pts
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div
                        style={{
                          width: `${(curriculoAdaptado.memoria_calculo.obrigatorios.pontos_obtidos / curriculoAdaptado.memoria_calculo.obrigatorios.pontos_maximos) * 100}%`,
                          height: '100%',
                          backgroundColor: 'var(--accent)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', lineHeight: '1.4' }}>
                      {curriculoAdaptado.memoria_calculo.obrigatorios.matches} atendidos, {curriculoAdaptado.memoria_calculo.obrigatorios.parciais} parciais, {curriculoAdaptado.memoria_calculo.obrigatorios.gaps} gaps de {curriculoAdaptado.memoria_calculo.obrigatorios.total_requisitos} obrigatórios.
                    </span>
                  </div>
                )}

                {/* 2. Requisitos Desejáveis */}
                {curriculoAdaptado.memoria_calculo.desejaveis && (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Diferenciais & Desejáveis
                      </span>
                      <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                        {curriculoAdaptado.memoria_calculo.desejaveis.pontos_obtidos} / {curriculoAdaptado.memoria_calculo.desejaveis.pontos_maximos} pts
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div
                        style={{
                          width: `${(curriculoAdaptado.memoria_calculo.desejaveis.pontos_obtidos / (curriculoAdaptado.memoria_calculo.desejaveis.pontos_maximos || 1)) * 100}%`,
                          height: '100%',
                          backgroundColor: 'var(--success)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', lineHeight: '1.4' }}>
                      {curriculoAdaptado.memoria_calculo.desejaveis.matches} diferenciais atendidos de {curriculoAdaptado.memoria_calculo.desejaveis.total_requisitos} desejáveis.
                    </span>
                  </div>
                )}

                {/* 3. Formação & Contexto */}
                {curriculoAdaptado.memoria_calculo.formacao_contexto && (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Formação & Portfólio
                      </span>
                      <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>
                        {curriculoAdaptado.memoria_calculo.formacao_contexto.pontos_obtidos} / {curriculoAdaptado.memoria_calculo.formacao_contexto.pontos_maximos} pts
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div
                        style={{
                          width: `${(curriculoAdaptado.memoria_calculo.formacao_contexto.pontos_obtidos / curriculoAdaptado.memoria_calculo.formacao_contexto.pontos_maximos) * 100}%`,
                          height: '100%',
                          backgroundColor: 'var(--warning)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', lineHeight: '1.4' }}>
                      {curriculoAdaptado.memoria_calculo.formacao_contexto.justificativa}
                    </span>
                  </div>
                )}
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

          {/* Seletor de Modo de Visualização: Comparador vs Markdown */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setModoVisualizacao('comparador')}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: modoVisualizacao === 'comparador' ? 'var(--accent)' : 'var(--bg-card)',
                border: `1px solid ${modoVisualizacao === 'comparador' ? 'var(--accent)' : 'var(--border-card)'}`,
                color: modoVisualizacao === 'comparador' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'var(--transition)',
              }}
            >
              <Columns size={15} />
              <span>Comparador "Antes vs Depois"</span>
            </button>

            <button
              type="button"
              onClick={() => setModoVisualizacao('markdown')}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: modoVisualizacao === 'markdown' ? 'var(--accent)' : 'var(--bg-card)',
                border: `1px solid ${modoVisualizacao === 'markdown' ? 'var(--accent)' : 'var(--border-card)'}`,
                color: modoVisualizacao === 'markdown' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'var(--transition)',
              }}
            >
              <FileCode size={15} />
              <span>Currículo Formatado em Markdown</span>
            </button>
          </div>

          {/* Modo 1: Comparador Lado a Lado (Antes vs Depois) */}
          {modoVisualizacao === 'comparador' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Coluna da Esquerda: Antes (Perfil Original do PDF) */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      ANTES
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Perfil Base (PDF Original)
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dados enviados</span>
                </div>

                {/* Resumo Original */}
                <div>
                  <span className="rotulo" style={{ marginBottom: '6px' }}>Resumo Profissional Original</span>
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                      {resultado?.dados_curriculo?.resumo || resultado?.texto_curriculo?.slice(0, 350) || 'Resumo não estruturado no PDF original.'}
                    </p>
                  </div>
                </div>

                {/* Skills Originais */}
                <div>
                  <span className="rotulo" style={{ marginBottom: '6px' }}>Competências Identificadas no PDF</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {resultado?.dados_curriculo?.skills?.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11.5px',
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cargo Objetivo Original */}
                {resultado?.dados_curriculo?.cargo_objetivo && (
                  <div>
                    <span className="rotulo" style={{ marginBottom: '6px' }}>Cargo Objetivo Original</span>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                      {resultado.dados_curriculo.cargo_objetivo}
                    </p>
                  </div>
                )}
              </div>

              {/* Coluna da Direita: Depois (Versão Otimizada Vektor) */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
                      DEPOIS (VEKTOR)
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Alinhado para a Oportunidade
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>100% Factual</span>
                </div>

                {/* Resumo Otimizado */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="rotulo" style={{ color: 'var(--success)' }}>Resumo Factual de Alto Impacto</span>
                    <span style={{ fontSize: '10.5px', color: 'var(--success)', fontWeight: 600 }}>Palavras-chave da vaga</span>
                  </div>
                  <div style={{ padding: '14px', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)' }}>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                      {curriculoAdaptado.resumo_otimizado}
                    </p>
                  </div>
                </div>

                {/* Skills Priorizadas */}
                <div>
                  <span className="rotulo" style={{ marginBottom: '6px' }}>Skills Reais Priorizadas para a Vaga</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {curriculoAdaptado.skills_priorizadas?.map((s, idx) => (
                      <SkillBadge key={idx} skill={s} />
                    ))}
                  </div>
                </div>

                {/* Bullets de Projetos Reformulados */}
                {curriculoAdaptado.bullets_projetos_otimizados?.length > 0 && (
                  <div>
                    <span className="rotulo" style={{ marginBottom: '8px', display: 'block' }}>Projetos Reescritos com Métricas</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {curriculoAdaptado.bullets_projetos_otimizados.map((item, idx) => (
                        <div key={idx} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}>
                          <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '2px', fontSize: '12px' }}>{item.foco}</strong>
                          <span style={{ color: 'var(--text-primary)' }}>{item.bullet_reescrito}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dicas ATS & Entrevista */}
                {curriculoAdaptado.dicas_palavras_chave_ats?.length > 0 && (
                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Orientações para ATS & Entrevista:
                    </span>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                      {curriculoAdaptado.dicas_palavras_chave_ats.join(' • ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modo 2: Visualização Completa em Markdown */}
          {modoVisualizacao === 'markdown' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                marginBottom: '24px',
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
                  maxHeight: '460px',
                  overflowY: 'auto',
                }}
              >
                {curriculoAdaptado.curriculo_formatado_markdown}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TelaAdaptarCurriculo


