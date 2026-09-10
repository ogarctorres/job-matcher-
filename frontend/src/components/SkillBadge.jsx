function SkillBadge({ skill }) {
  return (
    <span
      className="skill-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '999px',
        backgroundColor: 'var(--latao-fundo)',
        color: 'var(--latao)',
        fontSize: '11px',
        fontFamily: 'var(--fonte-dado)',
        fontWeight: 600,
        letterSpacing: '0.02em',
        border: '1px solid rgba(181, 121, 42, 0.25)',
      }}
    >
      {skill}
    </span>
  )
}

export default SkillBadge
