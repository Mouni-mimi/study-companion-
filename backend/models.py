import re, time, uuid
from dataclasses import dataclass, field

def split_sections(text: str) -> list[str]:
    parts = [p.strip() for p in re.split(r"\n\s*\n", text.strip()) if p.strip()]
    return parts or [text.strip()]

@dataclass
class Section:
    id: str
    text: str
    word_count: int
    time_spent: float = 0.0      # seconds, accumulated
    revisits: int = 0
    quiz_correct: int = 0
    quiz_wrong: int = 0
    quiz_latency: list[float] = field(default_factory=list)
    self_flagged: int = 0        # explicit "I'm confused" taps
    last_seen: float = field(default_factory=time.time)

@dataclass
class Document:
    id: str
    title: str
    sections: dict[str, Section]
    order: list[str]

def make_document(title: str, text: str) -> Document:
    doc_id = uuid.uuid4().hex[:8]
    order, sections = [], {}
    for chunk in split_sections(text):
        sid = uuid.uuid4().hex[:8]
        sections[sid] = Section(id=sid, text=chunk, word_count=len(chunk.split()))
        order.append(sid)
    return Document(id=doc_id, title=title, sections=sections, order=order)

STORE: dict[str, Document] = {}
