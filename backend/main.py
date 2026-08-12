import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import STORE, make_document
from confusion import confusion_map, review_queue, section_score
from llm import explain_section, generate_quiz

app = FastAPI(title="Study Companion API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ---- schemas ----
class NewDoc(BaseModel):
    title: str
    text: str

class ReadEvent(BaseModel):
    section_id: str
    seconds: float
    revisit: bool = False
    self_flag: bool = False

class QuizAnswer(BaseModel):
    section_id: str
    correct: bool
    latency: float

# ---- routes ----
@app.post("/documents")
def create_document(payload: NewDoc):
    doc = make_document(payload.title, payload.text)
    STORE[doc.id] = doc
    return {"document_id": doc.id, "title": doc.title,
            "sections": [{"id": sid, "text": doc.sections[sid].text} for sid in doc.order]}

@app.get("/documents/{doc_id}")
def get_document(doc_id: str):
    doc = _get(doc_id)
    return {"document_id": doc.id, "title": doc.title,
            "sections": [{"id": sid, "text": doc.sections[sid].text} for sid in doc.order]}

@app.post("/documents/{doc_id}/events")
def log_event(doc_id: str, ev: ReadEvent):
    s = _get_section(doc_id, ev.section_id)
    s.time_spent += ev.seconds
    if ev.revisit:
        s.revisits += 1
    if ev.self_flag:
        s.self_flagged += 1
    s.last_seen = time.time()
    return {"ok": True, "score": section_score(s)}

@app.post("/documents/{doc_id}/quiz/{section_id}")
def get_quiz(doc_id: str, section_id: str):
    s = _get_section(doc_id, section_id)
    return generate_quiz(s.text)

@app.post("/documents/{doc_id}/quiz-result")
def submit_quiz(doc_id: str, ans: QuizAnswer):
    s = _get_section(doc_id, ans.section_id)
    if ans.correct:
        s.quiz_correct += 1
    else:
        s.quiz_wrong += 1
    s.quiz_latency.append(ans.latency)
    s.last_seen = time.time()
    return {"ok": True, "score": section_score(s)}

@app.get("/documents/{doc_id}/confusion-map")
def get_confusion_map(doc_id: str):
    return confusion_map(_get(doc_id))

@app.get("/documents/{doc_id}/review-queue")
def get_review_queue(doc_id: str):
    return review_queue(_get(doc_id))

@app.post("/documents/{doc_id}/explain/{section_id}")
def explain(doc_id: str, section_id: str):
    s = _get_section(doc_id, section_id)
    signals = section_score(s)["signals"]
    return {"explanation": explain_section(s.text, signals)}

# ---- helpers ----
def _get(doc_id: str):
    if doc_id not in STORE:
        raise HTTPException(404, "document not found")
    return STORE[doc_id]

def _get_section(doc_id: str, section_id: str):
    doc = _get(doc_id)
    if section_id not in doc.sections:
        raise HTTPException(404, "section not found")
    return doc.sections[section_id]
