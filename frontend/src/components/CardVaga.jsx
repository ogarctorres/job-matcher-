import { useState } from 'react'
import {
  Building2,
  MapPin,
  ExternalLink,
  Lightbulb,
  FileText,
  ChevronDown,
  ChevronUp,
  Wand2,
} from 'lucide-react'
import { api } from '../services/api'
import { useApp } from '../contexts/AppContext'
import ModalCarta from './ModalCarta'

function CardVaga({ vaga, dadosCurriculo }) {
  const { abrirAdaptacaoParaVaga } = useApp()
  const [sugestoes, setSugestoes] = useState(null)
  const [carregandoSugestao, setCarregandoSugestao] = useState(false)
  const [erroSugestao, setErroSugestao] = useState(null)
  const [painelAberto, setPainelAberto] = useState(false)
  const [modalCartaAberto, setModalCartaAberto] = useState(false)

  const score = vaga.score || 0
  let badgeClasse = 'score-badge-baixo'
  let labelScore = 'Compatibilidade Baixa'

  if (score >= 70) {
    badgeClasse = 'score-badge-alto'
    labelScore = 'Alta Aderência'
  } else if (score >= 40) {
    badgeClasse = 'score-badge-medio'
    labelScore = 'Compatibilidade Parcial'
  }

  async function alternarSugestoes() {
    if (sugestoes) {
      setPainelAberto(!painelAberto)
      return
    }

    setCarregandoSugestao(true)
    setErroSugestao(null)

    try {
      const dados = await api.gerarSugestao(dadosCurriculo, vaga)
      setSugestoes(dados.sugestoes)
      setPainelAberto(true)
    } catch (falha) {
      setErroSugestao(falha.message)
    } finally {
      setCarregandoSugestao(false)
    }
  }

  return (
    <article className="card-vaga">
      <div className="card-vaga-header">
        <div>
          <h3 className="card-vaga-titulo">{vaga.titulo}</h3>
          <div className="card-vaga-empresa">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={14} aria-hidden="true" />
              {vaga.empresa}
            </span>
            {vaga.localizacao && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} aria-hidden="true" />
                {vaga.localizacao}
              </span>
            )}
          </div>
        </div>

        <div className={`card-vaga-score-badge ${badgeClasse} tabular-nums`} role="status" aria-label={`Score de aderência: ${score} por cento, ${labelScore}`}>
          <span>{score}%</span>
          <span style={{ fontWeight: 500, fontSize: '11px', opacity: 0.85 }}>• {labelScore}</span>
        </div>
      </div>

      <p className="card-vaga-explicacao">{vaga.explicacao_score}</p>

      <div className="card-vaga-acoes">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="botao-secundario"
            onClick={alternarSugestoes}
            disabled={carregandoSugestao}
            aria-expanded={painelAberto}
            aria-label={sugestoes && painelAberto ? 'Ocultar dicas de aplicação' : 'Ver dicas de aplicação para esta vaga'}
            style={{ padding: '7px 14px', fontSize: '12.5px' }}
          >
            <Lightbulb size={14} color="var(--warning)" aria-hidden="true" />
            <span>{carregandoSugestao ? 'Buscando dicas…' : sugestoes && painelAberto ? 'Ocultar Dicas' : 'Dicas de Aplicação'}</span>
            {sugestoes && (painelAberto ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />)}
          </button>

          <button
            type="button"
            className="botao-secundario"
            onClick={() => setModalCartaAberto(true)}
            aria-haspopup="dialog"
            aria-label={`Gerar carta de apresentação para ${vaga.titulo}`}
            style={{ padding: '7px 14px', fontSize: '12.5px' }}
          >
            <FileText size={14} color="var(--accent)" aria-hidden="true" />
            <span>Gerar Carta</span>
          </button>

          <button
            type="button"
            className="botao-secundario"
            onClick={() => abrirAdaptacaoParaVaga(vaga)}
            style={{ padding: '7px 14px', fontSize: '12.5px', borderColor: 'var(--accent-border)' }}
            title="Reescrever meu currículo direcionado aos requisitos desta vaga"
            aria-label={`Otimizar currículo para a vaga de ${vaga.titulo}`}
          >
            <Wand2 size={14} color="var(--accent)" aria-hidden="true" />
            <span>Otimizar Currículo</span>
          </button>
        </div>

        {vaga.link && (
          <a
            className="link-vaga"
            href={vaga.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Acessar anúncio original da vaga de ${vaga.titulo} na empresa ${vaga.empresa} (abre em nova aba)`}
          >
            <span>Ver Vaga</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>

      {erroSugestao && (
        <p className="mensagem-erro" role="alert" style={{ marginTop: '12px' }}>
          {erroSugestao}
        </p>
      )}

      {/* Painel de sugestões expansível */}
      {sugestoes && painelAberto && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px 18px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span className="rotulo" style={{ marginBottom: '8px' }}>
            Como destacar seu perfil para esta vaga
          </span>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sugestoes.map((sugestao, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  paddingLeft: '14px',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '7px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                  }}
                />
                {sugestao}
              </li>
            ))}
          </ul>
        </div>
      )}

      {modalCartaAberto && (
        <ModalCarta
          vaga={vaga}
          dadosCurriculo={dadosCurriculo}
          onFechar={() => setModalCartaAberto(false)}
        />
      )}
    </article>
  )
}

export default CardVaga