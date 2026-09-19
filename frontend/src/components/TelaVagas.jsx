import { useState } from 'react'
import { Search, SlidersHorizontal, Briefcase, Target, Compass, Loader2 } from 'lucide-react'
import CardVaga from './CardVaga'
import { useApp } from '../contexts/AppContext'
import { useDebounce } from '../hooks/useDebounce'
import { api } from '../services/api'

const CHIPS_CARREIRA = [
  { id: 'todos', label: 'Todas as Vagas', query: '' },
  { id: 'backend', label: '💻 Backend', query: 'estágio backend' },
  { id: 'frontend', label: '🎨 Frontend', query: 'estágio frontend' },
  { id: 'dados', label: '📊 Dados & BI', query: 'estágio dados' },
  { id: 'redes', label: '🌐 Redes & Infra', query: 'estágio redes' },
  { id: 'seguranca', label: '🛡️ Segurança', query: 'estágio segurança' },
  { id: 'mobile', label: '📱 Mobile', query: 'estágio mobile' },
  { id: 'qa', label: '🧪 QA & Testes', query: 'estágio testes' },
]

function TelaVagas() {
  const { resultado, setTelaAtiva } = useApp()
  const [busca, setBusca] = useState('')
  const [scoreMinimo, setScoreMinimo] = useState(0)
  const [chipAtivo, setChipAtivo] = useState('todos')
  const [vagasCustomizadas, setVagasCustomizadas] = useState(null)
  const [buscandoMercado, setBuscandoMercado] = useState(false)
  const [erroBusca, setErroBusca] = useState(null)
  const buscaDebounced = useDebounce(busca, 250)

  if (!resultado) {
    return (
      <div className="tela">
        <div className="estado-vazio">
          <div className="estado-vazio-icone-box">
            <Briefcase size={24} />
          </div>
          <h2>Nenhuma busca de vagas realizada</h2>
          <p>Envie seu currículo primeiro para que possamos encontrar vagas adequadas ao seu perfil.</p>
          <button className="botao-primario" onClick={() => setTelaAtiva('upload')}>
            Novo Currículo
          </button>
        </div>
      </div>
    )
  }

  async function handleSelecionarChip(chip) {
    setChipAtivo(chip.id)
    setErroBusca(null)

    if (chip.id === 'todos') {
      setVagasCustomizadas(null)
      return
    }

    setBuscandoMercado(true)
    try {
      const res = await api.buscarVagasMercado(
        chip.query,
        resultado.dados_curriculo?.cidade || 'Brasil',
        resultado.dados_curriculo
      )
      setVagasCustomizadas(res.vagas || [])
    } catch (err) {
      console.error('Erro ao buscar vagas do setor:', err)
      setErroBusca('Não foi possível carregar vagas deste setor agora. Exibindo vagas do currículo.')
      setVagasCustomizadas(null)
    } finally {
      setBuscandoMercado(false)
    }
  }

  const listaBase = vagasCustomizadas !== null ? vagasCustomizadas : (resultado.vagas_encontradas || [])
  const vagasFiltradas = listaBase.filter((vaga) => {
    const termo = buscaDebounced.toLowerCase().trim()
    const combinaTexto =
      !termo ||
      vaga.titulo?.toLowerCase().includes(termo) ||
      vaga.empresa?.toLowerCase().includes(termo) ||
      vaga.localizacao?.toLowerCase().includes(termo)

    const combinaScore = (vaga.score || 0) >= scoreMinimo
    return combinaTexto && combinaScore
  })

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <span className="rotulo">Oportunidades em Aberto</span>
        <h1>Vagas Recomendadas para o seu Perfil</h1>
        <p className="tela-descricao">
          Vagas de estágio e início de carreira mapeadas em tempo real com pontuação ATS de aderência ao seu currículo.
        </p>
      </header>

      {/* Resumo do Perfil */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Target size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
          {resultado.dados_curriculo?.resumo || 'Perfil técnico analisado com base nas competências identificadas.'}
        </p>
      </div>

      {/* Carrossel de Chips de Carreira / Áreas Tecnológicas */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Compass size={15} color="var(--accent)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Explorar por Área Tecnológica:
          </span>
          {buscandoMercado && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent)' }}>
              <Loader2 size={13} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} />
              <span>Minerando vagas & calculando aderência...</span>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '6px',
            scrollbarWidth: 'thin',
          }}
        >
          {CHIPS_CARREIRA.map((chip) => {
            const selecionado = chipAtivo === chip.id
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleSelecionarChip(chip)}
                disabled={buscandoMercado}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12.5px',
                  fontWeight: selecionado ? 600 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: `1px solid ${selecionado ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  backgroundColor: selecionado ? 'var(--accent-subtle)' : 'var(--bg-card)',
                  color: selecionado ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'var(--transition)',
                }}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      {erroBusca && (
        <div className="mensagem-erro" style={{ marginBottom: '16px' }}>
          {erroBusca}
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="barra-filtros">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="campo-busca-input"
            placeholder="Buscar por cargo, empresa ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <SlidersHorizontal size={14} />
            <span>Aderência Mínima:</span>
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{scoreMinimo}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={scoreMinimo}
            onChange={(e) => setScoreMinimo(Number(e.target.value))}
            style={{ width: '110px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Lista de Vagas */}
      <div className="lista-vagas">
        {vagasFiltradas.length === 0 ? (
          <div className="estado-vazio" style={{ padding: '40px 20px' }}>
            <h2>Nenhuma vaga encontrada com esses filtros</h2>
            <p>Tente diminuir a régua de aderência mínima ou selecionar outra área temática.</p>
            <button
              className="botao-secundario"
              onClick={() => {
                setBusca('')
                setScoreMinimo(0)
                setChipAtivo('todos')
                setVagasCustomizadas(null)
              }}
            >
              Resetar Filtros
            </button>
          </div>
        ) : (
          vagasFiltradas.map((vaga) => (
            <CardVaga
              key={vaga.link || vaga.titulo}
              vaga={vaga}
              dadosCurriculo={resultado.dados_curriculo}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default TelaVagas