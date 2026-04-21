export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: 'fadeIn .25s ease-out' }}>
      {children}
      <style>{`@keyframes fadeIn { from { opacity: 0.4; } to { opacity: 1; } }`}</style>
    </div>
  )
}
