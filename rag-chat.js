/* ============================================================
   Client-side RAG chatbot.
   - Retrieval: TF-IDF + cosine similarity over RESUME_CHUNKS (resume-data.js).
     Runs fully in-browser, no network call, no key required.
   - Generation (optional): if the visitor enters an Anthropic API key,
     the retrieved excerpts are sent as context to Claude for a written
     answer. The key lives only in sessionStorage for this tab and is
     used solely for direct calls to api.anthropic.com.
   ============================================================ */

(function () {
  const STOPWORDS = new Set([
    "a","an","the","is","are","was","were","be","been","being","and","or","but",
    "if","then","so","of","in","on","at","to","for","with","about","as","by",
    "from","this","that","these","those","it","its","her","she","he","his","him",
    "they","them","their","i","you","your","we","our","do","does","did","has",
    "have","had","not","what","which","who","whom","how","when","where","why",
    "can","could","would","should","will","shall","may","might","tell","me","please"
  ]);

  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9%.\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t));
  }

  // ---- Build TF-IDF index over RESUME_CHUNKS once ----
  // Section name is folded in (with extra weight) so queries like "education"
  // or "skills" retrieve the right chunks even if that exact word isn't in
  // the body text.
  const docs = RESUME_CHUNKS.map((c) => tokenize(`${c.section} ${c.section} ${c.text}`));
  const df = new Map(); // document frequency per term
  docs.forEach((tokens) => {
    new Set(tokens).forEach((t) => df.set(t, (df.get(t) || 0) + 1));
  });
  const N = docs.length;
  const idf = new Map();
  df.forEach((count, term) => idf.set(term, Math.log(1 + N / count)));

  function vectorize(tokens) {
    const tf = new Map();
    tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
    const vec = new Map();
    tf.forEach((count, term) => {
      if (idf.has(term)) vec.set(term, (count / tokens.length) * idf.get(term));
    });
    let norm = 0;
    vec.forEach((v) => (norm += v * v));
    norm = Math.sqrt(norm) || 1;
    vec.forEach((v, k) => vec.set(k, v / norm));
    return vec;
  }

  const chunkVectors = docs.map(vectorize);

  function cosineSim(a, b) {
    let sum = 0;
    a.forEach((v, k) => {
      if (b.has(k)) sum += v * b.get(k);
    });
    return sum;
  }

  function retrieve(question, k = 3) {
    const qVec = vectorize(tokenize(question));
    const scored = chunkVectors.map((vec, i) => ({
      chunk: RESUME_CHUNKS[i],
      score: cosineSim(qVec, vec)
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k).filter((s) => s.score > 0);
  }

  // ---- Optional generation via Anthropic API ----
  const KEY_STORAGE = "dm_portfolio_anthropic_key";
  function getApiKey() {
    try { return sessionStorage.getItem(KEY_STORAGE) || ""; } catch (e) { return ""; }
  }
  function setApiKey(key) {
    try {
      if (key) sessionStorage.setItem(KEY_STORAGE, key);
      else sessionStorage.removeItem(KEY_STORAGE);
    } catch (e) { /* sessionStorage unavailable; ignore */ }
  }

  async function generateAnswer(question, matches) {
    const apiKey = getApiKey();
    const context = matches
      .map((m) => `[${m.chunk.section}] ${m.chunk.text}`)
      .join("\n\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system:
          "You answer questions about Deyasini Mitra using only the resume excerpts provided in the user message. " +
          "Speak about her in the third person, in 2-4 concise sentences. " +
          "If the excerpts don't contain the answer, say the resume doesn't cover that, and don't guess.",
        messages: [
          {
            role: "user",
            content: `Resume excerpts:\n${context}\n\nQuestion: ${question}`
          }
        ]
      })
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`API error ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    return textBlock ? textBlock.text.trim() : "";
  }

  // ---- UI wiring ----
  const els = {};
  function q(id) { return document.getElementById(id); }

  function renderMessage(role, html) {
    const wrap = document.createElement("div");
    wrap.className = `rag-msg rag-msg--${role}`;
    wrap.innerHTML = html;
    els.messages.appendChild(wrap);
    els.messages.scrollTop = els.messages.scrollHeight;
    return wrap;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function renderRetrievalOnly(matches) {
    if (!matches.length) {
      return `<p>I couldn't find anything relevant in the resume for that. Try asking about her skills, experience, projects, education, or publication.</p>`;
    }
    const items = matches
      .map((m) => `<li><span class="rag-tag">${escapeHtml(m.chunk.section)}</span> ${escapeHtml(m.chunk.text)}</li>`)
      .join("");
    return `<p>Here's what the resume says:</p><ul class="rag-excerpts">${items}</ul>`;
  }

  async function handleAsk(question) {
    if (!question.trim()) return;
    renderMessage("user", `<p>${escapeHtml(question)}</p>`);
    els.input.value = "";
    els.quickRow.hidden = true;

    const thinking = renderMessage("bot", `<p class="rag-thinking">Searching the resume…</p>`);
    const matches = retrieve(question, 3);

    if (getApiKey()) {
      try {
        thinking.querySelector("p").textContent = "Asking Claude…";
        const answer = await generateAnswer(question, matches.length ? matches : []);
        thinking.innerHTML = `<p>${escapeHtml(answer || "I don't have that information in the resume.")}</p>`;
      } catch (err) {
        thinking.innerHTML =
          `<p class="rag-error">Couldn't reach the API (${escapeHtml(err.message)}). Showing the closest resume excerpts instead.</p>` +
          renderRetrievalOnly(matches);
      }
    } else {
      thinking.innerHTML = renderRetrievalOnly(matches);
    }
  }

  function updateModeStatus() {
    els.status.textContent = getApiKey() ? "Generating answers with Claude" : "Retrieval only — add a key for written answers";
    els.status.classList.toggle("rag-status--live", !!getApiKey());
  }

  function init() {
    els.toggle = q("ragToggle");
    els.panel = q("ragPanel");
    els.close = q("ragClose");
    els.messages = q("ragMessages");
    els.input = q("ragInput");
    els.form = q("ragForm");
    els.quickRow = q("ragQuickRow");
    els.status = q("ragStatus");
    els.settingsToggle = q("ragSettingsToggle");
    els.settingsRow = q("ragSettingsRow");
    els.keyInput = q("ragKeyInput");
    els.keySave = q("ragKeySave");
    els.keyClear = q("ragKeyClear");

    if (!els.toggle || !els.panel) return; // markup not present

    els.keyInput.value = getApiKey();
    updateModeStatus();

    els.toggle.addEventListener("click", () => {
      const open = els.panel.classList.toggle("open");
      els.toggle.setAttribute("aria-expanded", String(open));
      if (open) els.input.focus();
    });
    els.close.addEventListener("click", () => {
      els.panel.classList.remove("open");
      els.toggle.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.panel.classList.contains("open")) {
        els.panel.classList.remove("open");
        els.toggle.setAttribute("aria-expanded", "false");
      }
    });

    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleAsk(els.input.value);
    });

    els.quickRow.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => handleAsk(btn.textContent));
    });

    els.settingsToggle.addEventListener("click", () => {
      const hidden = els.settingsRow.hidden;
      els.settingsRow.hidden = !hidden;
    });
    els.keySave.addEventListener("click", () => {
      setApiKey(els.keyInput.value.trim());
      updateModeStatus();
      els.settingsRow.hidden = true;
    });
    els.keyClear.addEventListener("click", () => {
      els.keyInput.value = "";
      setApiKey("");
      updateModeStatus();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
