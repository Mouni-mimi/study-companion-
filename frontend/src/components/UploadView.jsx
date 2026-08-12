import { useState } from 'react'
import { api } from '../api'

const SAMPLE = {
  title: 'Backpropagation, briefly',
  text: `Backpropagation trains a neural network by pushing the error at the output layer backward through the network, one layer at a time.

Each layer's weights are nudged in the direction that would have reduced the error, using the chain rule to work out how much that layer contributed to the mistake.

The size of each nudge is scaled by the learning rate — too high and the network overshoots and never settles, too low and training crawls.

Over many passes through the training data, this repeated backward correction is what lets the network gradually fit the patterns in the data.`,
}

export default function UploadView({ onStart }) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const begin = async (t, x) => {
    setLoading(true)
    const doc = await api.createDocument(t, x)
    setLoading(false)
    onStart(doc)
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px' }}>
      <div className="mono" style={{ fontSize: 12, color: 'var(--confused)', letterSpacing: '0.1em', marginBottom: 10 }}>
        SIGNAL
      </div>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 40, margin: '0 0 12px', lineHeight: 1.15 }}>
        A study companion that reads you back.
      </h1>
      <p style={{ color: 'var(--paper-dim)', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
        It watches how you read — where you slow down, scroll back, or miss a check — and turns that into
        a live confusion map, targeted explanations, and a review queue ordered by what you actually forgot.
      </p>

      <label className="mono" style={{ fontSize: 11, color: 'var(--paper-dim)' }}>TITLE</label>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 4 — Neural Networks"
        style={{ width: '100%', margin: '6px 0 18px', background: 'var(--panel)', border: '1px solid var(--border)',
          color: 'var(--paper)', padding: '10px 12px', borderRadius: 5, fontFamily: 'var(--sans)', fontSize: 14 }} />

      <label className="mono" style={{ fontSize: 11, color: 'var(--paper-dim)' }}>TEXT TO STUDY</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
        placeholder="Paste your notes, a textbook passage, or lecture text — separate paragraphs with a blank line."
        style={{ width: '100%', margin: '6px 0 24px', background: 'var(--panel)', border: '1px solid var(--border)',
          color: 'var(--paper)', padding: '12px', borderRadius: 5, fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.6, resize: 'vertical' }} />

      <div style={{ display: 'flex', gap: 12 }}>
        <button disabled={!title || !text || loading} onClick={() => begin(title, text)}
          className="mono"
          style={{ background: 'var(--confused)', border: 'none', color: '#1a0f08', fontWeight: 600, fontSize: 13,
            padding: '11px 20px', borderRadius: 5, opacity: (!title || !text) ? 0.4 : 1 }}>
          {loading ? 'preparing…' : 'begin reading →'}
        </button>
        <button onClick={() => begin(SAMPLE.title, SAMPLE.text)} disabled={loading} className="mono"
          style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--paper-dim)', fontSize: 13, padding: '11px 20px', borderRadius: 5 }}>
          try a sample
        </button>
      </div>
    </div>
  )
}
