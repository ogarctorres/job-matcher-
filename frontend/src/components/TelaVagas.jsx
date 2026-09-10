import { useState } from 'react'
import { Search, SlidersHorizontal, Briefcase, Sparkles } from 'lucide-react'
import CardVaga from './CardVaga'
import { useApp } from '../contexts/AppContext'
import { useDebounce } from '../hooks/useDebounce'

function TelaVagas() {
  const { resultado, setTelaAtiva } = useApp()
  const [busca, setBusca] = useState('')
  const [scoreMinimo, setScoreMinimo] = useState(0)
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

  const todasVagas = resultado.vagas_encontradas || []
  const vagasFiltradas = todasVagas.filter((vaga) => {
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
          Vagas reais de estágio e início de carreira mapeadas no mercado brasileiro via Jooble API com pontuação de aderência.
        </p>
      </header>

      {/* Resumo do Perfil */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Sparkles size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
          {resultado.dados_curriculo?.resumo || 'Perfil técnico analisado com base nas competências identificadas.'}
        </p>
      </div>

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
            <p>Tente diminuir a régua de aderência mínima ou buscar por outros termos.</p>
            <button className="botao-secundario" onClick={() => { setBusca(''); setScoreMinimo(0); }}>
              Limpar Filtros
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