import { useEffect, useState } from 'react'
import { api } from '../api'
import ExplainDrawer from './ExplainDrawer'

export default function ReviewQueue({ doc }) {
  const [queue, setQueue] = useState(null)
  const [explainFor, setExplainFor] = useState(null)

  useEffect(() => { api.reviewQueue(doc.id).then(setQueue) }, [doc.id])

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px 120px' }}>
      <div className="mono" style={{ fontSize: 12, color: 'var(--paper-dim)', marginBottom: 6 }}>REVIEW QUEUE</div>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 28, margin: '0 0 8px' }}>
        Ordered by what you'll forget first
      </h1>
      <p style={{ color: 'var(--paper-dim)', fontSize: 13.5, marginBottom: 32 }}>
        Priority = confusion signal × time since you last saw it — not a fixed interval.
      </p>

      {queue === null ? (
        <div className="mono" style={{ color: 'var(--paper-dim)', fontSize: 13 }}>loading…</div>
      ) : queue.length === 0 ? (
        <div className="mono" style={{ color: 'var(--calm)', fontSize: 13 }}>Nothing flagged yet — read a bit first.</div>
      ) : (
        queue.map((q, i) => (
          <div key={q.section_id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
            <div className="mono" style={{ fontSize: 20, color: 'var(--paper-dim)', width: 24 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--paper)', marginBottom: 6 }}>{q.preview}…</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--paper-dim)' }}>
                confusion {(q.confusion * 100).toFixed(0)}% · priority {q.priority}
              </div>
            </div>
            <button onClick={() => setExplainFor(q.section_id)} className="mono"
              style={{ background: 'none', border: '1px solid var(--confused)', color: 'var(--confused)', fontSize: 11, padding: '5px 10px', borderRadius: 4 }}>
              clarify
            </button>
          </div>
        ))
      )}

      {explainFor && <ExplainDrawer docId={doc.id} sectionId={explainFor} onClose={() => setExplainFor(null)} />}
    </div>
  )
}
