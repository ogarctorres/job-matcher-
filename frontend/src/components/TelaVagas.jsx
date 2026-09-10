import { useState } from 'react'
import CardVaga from './CardVaga'
import { useApp } from '../contexts/AppContext'

function TelaVagas() {
  const { resultado, setTelaAtiva } = useApp()
  const [filtroTexto, setFiltroTexto] = useState('')
  const [scoreMinimo, setScoreMinimo] = useState(0)

  if (!resultado) {
    return (
      <div className="tela">
        <div className="estado-vazio">
          <p className="estado-vazio-icone">Aguardando</p>
          <h2>Nenhuma busca feita ainda</h2>
          <p>Envie um currículo para ver as vagas compatíveis aqui.</p>
          <button className="botao-secundario" onClick={() => setTelaAtiva('upload')}>
            Ir para upload
          </button>
        </div>
      </div>
    )
  }

  const vagasFiltradas = resultado.vagas_encontradas.filter((vaga) => {
    const combinaTexto =
      vaga.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      vaga.empresa.toLowerCase().includes(filtroTexto.toLowerCase())
    const combinaScore = (vaga.score || 0) >= scoreMinimo
    return combinaTexto && combinaScore
  })

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <p className="rotulo">Resultado</p>
        <h1>Vagas Encontradas</h1>
      </header>

      <div className="resumo-perfil">
        <p className="rotulo-pequeno">Perfil identificado por IA</p>
        <p>{resultado.dados_curriculo.resumo}</p>
      </div>

      {/* Barra de Filtros */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Filtrar por cargo ou empresa..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid var(--linha)',
            backgroundColor: 'var(--papel)',
            color: 'var(--tinta)',
            flex: 1,
            minWidth: '220px',
            fontFamily: 'var(--fonte-corpo)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="rotulo-pequeno" style={{ margin: 0 }}>Score mín: {scoreMinimo}%</span>
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={scoreMinimo}
            onChange={(e) => setScoreMinimo(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="lista-vagas">
        {vagasFiltradas.length === 0 && (
          <p className="vazio">
            Nenhuma vaga encontrada com os filtros selecionados. Tente ajustar o texto ou diminuir o score mínimo.
          </p>
        )}

        {vagasFiltradas.map((vaga) => (
          <CardVaga key={vaga.link || vaga.titulo} vaga={vaga} dadosCurriculo={resultado.dados_curriculo} />
        ))}
      </div>
    </div>
  )
}

export default TelaVagas