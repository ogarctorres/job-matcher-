function SkillBadge({ skill }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-card)',
        color: 'var(--text-secondary)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
    >
      {skill}
    </span>
  )
}

export default SkillBadge
