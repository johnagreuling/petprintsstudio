export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        opacity: 0.6,
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '2px solid rgba(201,168,76,.18)',
          borderTopColor: '#C9A84C',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          fontSize: 10,
          letterSpacing: '.3em',
          textTransform: 'uppercase',
          color: '#C9A84C',
          fontFamily: 'var(--font-dm-sans), sans-serif',
        }}>Loading</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
