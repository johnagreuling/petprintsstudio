'use client'

type StepNum = 1 | 2 | 3 | 4

const STEPS = ['Upload', 'Styles', 'Pick', 'Checkout'] as const

export default function CreateSteps({ stepNum }: { stepNum: StepNum }) {
  return (
    <div style={{
      position: 'sticky',
      top: 60,
      zIndex: 90,
      padding: '14px 40px',
      background: 'rgba(10,10,10,.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(245,240,232,.06)',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{display:'flex',alignItems:'center',gap:0}}>
        {STEPS.map((label, i) => {
          const active = i + 1 === stepNum
          const done = i + 1 < stepNum
          const color = active ? 'var(--cream)' : done ? 'var(--gold)' : 'var(--muted)'
          const dotColor = active ? 'var(--cream)' : done ? 'var(--gold)' : 'rgba(245,240,232,.2)'
          return (
            <div key={label} style={{display:'flex',alignItems:'center'}}>
              <div style={{
                fontSize: 10,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: active ? 600 : 400,
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: dotColor,
                  display: 'inline-block',
                }} />
                {label}
              </div>
              {i < 3 && <div style={{width:24,height:1,background:'rgba(245,240,232,.1)',margin:'0 6px'}} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
