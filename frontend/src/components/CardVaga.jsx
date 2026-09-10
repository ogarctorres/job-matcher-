import { useState } from 'react'
import { api } from '../services/api'
import ModalCarta from './ModalCarta'

function CardVaga({ vaga, dadosCurriculo }) {
  const [sugestoes, setSugestoes] = useState(null)
  const [carregandoSugestao, setCarregandoSugestao] = useState(false)
  const [erroSugestao, setErroSugestao] = useState(null)
  const [modalCartaAberto, setModalCartaAberto] = useState(false)

  async function buscarSugestoes() {
    setCarregandoSugestao(true)
    setErroSugestao(null)

    try {
      const dados = await api.gerarSugestao(dadosCurriculo, vaga)
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
      <p className="empresa">
        {vaga.empresa} {vaga.localizacao ? `• ${vaga.localizacao}` : ''}
      </p>
      <p className="explicacao">{vaga.explicacao_score}</p>

      <div className="acoes-card" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {!sugestoes && (
          <button
            className="botao-sugestao"
            onClick={buscarSugestoes}
            disabled={carregandoSugestao}
          >
            {carregandoSugestao ? 'Analisando...' : 'Dicas de melhoria'}
          </button>
        )}

        <button
          className="botao-sugestao"
          style={{ borderColor: 'var(--tinta-suave)', color: 'var(--tinta)' }}
          onClick={() => setModalCartaAberto(true)}
        >
          ✉️ Gerar Carta de Apresentação
        </button>
      </div>

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

      {vaga.link && (
        <a className="link-vaga" href={vaga.link} target="_blank" rel="noreferrer">
          Ver vaga oficial →
        </a>
      )}

      {modalCartaAberto && (
        <ModalCarta
          vaga={vaga}
          dadosCurriculo={dadosCurriculo}
          onFechar={() => setModalCartaAberto(false)}
        />
      )}
    </div>
  )
}

export default CardVaga