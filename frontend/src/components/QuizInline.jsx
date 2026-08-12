import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

export default function QuizInline({ docId, sectionId, onDone }) {
  const [quiz, setQuiz] = useState(null)
  const [value, setValue] = useState('')
  const [result, setResult] = useState(null)
  const shownAt = useRef(null)

  useEffect(() => {
    api.getQuiz(docId, sectionId).then(q => { setQuiz(q); shownAt.current = performance.now() })
  }, [docId, sectionId])

  const submit = async () => {
    const latency = (performance.now() - shownAt.current) / 1000
    const correct = value.trim().toLowerCase() === String(quiz.answer).trim().toLowerCase()
    await api.submitQuiz(docId, { section_id: sectionId, correct, latency })
    setResult(correct ? 'correct' : 'off')
    setTimeout(onDone, 1100)
  }

  if (!quiz) return null

  return (
    <div style={{ marginTop: 10, padding: 14, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 6 }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--paper-dim)', marginBottom: 6 }}>QUICK CHECK</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 14, marginBottom: 10 }}>{quiz.question}</div>
      {result ? (
        <div className="mono" style={{ fontSize: 12, color: result === 'correct' ? 'var(--calm)' : 'var(--confused)' }}>
          {result === 'correct' ? '✓ got it — logged' : `✗ answer: ${quiz.answer} — logged`}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={value} onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            autoFocus
            style={{ flex: 1, background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--paper)', padding: '6px 10px', borderRadius: 4, fontFamily: 'var(--sans)', fontSize: 13 }}
          />
          <button onClick={submit} className="mono"
            style={{ background: 'var(--calm)', border: 'none', color: '#0d1512', fontSize: 12, padding: '6px 14px', borderRadius: 4, fontWeight: 600 }}>
            answer
          </button>
        </div>
      )}
    </div>
  )
}
