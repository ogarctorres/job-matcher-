import { useState } from 'react'
import { api } from '../services/api'

function ModalCarta({ vaga, dadosCurriculo, onFechar }) {
  const [carta, setCarta] = useState('')
  const [assunto, setAssunto] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [copiado, setCopiado] = useState(false)

  async function gerar() {
    setCarregando(true)
    setErro(null)
    try {
      const res = await api.gerarCarta(dadosCurriculo, vaga)
      setCarta(res.carta)
      setAssunto(res.assunto_email)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  function copiarTexto() {
    const textoCompleto = `Assunto: ${assunto}\n\n${carta}`
    navigator.clipboard.writeText(textoCompleto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="modal-conteudo" style={{
        backgroundColor: 'var(--papel)',
        padding: '28px',
        borderRadius: '6px',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--linha)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--fonte-titulo)' }}>Carta de Apresentação com IA</h3>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        <p style={{ color: 'var(--tinta-suave)', fontSize: '14px', marginBottom: '20px' }}>
          Vaga: <strong>{vaga.titulo}</strong> na <strong>{vaga.empresa}</strong>
        </p>

        {!carta && !carregando && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <p style={{ marginBottom: '18px', color: 'var(--tinta-suave)' }}>
              A IA vai criar uma carta personalizada destacando suas habilidades específicas para esta vaga.
            </p>
            <button className="botao-buscar" onClick={gerar}>
              ✨ Gerar Carta Personalizada
            </button>
          </div>
        )}

        {carregando && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--latao)', fontFamily: 'var(--fonte-dado)' }}>Escrevendo sua carta com Gemini 3.6 Flash...</p>
          </div>
        )}

        {erro && <p className="mensagem-erro" style={{ marginTop: '12px' }}>{erro}</p>}

        {carta && (
          <div>
            {assunto && (
              <div style={{ marginBottom: '16px', background: 'var(--papel-fundo)', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--linha)' }}>
                <span className="rotulo-pequeno" style={{ display: 'block', marginBottom: '4px' }}>Sugestão de Assunto:</span>
                <strong>{assunto}</strong>
              </div>
            )}

            <div style={{
              background: 'var(--papel-fundo)',
              padding: '16px',
              borderRadius: '4px',
              border: '1px solid var(--linha)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              fontSize: '14px',
              color: 'var(--tinta)'
            }}>
              {carta}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="botao-secundario" style={{ margin: 0 }} onClick={copiarTexto}>
                {copiado ? '✅ Copiado!' : '📋 Copiar Carta'}
              </button>
              <button className="botao-buscar" onClick={onFechar}>
                Concluído
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalCarta
