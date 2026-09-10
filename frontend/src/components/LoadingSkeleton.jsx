function LoadingSkeleton({ quantidade = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {Array.from({ length: quantidade }).map((_, index) => (
        <div
          key={index}
          style={{
            padding: '22px',
            border: '1px solid var(--linha)',
            borderRadius: '4px',
            backgroundColor: 'var(--papel)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ height: '14px', width: '35%', backgroundColor: 'var(--linha)', borderRadius: '3px' }} />
          <div style={{ height: '20px', width: '65%', backgroundColor: 'var(--linha)', borderRadius: '3px' }} />
          <div style={{ height: '12px', width: '90%', backgroundColor: 'var(--linha)', borderRadius: '3px' }} />
        </div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
