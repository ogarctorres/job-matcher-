function ScoreGauge({ score = 0, tamanho = 72 }) {
  const raio = 26
  const circunferencia = 2 * Math.PI * raio
  const porcentagem = Math.min(Math.max(score, 0), 100)
  const offset = circunferencia - (porcentagem / 100) * circunferencia

  let corAcento = 'var(--danger)'
  if (porcentagem >= 70) {
    corAcento = 'var(--success)'
  } else if (porcentagem >= 40) {
    corAcento = 'var(--warning)'
  }

  return (
    <div
      style={{
        position: 'relative',
        width: tamanho,
        height: tamanho,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={tamanho} height={tamanho} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke="var(--bg-surface)"
          strokeWidth="5"
          fill="transparent"
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke={corAcento}
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-mono)',
          fontSize: tamanho > 80 ? '16px' : '13px',
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}
      >
        {porcentagem}%
      </span>
    </div>
  )
}

export default ScoreGauge
