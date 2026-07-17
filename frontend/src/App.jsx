import { useState } from 'react'
import CardVaga from './components/CardVaga'
import './App.css'

function App() {
  const [telaAtiva, setTelaAtiva] = useState('upload')
  const [arquivo, setArquivo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)

  function handleMudancaArquivo(evento) {
    setArquivo(evento.target.files[0])
  }

  async function enviarCurriculo() {
  setCarregando(true)
  setErro(null)

  try {
    const formData = new FormData()
    formData.append('arquivo', arquivo)

    const resposta = await fetch('http://127.0.0.1:8000/curriculo', {
      method: 'POST',
      body: formData,
    })

    if (!resposta.ok) {
      const erroDados = await resposta.json()
      throw new Error(erroDados.detail || 'Algo deu errado. Tente novamente.')
    }

    const dados = await resposta.json()
    setResultado(dados)
    setTelaAtiva('avaliacao')
  } catch (falha) {
    setErro(falha.message)
  } finally {
    setCarregando(false)
  }
}

  const totalVagas = resultado ? resultado.vagas_encontradas.length : 0

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-topo">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icone">◈</span>
            <span className="sidebar-logo-texto">Job Matcher</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${telaAtiva === 'upload' ? 'ativo' : ''}`}
            onClick={() => setTelaAtiva('upload')}
          >
            <span className="sidebar-item-icone">01</span>
            Novo currículo
          </button>

          <button
            className={`sidebar-item ${telaAtiva === 'avaliacao' ? 'ativo' : ''}`}
            onClick={() => setTelaAtiva('avaliacao')}
          >
            <span className="sidebar-item-icone">02</span>
            Avaliação
            {resultado && <span className="sidebar-badge">{resultado.avaliacao.nota_geral}</span>}
          </button>

          <button
            className={`sidebar-item ${telaAtiva === 'vagas' ? 'ativo' : ''}`}
            onClick={() => setTelaAtiva('vagas')}
          >
            <span className="sidebar-item-icone">03</span>
            Vagas encontradas
            {totalVagas > 0 && <span className="sidebar-badge">{totalVagas}</span>}
          </button>
        </nav>

        <div className="sidebar-rodape">
          <p>Rodando com IA local via Ollama</p>
        </div>
      </aside>

      <main className="conteudo-principal">
        {telaAtiva === 'upload' && (
          <div className="tela">
            <header className="tela-cabecalho">
              <p className="rotulo">Novo currículo</p>
              <h1>Sintonize seu currículo com as vagas certas</h1>
              <p className="tela-descricao">
                Envie seu currículo em PDF. A IA avalia seu perfil, aponta
                melhorias e busca vagas reais de estágio em TI compatíveis
                com você.
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
                {carregando ? 'Sintonizando...' : 'Analisar currículo'}
              </button>
            </div>
          </div>
        )}

        {telaAtiva === 'avaliacao' && !resultado && (
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
        )}

        {telaAtiva === 'avaliacao' && resultado && (
          <div className="tela">
            <header className="tela-cabecalho">
              <p className="rotulo">Avaliação do currículo</p>
              <h1>Raio-X do seu perfil</h1>
            </header>

            <div className="dial dial-grande">
              <div className="dial-topo">
                <span className="dial-rotulo">Nota geral</span>
                <span className="dial-valor">{resultado.avaliacao.nota_geral}%</span>
              </div>
              <div className="dial-trilho">
                <div
                  className="dial-preenchido"
                  style={{ width: `${resultado.avaliacao.nota_geral}%` }}
                />
                <div
                  className="dial-agulha"
                  style={{ left: `${resultado.avaliacao.nota_geral}%` }}
                />
              </div>
              <div className="dial-escala">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <p className="comentario-geral">{resultado.avaliacao.comentario_geral}</p>

            <div className="colunas-avaliacao">
              <div className="coluna-avaliacao">
                <p className="rotulo-pequeno">Pontos fortes</p>
                <ul className="lista-avaliacao lista-forte">
                  {resultado.avaliacao.pontos_fortes.map((ponto, indice) => (
                    <li key={indice}>{ponto}</li>
                  ))}
                </ul>
              </div>

              <div className="coluna-avaliacao">
                <p className="rotulo-pequeno">Pontos de melhoria</p>
                <ul className="lista-avaliacao lista-melhoria">
                  {resultado.avaliacao.pontos_melhoria.map((ponto, indice) => (
                    <li key={indice}>{ponto}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {telaAtiva === 'vagas' && !resultado && (
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
        )}

        {telaAtiva === 'vagas' && resultado && (
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
                <p className="vazio">
                  Nenhum sinal captado dessa vez. Volte para "Novo currículo"
                  e tente buscar novamente.
                </p>
              )}

            {resultado.vagas_encontradas.map((vaga) => (
              <CardVaga key={vaga.link} vaga={vaga} dadosCurriculo={resultado.dados_curriculo} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App