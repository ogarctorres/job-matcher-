import { useState, useEffect } from 'react'
import {
  Code2,
  Sparkles,
  Terminal,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  BookOpen,
  Briefcase,
  Copy,
  Check,
} from 'lucide-react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'
import { useCopiaClipboard } from '../hooks/useCopiaClipboard'

function TelaDesafios() {
  const { vagaParaAdaptar, vagaParaDesafio, setVagaParaDesafio } = useApp()
  const vagaFoco = vagaParaDesafio || vagaParaAdaptar
  const [trilhaAtiva, setTrilhaAtiva] = useState('python')
  const [trilhasDados, setTrilhasDados] = useState(null)
  const [desafiosLista, setDesafiosLista] = useState([])
  const [desafioAtivo, setDesafioAtivo] = useState(null)
  const [codigoUsuario, setCodigoUsuario] = useState('')
  const [dicaAberta, setDicaAberta] = useState(false)
  const [solucaoAberta, setSolucaoAberta] = useState(false)
  const [desafioConcluido, setDesafioConcluido] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [copiado, copiar] = useCopiaClipboard()

  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      try {
        const res = await api.obterTrilhasDesafios()
        if (!ativo) return
        setTrilhasDados(res)
        const lista = res.desafios_por_trilha?.python || []
        setDesafiosLista(lista)
        if (lista.length > 0) {
          setDesafioAtivo(lista[0])
          setCodigoUsuario(lista[0].codigo_inicial || '')
        }
      } catch (e) {
        console.error('Erro ao carregar desafios:', e)
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [])

  function mudarTrilha(novaTrilha) {
    setTrilhaAtiva(novaTrilha)
    if (trilhasDados?.desafios_por_trilha?.[novaTrilha]) {
      const lista = trilhasDados.desafios_por_trilha[novaTrilha]
      setDesafiosLista(lista)
      if (lista.length > 0) {
        selecionarDesafio(lista[0])
      }
    }
  }

  function selecionarDesafio(desafio) {
    setDesafioAtivo(desafio)
    setCodigoUsuario(desafio.codigo_inicial || '')
    setDicaAberta(false)
    setSolucaoAberta(false)
    setDesafioConcluido(false)
  }

  async function carregarDesafiosDaVaga() {
    if (!vagaFoco) return
    setCarregando(true)
    try {
      const res = await api.gerarDesafiosVaga({
        tituloVaga: vagaFoco.titulo,
        descricaoVaga: vagaFoco.descricao,
      })
      if (res.desafios && res.desafios.length > 0) {
        setDesafiosLista(res.desafios)
        selecionarDesafio(res.desafios[0])
      }
    } catch (e) {
      console.error('Erro ao gerar desafios da vaga:', e)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Code2 size={18} color="var(--accent)" />
          <span className="rotulo" style={{ margin: 0 }}>Preparação Prática</span>
          <span className="header-badge" style={{ fontSize: '10.5px' }}>LeetCode Universitário</span>
        </div>
        <h1>Treino Técnico & Desafios de Código</h1>
        <p className="tela-descricao">
          Exercícios práticos de código, lógica e SQL selecionados para os testes técnicos mais comuns em estágios e vagas de início de carreira.
        </p>
      </header>

      {/* Banner de contextualização com vaga em foco (se houver) */}
      {vagaFoco && (
        <div
          style={{
            backgroundColor: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Briefcase size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
                Vaga Alvo: {vagaFoco.titulo} ({vagaFoco.empresa || 'Empresa em Destaque'})
              </strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Gere desafios práticos sob medida para a stack solicitada por este recrutador.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="botao-primario"
              onClick={carregarDesafiosDaVaga}
              disabled={carregando}
              style={{ fontSize: '12.5px', padding: '7px 14px' }}
            >
              <Sparkles size={14} />
              <span>{carregando ? 'Gerando desafios...' : 'Gerar Desafios desta Vaga'}</span>
            </button>
            {vagaParaDesafio && (
              <button
                type="button"
                className="botao-secundario"
                onClick={() => {
                  setVagaParaDesafio(null)
                  mudarTrilha('python')
                }}
                style={{ fontSize: '12px', padding: '7px 12px' }}
                title="Voltar para as trilhas temáticas padrão"
              >
                Trilhas Gerais
              </button>
            )}
          </div>
        </div>
      )}

      {/* Seletor de Trilhas Temáticas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`botao-secundario ${trilhaAtiva === 'python' ? 'item-destaque' : ''}`}
          onClick={() => mudarTrilha('python')}
          style={{
            borderColor: trilhaAtiva === 'python' ? 'var(--accent)' : 'var(--border-card)',
            backgroundColor: trilhaAtiva === 'python' ? 'var(--accent-subtle)' : 'var(--bg-card)',
            color: trilhaAtiva === 'python' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: trilhaAtiva === 'python' ? 600 : 400,
          }}
        >
          <span>🐍 Python Backend</span>
        </button>

        <button
          type="button"
          className={`botao-secundario ${trilhaAtiva === 'sql' ? 'item-destaque' : ''}`}
          onClick={() => mudarTrilha('sql')}
          style={{
            borderColor: trilhaAtiva === 'sql' ? 'var(--accent)' : 'var(--border-card)',
            backgroundColor: trilhaAtiva === 'sql' ? 'var(--accent-subtle)' : 'var(--bg-card)',
            color: trilhaAtiva === 'sql' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: trilhaAtiva === 'sql' ? 600 : 400,
          }}
        >
          <span>🗄️ SQL & Consultas</span>
        </button>

        <button
          type="button"
          className={`botao-secundario ${trilhaAtiva === 'redes' ? 'item-destaque' : ''}`}
          onClick={() => mudarTrilha('redes')}
          style={{
            borderColor: trilhaAtiva === 'redes' ? 'var(--accent)' : 'var(--border-card)',
            backgroundColor: trilhaAtiva === 'redes' ? 'var(--accent-subtle)' : 'var(--bg-card)',
            color: trilhaAtiva === 'redes' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: trilhaAtiva === 'redes' ? 600 : 400,
          }}
        >
          <span>🌐 Redes & Infra</span>
        </button>
      </div>

      {/* Grid Principal: Lista lateral de questões + Painel de Resolução */}
      <div className="layout-desafios-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Coluna 1: Lista de Desafios da Trilha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Desafios Disponíveis ({desafiosLista.length})
          </span>

          {desafiosLista.map((d) => {
            const selecionado = desafioAtivo?.id === d.id
            return (
              <div
                key={d.id}
                onClick={() => selecionarDesafio(d)}
                style={{
                  padding: '14px 16px',
                  backgroundColor: selecionado ? 'var(--bg-surface)' : 'var(--bg-card)',
                  border: `1px solid ${selecionado ? 'var(--accent)' : 'var(--border-card)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                    {d.categoria}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: d.dificuldade === 'Iniciante' ? 'var(--success-subtle)' : 'var(--warning-subtle)',
                      color: d.dificuldade === 'Iniciante' ? 'var(--success)' : 'var(--warning)',
                      fontWeight: 600,
                    }}
                  >
                    {d.dificuldade}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                  {d.titulo}
                </h4>
              </div>
            )
          })}
        </div>

        {/* Coluna 2: Editor e Resolução do Desafio Ativo */}
        {desafioAtivo && (
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
            {/* Header do Exercício */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Terminal size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '17px', color: 'var(--text-primary)', margin: 0 }}>
                  {desafioAtivo.titulo}
                </h3>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                {desafioAtivo.enunciado}
              </p>
            </div>

            {/* Casos de Teste / Exemplo */}
            {desafioAtivo.casos_teste && desafioAtivo.casos_teste.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Exemplo de Entrada:</div>
                <div style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{desafioAtivo.casos_teste[0].entrada}</div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Saída Esperada:</div>
                <div style={{ color: 'var(--success)' }}>{desafioAtivo.casos_teste[0].saida_esperada}</div>
              </div>
            )}

            {/* Editor de Código Minimalista */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Seu Código ({trilhaAtiva === 'sql' ? 'SQL' : 'Python'}):
                </span>
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={() => setCodigoUsuario(desafioAtivo.codigo_inicial || '')}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  <RotateCcw size={12} />
                  <span>Resetar</span>
                </button>
              </div>

              <textarea
                value={codigoUsuario}
                onChange={(e) => setCodigoUsuario(e.target.value)}
                rows={8}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  backgroundColor: 'var(--bg-app)',
                  color: '#e2e8f0',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Ações: Dicas Pedagógicas & Solução */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="botao-secundario"
                onClick={() => setDicaAberta(!dicaAberta)}
                style={{ fontSize: '12.5px', padding: '8px 14px' }}
              >
                <Lightbulb size={15} color="var(--warning)" />
                <span>{dicaAberta ? 'Ocultar Dica' : 'Ver Dica Pedagógica'}</span>
              </button>

              <button
                type="button"
                className="botao-secundario"
                onClick={() => setSolucaoAberta(!solucaoAberta)}
                style={{ fontSize: '12.5px', padding: '8px 14px' }}
              >
                <BookOpen size={15} color="var(--accent)" />
                <span>{solucaoAberta ? 'Ocultar Solução' : 'Solução de Referência'}</span>
              </button>

              <button
                type="button"
                className="botao-primario"
                onClick={() => setDesafioConcluido(true)}
                style={{ fontSize: '12.5px', padding: '8px 16px', marginLeft: 'auto' }}
              >
                <CheckCircle2 size={15} />
                <span>Concluir Desafio</span>
              </button>
            </div>

            {/* Bloco de Dica Pedagógica */}
            {dicaAberta && desafioAtivo.dicas && (
              <div
                style={{
                  backgroundColor: 'var(--warning-subtle)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                }}
              >
                <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '6px' }}>
                  💡 Dica do Mentor:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)' }}>
                  {desafioAtivo.dicas.map((d, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bloco de Solução de Referência */}
            {solucaoAberta && desafioAtivo.solucao_referencia && (
              <div
                style={{
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>
                    Solução Recomendada por Engenheiro Sênior:
                  </span>
                  <button
                    type="button"
                    className="botao-secundario"
                    onClick={() => copiar(desafioAtivo.solucao_referencia)}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    {copiado ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--text-primary)', overflowX: 'auto' }}>
                  {desafioAtivo.solucao_referencia}
                </pre>
              </div>
            )}

            {/* Alerta de Conclusão */}
            {desafioConcluido && (
              <div
                style={{
                  backgroundColor: 'var(--success-subtle)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--success)',
                  fontSize: '13px',
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>Excelente! Você exercitou a lógica essencial cobrada nas entrevistas para esta tecnologia.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TelaDesafios
