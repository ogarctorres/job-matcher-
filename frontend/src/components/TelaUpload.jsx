import { useState } from 'react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'

function TelaUpload() {
  const { setResultado, setTelaAtiva, carregando, setCarregando, erro, setErro } = useApp()
  const [arquivo, setArquivo] = useState(null)
  const [etapaStatus, setEtapaStatus] = useState('')

  function handleMudancaArquivo(evento) {
    setArquivo(evento.target.files[0])
    setErro(null)
  }

  async function enviarCurriculo() {
    if (!arquivo) return
    setCarregando(true)
    setErro(null)
    setEtapaStatus('Lendo PDF e conectando ao Gemini 3.6 Flash...')

    try {
      setEtapaStatus('Analisando perfil e avaliando competências...')
      const dados = await api.enviarCurriculo(arquivo)
      setResultado(dados)
      setTelaAtiva('avaliacao')
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setCarregando(false)
      setEtapaStatus('')
    }
  }

  return (
    <div className="tela">
      <header className="tela-cabecalho">
        <p className="rotulo">Novo currículo</p>
        <h1>Sintonize seu currículo com as vagas certas</h1>
        <p className="tela-descricao">
          Envie seu currículo em PDF. A IA avalia seu perfil, aponta melhorias e busca vagas reais de estágio em TI no Brasil compatíveis com você.
        </p>
      </header>

      <div className="zona-upload">
        <div className="campo-arquivo">
          <input type="file" accept=".pdf" onChange={handleMudancaArquivo} disabled={carregando} />
        </div>

        {arquivo && <p className="arquivo-selecionado">Selecionado: {arquivo.name}</p>}

        {carregando && (
          <div style={{ padding: '10px 0', color: 'var(--latao)', fontFamily: 'var(--fonte-dado)', fontSize: '13px' }}>
            ⏳ {etapaStatus}
          </div>
        )}

        {erro && <p className="mensagem-erro">{erro}</p>}

        <button
          className="botao-buscar"
          onClick={enviarCurriculo}
          disabled={!arquivo || carregando}
        >
          {carregando ? 'Processando com IA...' : 'Analisar currículo'}
        </button>
      </div>
    </div>
  )
}

export default TelaUpload