export default function ConfusionRail({ scores, activeId, onSelect }) {
  const rowH = 42
  const height = Math.max(scores.length * rowH, rowH)

  return (
    <div style={{ position: 'sticky', top: 24 }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--paper-dim)', marginBottom: 8, letterSpacing: '0.08em' }}>
        SIGNAL — LIVE READ
      </div>
      <svg width={92} height={height} style={{ overflow: 'visible' }}>
        <line x1={46} y1={0} x2={46} y2={height} stroke="var(--border)" strokeWidth="1" />
        {scores.map((s, i) => {
          const y = i * rowH + rowH / 2
          const amp = 6 + s.confusion * 34
          const isActive = s.section_id === activeId
          const color = s.confusion > 0.55 ? 'var(--confused)' : s.confusion > 0.25 ? '#c9a15a' : 'var(--calm)'
          return (
            <g key={s.section_id} onClick={() => onSelect(s.section_id)} style={{ cursor: 'pointer' }}>
              <path
                d={`M ${46 - amp} ${y} Q 46 ${y - amp * 0.8} 46 ${y} Q 46 ${y + amp * 0.8} ${46 + amp} ${y}`}
                fill="none" stroke={color} strokeWidth={isActive ? 2.5 : 1.5}
                opacity={isActive ? 1 : 0.75}
              />
              <circle cx={46} cy={y} r={isActive ? 4 : 2.5} fill={color}>
                {isActive && <animate attributeName="r" values="3;5;3" dur="1.6s" repeatCount="indefinite" />}
              </circle>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
