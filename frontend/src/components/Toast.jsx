function Toast({ mensagem, tipo = 'info' }) {
  if (!mensagem) return null

  const cores = {
    info: { bg: 'var(--papel)', border: 'var(--latao)', texto: 'var(--tinta)' },
    sucesso: { bg: '#e8f5e9', border: '#4caf50', texto: '#2e7d32' },
    erro: { bg: '#ffebee', border: '#f44336', texto: '#c62828' },
  }

  const cor = cores[tipo] || cores.info

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: cor.bg,
        border: `1px solid ${cor.border}`,
        color: cor.texto,
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-modal)',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        zIndex: 9999,
      }}
    >
      {mensagem}
    </div>
  )
}

export default Toast
