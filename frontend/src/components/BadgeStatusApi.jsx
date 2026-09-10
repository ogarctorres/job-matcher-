function BadgeStatusApi({ ativo, nome }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: ativo ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
        border: `1px solid ${ativo ? '#4caf50' : '#f44336'}`,
        fontSize: '11px',
        fontFamily: 'var(--fonte-dado)',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: ativo ? '#4caf50' : '#f44336',
        }}
      />
      <span style={{ color: 'var(--tinta)' }}>
        {nome}: {ativo ? 'Operacional' : 'Indisponível'}
      </span>
    </div>
  )
}

export default BadgeStatusApi
