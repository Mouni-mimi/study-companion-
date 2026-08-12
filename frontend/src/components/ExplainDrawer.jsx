import { useEffect, useState } from 'react'
import { api } from '../api'

export default function ExplainDrawer({ docId, sectionId, onClose }) {
  const [text, setText] = useState(null)

  useEffect(() => {
    setText(null)
    api.explain(docId, sectionId).then(r => setText(r.explanation))
  }, [docId, sectionId])

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 360, background: 'var(--panel)',
      borderLeft: '1px solid var(--border)', padding: 28, boxShadow: '-24px 0 48px rgba(0,0,0,0.35)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--confused)', letterSpacing: '0.08em' }}>TARGETED CLARIFICATION</div>
        <button onClick={onClose} className="mono" style={{ background: 'none', border: 'none', color: 'var(--paper-dim)', fontSize: 16 }}>×</button>
      </div>
      {text === null ? (
        <div className="mono" style={{ fontSize: 12, color: 'var(--paper-dim)' }}>reading the signal…</div>
      ) : (
        <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.7, color: 'var(--paper)' }}>{text}</div>
      )}
    </div>
  )
}
