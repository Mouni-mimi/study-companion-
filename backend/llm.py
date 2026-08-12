import os, re, json, random

def _fallback_explain(text: str, signals: dict) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    key = sorted(sentences, key=len)[: max(1, len(sentences) // 3)]
    why = "long time-on-section and revisits" if signals.get("revisits") else "a quiz miss"
    return (f"You flagged this via {why}. Core idea, stripped down: "
            + " ".join(key[:2]))

def explain_section(text: str, signals: dict) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _fallback_explain(text, signals)
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        prompt = (
            "A student is confused about this passage. Signals: "
            f"{signals}. Give a 2-3 sentence, concrete micro-explanation that "
            "targets exactly what these signals suggest is unclear (e.g. slow "
            "reading = simplify; revisits = clarify structure; quiz miss = "
            "correct the misconception). Passage:\n\n" + text
        )
        resp = client.messages.create(
            model="claude-sonnet-4-6", max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.content[0].text
    except Exception:
        return _fallback_explain(text, signals)

def _fallback_quiz(text: str) -> dict:
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if len(s.split()) > 4]
    if not sentences:
        return {"question": "Was this section clear?", "answer": "yes"}
    target = random.choice(sentences)
    words = [w for w in re.findall(r"[A-Za-z]{5,}", target)]
    if not words:
        return {"question": f"True or false: '{target}'", "answer": "true"}
    blank = random.choice(words)
    q = target.replace(blank, "____", 1)
    return {"question": f"Fill in the blank: {q}", "answer": blank.lower()}

def generate_quiz(text: str) -> dict:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _fallback_quiz(text)
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        prompt = ("Write ONE short comprehension question with a one-2 word answer "
                   "for this passage. Reply ONLY as JSON: {\"question\":...,\"answer\":...}. "
                   "Passage:\n\n" + text)
        resp = client.messages.create(
            model="claude-sonnet-4-6", max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = resp.content[0].text.strip().strip("`").removeprefix("json").strip()
        return json.loads(raw)
    except Exception:
        return _fallback_quiz(text)
