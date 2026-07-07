function CardVaga({ vaga }) {
  return (
    <div>
      <h3>{vaga.titulo}</h3>
      <p>{vaga.empresa}</p>
      <p>Score: {vaga.score}/100</p>
      <p>{vaga.explicacao_score}</p>
      <a href={vaga.link} target="_blank" rel="noreferrer">
        Ver vaga
      </a>
    </div>
  )
}

export default CardVaga