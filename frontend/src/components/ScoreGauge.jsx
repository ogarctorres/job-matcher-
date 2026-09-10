function ScoreGauge({ score, tamanho = 72 }) {
  const raio = 28
  const circunferencia = 2 * Math.PI * raio
  const offset = circunferencia - ((score || 0) / 100) * circunferencia

  return (
    <div
      className="score-gauge"
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
          stroke="var(--linha)"
          strokeWidth="5"
          fill="transparent"
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke="var(--latao)"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontFamily: 'var(--fonte-dado)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--tinta)',
        }}
      >
        {score}%
      </span>
    </div>
  )
}

export default ScoreGauge
