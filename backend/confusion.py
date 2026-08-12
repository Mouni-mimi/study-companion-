import time
from models import Section

READING_WPM = 200

def section_score(s: Section) -> dict:
    expected = max(s.word_count / READING_WPM * 60, 3)
    time_ratio = min(s.time_spent / expected, 3) / 3          # 0-1, capped at 3x expected
    revisit = min(s.revisits / 3, 1)
    attempts = s.quiz_correct + s.quiz_wrong
    quiz = (s.quiz_wrong / attempts) if attempts else 0
    lat = min(sum(s.quiz_latency) / len(s.quiz_latency) / 20, 1) if s.quiz_latency else 0
    flag = min(s.self_flagged / 2, 1)

    score = 0.30 * time_ratio + 0.20 * revisit + 0.25 * quiz + 0.10 * lat + 0.15 * flag
    return {
        "section_id": s.id,
        "confusion": round(min(score, 1.0), 3),
        "signals": {
            "time_ratio": round(time_ratio, 2), "revisits": s.revisits,
            "quiz_wrong_rate": round(quiz, 2), "avg_latency": round(lat, 2),
            "self_flagged": s.self_flagged,
        },
    }

def confusion_map(doc) -> list[dict]:
    return [section_score(doc.sections[sid]) for sid in doc.order]

def review_queue(doc) -> list[dict]:
    """Priority = confusion x recency decay. Not seen recently + confused -> reviewed first."""
    now = time.time()
    scored = []
    for sid in doc.order:
        s = doc.sections[sid]
        c = section_score(s)["confusion"]
        if c < 0.15:
            continue
        hours_since = (now - s.last_seen) / 3600
        decay = min(hours_since / 24, 1.5)          # forgetting grows over a day, capped
        priority = round(c * (0.6 + 0.4 * decay), 3)
        scored.append({"section_id": sid, "confusion": c, "priority": priority,
                        "preview": s.text[:80]})
    return sorted(scored, key=lambda x: x["priority"], reverse=True)
