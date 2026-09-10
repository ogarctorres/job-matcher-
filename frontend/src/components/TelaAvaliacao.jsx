import { useApp } from '../contexts/AppContext'

function TelaAvaliacao() {
  const { resultado, setTelaAtiva } = useApp()

  if (!resultado) {
    return (
      <div className="tela">
        <div className="estado-vazio">
          <p className="estado-vazio-icone">Aguardando</p>
          <h2>Nenhuma avaliação ainda</h2>
          <p>Envie um currículo para receber a avaliação da IA aqui.</p>
          <button className="botao-secundario" onClick={() => setTelaAtiva('upload')}>
            Ir para upload
          </button>
        </div>
      </div>
    )
  }

  const { avaliacao } = resultado

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <p className="rotulo">Avaliação do currículo</p>
        <h1>Raio-X do seu perfil</h1>
      </header>

      <div className="dial dial-grande">
        <div className="dial-topo">
          <span className="dial-rotulo">Nota geral calculada por IA</span>
          <span className="dial-valor">{avaliacao.nota_geral}%</span>
        </div>
        <div className="dial-trilho">
          <div
            className="dial-preenchido"
            style={{ width: `${avaliacao.nota_geral}%` }}
          />
          <div
            className="dial-agulha"
            style={{ left: `${avaliacao.nota_geral}%` }}
          />
        </div>
        <div className="dial-escala">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <p className="comentario-geral">{avaliacao.comentario_geral}</p>

      <div className="colunas-avaliacao">
        <div className="coluna-avaliacao">
          <p className="rotulo-pequeno">Pontos fortes</p>
          <ul className="lista-avaliacao lista-forte">
            {avaliacao.pontos_fortes.map((ponto, indice) => (
              <li key={indice}>{ponto}</li>
            ))}
          </ul>
        </div>

        <div className="coluna-avaliacao">
          <p className="rotulo-pequeno">Pontos de melhoria</p>
          <ul className="lista-avaliacao lista-melhoria">
            {avaliacao.pontos_melhoria.map((ponto, indice) => (
              <li key={indice}>{ponto}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '36px' }}>
        <button className="botao-buscar" onClick={() => setTelaAtiva('vagas')}>
          Ver vagas compatíveis ({resultado.vagas_encontradas.length}) →
        </button>
      </div>
    </div>
  )
}

export default TelaAvaliacao
