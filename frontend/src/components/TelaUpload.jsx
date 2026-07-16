function TelaUpload({ arquivo, carregando, handleMudancaArquivo, enviarCurriculo }) {
  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <p className="rotulo">Novo currículo</p>
        <h1>Sintonize seu currículo com as vagas certas</h1>
        <p className="tela-descricao">Envie seu currículo em PDF. A IA lê seu perfil, busca vagas reais de estágio em TI e mostra o quanto cada uma combina com você.</p>
      </header>
      <div className="zona-upload">
        <div className="campo-arquivo">
          <input type="file" accept=".pdf" onChange={handleMudancaArquivo} />
        </div>
        {arquivo && <p className="arquivo-selecionado">Selecionado: {arquivo.name}</p>}
        <button className="botao-buscar" onClick={enviarCurriculo} disabled={!arquivo || carregando}>
          {carregando ? 'Sintonizando...' : 'Buscar vagas compatíveis'}
        </button>
        {erro && <p className="mensagem-erro">{erro}</p>}
      </div>
    </div>
  )
}
export default TelaUpload