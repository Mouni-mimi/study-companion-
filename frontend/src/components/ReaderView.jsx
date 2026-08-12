import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '../api'
import ConfusionRail from './ConfusionRail'
import QuizInline from './QuizInline'
import ExplainDrawer from './ExplainDrawer'

export default function ReaderView({ doc }) {
  const [scores, setScores] = useState(doc.sections.map(s => ({ section_id: s.id, confusion: 0 })))
  const [activeId, setActiveId] = useState(doc.sections[0]?.id)
  const [quizFor, setQuizFor] = useState(null)
  const [explainFor, setExplainFor] = useState(null)
  const seen = useRef(new Set())
  const enterTimes = useRef({})
  const refs = useRef({})

  const refreshScores = useCallback(async () => {
    const map = await api.confusionMap(doc.id)
    setScores(map)
  }, [doc.id])

  useEffect(() => {
    const id = setInterval(refreshScores, 3500)
    return () => clearInterval(id)
  }, [refreshScores])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        const sid = entry.target.dataset.sectionId
        if (entry.isIntersecting) {
          enterTimes.current[sid] = performance.now()
          setActiveId(sid)
        } else if (enterTimes.current[sid]) {
          const elapsed = (performance.now() - enterTimes.current[sid]) / 1000
          delete enterTimes.current[sid]
          if (elapsed > 0.5) {
            const revisit = seen.current.has(sid)
            seen.current.add(sid)
            await api.logEvent(doc.id, { section_id: sid, seconds: elapsed, revisit })
            refreshScores()
          }
        }
      })
    }, { threshold: 0.6 })

    Object.values(refs.current).forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [doc, refreshScores])

  const flag = async (sid) => {
    await api.logEvent(doc.id, { section_id: sid, seconds: 0, self_flag: true })
    refreshScores()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 92px', gap: 40, maxWidth: 900, margin: '0 auto', padding: '48px 24px 120px' }}>
      <div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--paper-dim)', marginBottom: 6 }}>READING</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 32, margin: '0 0 36px' }}>{doc.title}</h1>

        {doc.sections.map((s, i) => {
          const score = scores.find(x => x.section_id === s.id)
          return (
            <div
              key={s.id}
              ref={el => (refs.current[s.id] = el)}
              data-section-id={s.id}
              style={{
                fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, color: 'var(--paper)',
                marginBottom: 20, paddingLeft: 16,
                borderLeft: `2px solid ${score?.confusion > 0.55 ? 'var(--confused)' : 'var(--border)'}`,
                transition: 'border-color 0.4s',
              }}
            >
              <p style={{ margin: 0 }}>{s.text}</p>
              <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                <button className="mono" onClick={() => flag(s.id)}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--paper-dim)', fontSize: 11, padding: '4px 9px', borderRadius: 3 }}>
                  ⚑ lost me
                </button>
                <button className="mono" onClick={() => setQuizFor(s.id)}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--paper-dim)', fontSize: 11, padding: '4px 9px', borderRadius: 3 }}>
                  check myself
                </button>
                {score?.confusion > 0.25 && (
                  <button className="mono" onClick={() => setExplainFor(s.id)}
                    style={{ background: 'none', border: '1px solid var(--confused)', color: 'var(--confused)', fontSize: 11, padding: '4px 9px', borderRadius: 3 }}>
                    clarify this
                  </button>
                )}
              </div>
              {quizFor === s.id && (
                <QuizInline docId={doc.id} sectionId={s.id} onDone={() => { setQuizFor(null); refreshScores() }} />
              )}
            </div>
          )
        })}
      </div>

      <ConfusionRail scores={scores} activeId={activeId} onSelect={setExplainFor} />

      {explainFor && (
        <ExplainDrawer docId={doc.id} sectionId={explainFor} onClose={() => setExplainFor(null)} />
      )}
    </div>
  )
}
