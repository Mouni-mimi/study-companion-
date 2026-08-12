const BASE = 'http://localhost:8000'

async function j(resPromise) {
  const res = await resPromise
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  createDocument: async (title, text) => {
    const doc = await j(fetch(`${BASE}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, text }) }))
    return { ...doc, id: doc.document_id }
  },

  logEvent: (docId, body) =>
    j(fetch(`${BASE}/documents/${docId}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body) })),

  confusionMap: (docId) => j(fetch(`${BASE}/documents/${docId}/confusion-map`)),

  reviewQueue: (docId) => j(fetch(`${BASE}/documents/${docId}/review-queue`)),

  getQuiz: (docId, sectionId) =>
    j(fetch(`${BASE}/documents/${docId}/quiz/${sectionId}`, { method: 'POST' })),

  submitQuiz: (docId, body) =>
    j(fetch(`${BASE}/documents/${docId}/quiz-result`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body) })),

  explain: (docId, sectionId) =>
    j(fetch(`${BASE}/documents/${docId}/explain/${sectionId}`, { method: 'POST' })),
}
