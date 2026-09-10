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

  async function handleAdaptar(e) {
    e?.preventDefault()
    if (!descricaoVaga.trim()) {
      setErro('Por favor, cole a descrição e requisitos da vaga desejada.')
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
        descricaoVaga: descricaoVaga,
        tituloVaga: tituloVaga || 'Vaga de Tecnologia',
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
    link.download = `curriculo_otimizado_${tituloVaga ? tituloVaga.toLowerCase().replace(/\s+/g, '_') : 'vaga'}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <span className="rotulo">ATS Tailoring & Reescrita</span>
        <h1>Otimizador de Currículo para Vagas Específicas</h1>
        <p className="tela-descricao">
          Cole a descrição de qualquer vaga (LinkedIn, Gupy ou das recomendações). A IA realinha suas experiências e vocabulário técnico com as palavras-chave exatas que recrutadores e robôs ATS procuram.
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
        <form onSubmit={handleAdaptar} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Título do Cargo ou Vaga
            </label>
            <input
              type="text"
              className="campo-busca-input"
              placeholder="Ex: Estágio em Engenharia de Dados, Desenvolvedor Python Júnior..."
              value={tituloVaga}
              onChange={(e) => setTituloVaga(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Descrição e Requisitos da Vaga (Cole aqui o texto da publicação)
            </label>
            <textarea
              className="campo-busca-input"
              rows={6}
              placeholder="Cole aqui os requisitos, responsabilidades e tecnologias mencionadas no anúncio da vaga..."
              value={descricaoVaga}
              onChange={(e) => setDescricaoVaga(e.target.value)}
              style={{ width: '100%', resize: 'vertical', lineHeight: '1.5' }}
            />
          </div>

          {erro && <div className="mensagem-erro">{erro}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
                  <Loader2 size={16} className="animar-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Reescrevendo e Alinhando com Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  <span>Otimizar Currículo para esta Vaga</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Resultados da Otimização */}
      {curriculoAdaptado && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Currículo Adaptado com Sucesso
            </h2>
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
              <span className="rotulo" style={{ marginBottom: '8px' }}>Resumo de Alto Impacto</span>
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
              <span className="rotulo" style={{ marginBottom: '8px' }}>Skills & Termos Prioritários</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {curriculoAdaptado.skills_priorizadas?.map((s, idx) => (
                  <SkillBadge key={idx} skill={s} />
                ))}
              </div>
              {curriculoAdaptado.dicas_palavras_chave_ats?.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Atenção aos filtros ATS da vaga:
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
                Projetos & Experiências Reformulados com Foco na Vaga
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
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Formato Markdown</span>
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
