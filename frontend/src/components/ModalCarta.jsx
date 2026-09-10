import { useState } from 'react'
import { X, Copy, Check, Sparkles, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import { useCopiaClipboard } from '../hooks/useCopiaClipboard'

function ModalCarta({ vaga, dadosCurriculo, onFechar }) {
  const [carta, setCarta] = useState('')
  const [assunto, setAssunto] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const { copiado, copiar } = useCopiaClipboard()

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

  function handleCopiarTudo() {
    const textoCompleto = `Assunto: ${assunto}\n\n${carta}`
    copiar(textoCompleto)
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
        {/* Topo do Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span className="rotulo" style={{ marginBottom: '6px' }}>Gerador de Apresentação</span>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Carta Customizada para a Vaga
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {vaga.titulo} • <strong style={{ color: 'var(--text-secondary)' }}>{vaga.empresa}</strong>
            </p>
          </div>
          <button
            onClick={onFechar}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Estado Inicial sem carta */}
        {!carta && !carregando && (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <div className="estado-vazio-icone-box" style={{ margin: '0 auto 16px' }}>
              <Sparkles size={24} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              Gerar Texto Personalizado
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '44ch', margin: '0 auto 24px', lineHeight: '1.5' }}>
              A inteligência analisa o perfil do seu currículo e a descrição desta vaga específica para redigir uma carta elegante e persuasiva.
            </p>
            <button className="botao-primario" onClick={gerar}>
              <Sparkles size={16} />
              <span>Gerar Carta com IA</span>
            </button>
          </div>
        )}

        {/* Estado Carregando */}
        {carregando && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <Loader2 size={32} className="animar-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px' }}>
              Redigindo sua carta de apresentação...
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Alinhando competências técnicas e tom profissional.
            </p>
          </div>
        )}

        {/* Erro */}
        {erro && <div className="mensagem-erro" style={{ marginTop: '16px' }}>{erro}</div>}

        {/* Conteúdo Gerado */}
        {carta && (
          <div>
            {assunto && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Assunto Recomendado para E-mail:
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {assunto}
                </span>
              </div>
            )}

            <div
              style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                fontSize: '14px',
                lineHeight: '1.7',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                maxHeight: '360px',
                overflowY: 'auto',
              }}
            >
              {carta}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="botao-secundario"
                onClick={gerar}
                disabled={carregando}
                style={{ fontSize: '13px' }}
              >
                Regerar
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="botao-primario"
                  onClick={handleCopiarTudo}
                  style={{
                    backgroundColor: copiado ? 'var(--success)' : 'var(--accent)',
                  }}
                >
                  {copiado ? (
                    <>
                      <Check size={16} />
                      <span>Copiado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copiar Assunto e Carta</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalCarta
