import { useState } from 'react'
import CardVaga from './components/CardVaga'
import './App.css'

function App() {
  const [arquivo, setArquivo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState(null)

  function handleMudancaArquivo(evento) {
    setArquivo(evento.target.files[0])
  }

  async function enviarCurriculo() {
    setCarregando(true)

    const formData = new FormData()
    formData.append('arquivo', arquivo)

    const resposta = await fetch('http://127.0.0.1:8000/curriculo', {
      method: 'POST',
      body: formData,
    })

    const dados = await resposta.json()

    setResultado(dados)
    setCarregando(false)
  }

  return (
    <div className="pagina">
      <header className="cabecalho">
        <p className="rotulo">Job Matcher</p>
        <h1>Sintonize seu curriculo com as vagas certas</h1>
        <p>
          Envie seu curriculo em PDF. A IA le seu perfil, busca vagas reais de
          estagio em TI e mostra o quanto cada uma combina com voce.
        </p>
      </header>

      <div className="zona-upload">
        <div className="campo-arquivo">
          <input type="file" accept=".pdf" onChange={handleMudancaArquivo} />
        </div>

        {arquivo && (
          <p className="arquivo-selecionado">Selecionado: {arquivo.name}</p>
        )}

        <button
          className="botao-buscar"
          onClick={enviarCurriculo}
          disabled={!arquivo || carregando}
        >
          {carregando ? 'Sintonizando...' : 'Buscar vagas compativeis'}
        </button>
      </div>

      {resultado && (
        <div className="resultado">
          <div className="resumo-perfil">
            <p className="rotulo">Perfil identificado</p>
            <p>{resultado.dados_curriculo.resumo}</p>
          </div>

          <div className="lista-vagas">
            <h2>Vagas encontradas</h2>

            {resultado.vagas_encontradas.length === 0 && (
              <p className="vazio">
                Nenhum sinal captado dessa vez. Tenta buscar de novo.
              </p>
            )}

            {resultado.vagas_encontradas.map((vaga) => (
              <CardVaga key={vaga.link} vaga={vaga} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App