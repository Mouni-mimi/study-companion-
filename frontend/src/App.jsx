import { useState } from 'react'
import UploadView from './components/UploadView'
import ReaderView from './components/ReaderView'
import ReviewQueue from './components/ReviewQueue'

export default function App() {
  const [doc, setDoc] = useState(null)
  const [tab, setTab] = useState('read')

  if (!doc) return <UploadView onStart={setDoc} />

  return (
    <div>
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px',
      }}>
        <div className="mono" style={{ fontSize: 12, color: 'var(--confused)', letterSpacing: '0.08em' }}>SIGNAL</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['read', 'review'].map(t => (
            <button key={t} onClick={() => setTab(t)} className="mono"
              style={{
                background: tab === t ? 'var(--panel)' : 'none', border: '1px solid var(--border)',
                color: tab === t ? 'var(--paper)' : 'var(--paper-dim)', fontSize: 12, padding: '6px 14px', borderRadius: 4,
              }}>
              {t === 'read' ? 'reading' : 'review queue'}
            </button>
          ))}
        </div>
        <button onClick={() => { setDoc(null); setTab('read') }} className="mono"
          style={{ background: 'none', border: 'none', color: 'var(--paper-dim)', fontSize: 12 }}>
          new document
        </button>
      </div>

      {tab === 'read' ? <ReaderView doc={doc} /> : <ReviewQueue doc={doc} />}
    </div>
  )
}
