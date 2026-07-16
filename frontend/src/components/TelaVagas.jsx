import CardVaga from './CardVaga'

function TelaVagas({ resultado, mudarTela }) {
  if (!resultado) {
    return (
      <div className="tela">
        <div className="estado-vazio">
          <p className="estado-vazio-icone">💼</p>
          <h2>Nenhuma busca feita ainda</h2>
          <p>Envie um currículo para ver as vagas compatíveis aqui.</p>
          <button className="botao-secundario" onClick={() => mudarTela('upload')}>Ir para upload</button>
        </div>
      </div>
    )
  }
  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <p className="rotulo">Resultado</p>
        <h1>Vagas encontradas</h1>
      </header>
      <div className="resumo-perfil">
        <p className="rotulo-pequeno">Perfil identificado</p>
        <p>{resultado.dados_curriculo.resumo}</p>
      </div>
      <div className="lista-vagas">
        {resultado.vagas_encontradas.length === 0 && (
          <p className="vazio">Nenhum sinal captado dessa vez. Volte para "Novo currículo" e tente buscar novamente.</p>
        )}
        {resultado.vagas_encontradas.map((vaga) => <CardVaga key={vaga.link} vaga={vaga} />)}
      </div>
    </div>
  )
}
export default TelaVagas