import { useState } from 'react'

function CardVaga({ vaga, dadosCurriculo }) {
  const [sugestoes, setSugestoes] = useState(null)
  const [carregandoSugestao, setCarregandoSugestao] = useState(false)
  const [erroSugestao, setErroSugestao] = useState(null)

  async function buscarSugestoes() {
    setCarregandoSugestao(true)
    setErroSugestao(null)

    try {
      const resposta = await fetch('http://127.0.0.1:8000/sugestao-vaga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados_curriculo: dadosCurriculo, vaga }),
      })

      if (!resposta.ok) {
        const erroDados = await resposta.json()
        throw new Error(erroDados.detail || 'Não foi possível gerar sugestões.')
      }

      const dados = await resposta.json()
      setSugestoes(dados.sugestoes)
    } catch (falha) {
      setErroSugestao(falha.message)
    } finally {
      setCarregandoSugestao(false)
    }
  }

  return (
    <div className="card-vaga">
      <div className="dial">
        <div className="dial-topo">
          <span className="dial-rotulo">Sintonia</span>
          <span className="dial-valor">{vaga.score}%</span>
        </div>
        <div className="dial-trilho">
          <div className="dial-preenchido" style={{ width: `${vaga.score}%` }} />
          <div className="dial-agulha" style={{ left: `${vaga.score}%` }} />
        </div>
        <div className="dial-escala">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <h3>{vaga.titulo}</h3>
      <p className="empresa">{vaga.empresa}</p>
      <p className="explicacao">{vaga.explicacao_score}</p>

      {!sugestoes && (
        <button
          className="botao-sugestao"
          onClick={buscarSugestoes}
          disabled={carregandoSugestao}
        >
          {carregandoSugestao ? 'Analisando...' : 'Como melhorar meu currículo para essa vaga'}
        </button>
      )}

      {erroSugestao && <p className="mensagem-erro">{erroSugestao}</p>}

      {sugestoes && (
        <div className="painel-sugestoes">
          <p className="rotulo-pequeno">Sugestões para essa vaga</p>
          <ul className="lista-avaliacao lista-melhoria">
            {sugestoes.map((sugestao, indice) => (
              <li key={indice}>{sugestao}</li>
            ))}
          </ul>
        </div>
      )}

      <a className="link-vaga" href={vaga.link} target="_blank" rel="noreferrer">
        Ver vaga →
      </a>
    </div>
  )
}

export default CardVaga