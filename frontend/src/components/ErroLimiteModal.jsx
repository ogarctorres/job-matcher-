function ErroLimiteModal({ mensagem, onTentarNovamente, onFechar }) {
  if (!mensagem) return null

  return (
    <div
      className="modal-overlay"
      style={{
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
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--papel)',
          padding: '24px',
          borderRadius: '6px',
          maxWidth: '480px',
          width: '100%',
          border: '1px solid var(--linha)',
        }}
      >
        <h3 style={{ margin: '0 0 10px', color: '#a33b2a', fontFamily: 'var(--fonte-titulo)' }}>
          Ops! Ocorreu um problema
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--tinta-suave)', margin: '0 0 20px' }}>
          {mensagem}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {onFechar && (
            <button className="botao-secundario" onClick={onFechar} style={{ margin: 0 }}>
              Fechar
            </button>
          )}
          {onTentarNovamente && (
            <button className="botao-buscar" onClick={onTentarNovamente}>
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErroLimiteModal
