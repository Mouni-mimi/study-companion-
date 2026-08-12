# Signal — a cognitive-load-aware study companion

A study companion that infers where you're actually confused from *behavior*
(dwell time, revisits, quiz misses, self-flags) instead of asking you to
guess, then targets explanations and spaced review at exactly those spots.

## Why this is different from Anki / Notion AI / summarizers
Existing tools treat all content equally and rely on the reader to notice
their own confusion. This tracks *reading behavior itself* to build a live
"confusion map" per section, generates micro-explanations targeted at what
the signals imply is wrong (slow reading → simplify; revisits → clarify
structure; quiz miss → correct the misconception), and schedules review by
`confusion × forgetting decay` instead of a fixed spaced-repetition interval.

## Architecture
```
backend/   FastAPI — in-memory store, confusion scoring, review scheduling,
           LLM-backed explanation + quiz generation (falls back to
           rule-based extraction if no API key is set)
frontend/  React + Vite — reading view with a live SVG "signal rail"
           (seismograph-style), inline quizzes, explanation drawer,
           review queue
```

### Confusion scoring (`backend/confusion.py`)
```
confusion = 0.30·time_ratio + 0.20·revisits + 0.25·quiz_wrong_rate
          + 0.10·quiz_latency + 0.15·self_flags
```
`time_ratio` compares actual dwell time to an expected-reading-speed
baseline (200 wpm). All signals are logged client-side via
`IntersectionObserver` (dwell/revisit) and an inline quiz widget
(correctness + latency).

### Review scheduling (`backend/confusion.py::review_queue`)
Priority = `confusion × (0.6 + 0.4 × min(hours_since_last_seen / 24, 1.5))`
— confused *and* stale sections surface first, distinct from generic SM-2.

## Run it

**Backend**
```bash
cd backend
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...   # optional — falls back to rule-based logic without it
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

## Next steps for a v2 (good talking points for interviews)
- Swap in-memory store for Postgres; persist sessions across visits
- PDF/lecture-video ingestion (timestamp-aligned dwell tracking for video)
- Replace the hand-tuned confusion weights with a model trained on labeled
  "was this actually confusing" feedback
- Multi-document review queue that interleaves across a whole course
