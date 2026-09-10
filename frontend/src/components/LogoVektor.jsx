function LogoVektor({ tamanho = 28, exibirTexto = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Ícone Vetorial Vektor */}
      <svg
        width={tamanho}
        height={tamanho}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Haste externa marinho escuro */}
        <path
          d="M18 24 L36 24 L50 68 L60 38 L68 38 L54 84 L46 84 Z"
          fill="#1e3a8a"
        />
        {/* Detalhes de aerodinâmica na esquerda */}
        <path d="M18 24 L34 46 L24 64 L18 70 Z" fill="#1e3a8a" />
        <path d="M28 42 L42 54 L32 62 Z" fill="#0284c7" />

        {/* Seta diagonal ascendente em ciano brilhante */}
        <path
          d="M48 62 L66 22 L72 32 L54 70 Z"
          fill="#38bdf8"
        />
        {/* Ponta da flecha */}
        <polygon
          points="62,16 78,34 68,30 52,26"
          fill="#00b4d8"
        />
        <polygon
          points="62,16 78,34 72,18"
          fill="#38bdf8"
        />
      </svg>

      {/* Tipografia da Marca */}
      {exibirTexto && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#f8fafc',
            textTransform: 'uppercase',
          }}
        >
          Vektor
        </span>
      )}
    </div>
  )
}

export default LogoVektor
