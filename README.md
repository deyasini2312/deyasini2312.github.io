# Deyasini Mitra — Portfolio

A static, single-page portfolio built from your resume. No build step, no
dependencies beyond two Google Fonts — `index.html`, `style.css`,
`script.js`, `resume-data.js`, `rag-chat.js`, and `resume.pdf`. It
also includes an "Ask my resume" chatbot — see below.

## Before you publish — 2 things to fill in

Your resume PDF lists "LinkedIn" and "GitHub" but not the actual URLs, so two
links are placeholders right now. Open `index.html` and search for `href="#"`
(there are two: one GitHub link in the hero, and LinkedIn + GitHub in the
Contact section) and replace with your real profile URLs, e.g.:

```html
<a href="https://github.com/your-username" ...>
<a href="https://www.linkedin.com/in/your-handle" ...>
```

## Host it on GitHub Pages

1. Create a new repository on GitHub (e.g. `portfolio` or
   `your-username.github.io`).
2. Push these files to the repo root:
   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```
3. In the repo on GitHub: **Settings → Pages → Build and deployment → Source**,
   choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. GitHub gives you a URL within a minute or two:
   - `https://your-username.github.io/your-repo/` (normal repo), or
   - `https://your-username.github.io/` (if the repo is named
     `your-username.github.io`).

No further configuration is needed — everything is plain HTML/CSS/JS and
GitHub Pages serves it as-is.

## Updating content later

Everything is in `index.html`, organized by section (`#summary`, `#signal`
i.e. Skills, `#experience`, `#research`, `#publication`, `#education`,
`#contact`). Each role/project is its own `<article>` block — copy an
existing one and edit the text to add a new entry.

To swap in a newer résumé PDF, replace `resume.pdf` with the new file
(keep the same filename, or update the `href="resume.pdf"` references
in `index.html`).

## The "Ask my resume" chatbot

A floating chat widget (bottom-right) lets visitors ask questions about your
background. It's a small RAG (retrieval-augmented generation) pipeline that
runs entirely in the browser:

- **Retrieval (always on, no setup):** `resume-data.js` holds ~20 factual
  excerpts pulled from your resume (summary, each skill group, each role,
  each project, the publication, each degree). `rag-chat.js` builds a
  TF‑IDF index over them in-browser and does cosine-similarity search — no
  server, no API key, no external calls. By default the widget shows the
  top matching excerpts verbatim.
- **Generation (optional):** if a visitor opens the ⚙ settings row and pastes
  an Anthropic API key, the same retrieved excerpts get sent to Claude
  (`claude-haiku-4-5-20251001`) as context, and the widget shows a written
  answer instead of raw excerpts. The key is kept in `sessionStorage` only
  — it's never written to a file, never leaves this browser tab except in
  direct calls to `api.anthropic.com`, and disappears when the tab closes.

**Why bring-your-own-key instead of baking in a key:** GitHub Pages only
serves static files — there's no server to hold a secret. Any key placed in
the repo or the shipped JS would be visible to every visitor. This design
keeps the site fully functional with zero secrets, and treats generation as
an opt-in upgrade using a key only its owner holds at that moment.

### Updating the chatbot's knowledge

Edit `resume-data.js` — each entry in `RESUME_CHUNKS` is a short, factual
paragraph with a `section` label. Keep entries focused on one topic each;
that's what makes retrieval accurate. Update this file whenever you update
the resume PDF or the page content, so the bot doesn't go stale.

### Trying it locally

Because the widget uses `fetch` for the optional Claude call, some browsers
block that from a plain `file://` page. Serve the folder locally instead:

```bash
cd portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

## Design notes

- Palette: dark ink navy (`#0C1116`) hero/nav against a warm paper
  background (`#F3F4EF`), with a teal signal color (`#2BA8A0`) and an amber
  "evidence" accent (`#D9A441`).
- Type: Fraunces (serif, headings) + IBM Plex Sans (body) + IBM Plex Mono
  (labels, dates, tags) — a deliberately academic/statistical pairing.
- Signature element: the hero animation morphs a "prior" distribution into a
  "posterior" as your key metrics (92%, 90%, ~80%, 0.89) drop in as evidence
  — a nod to the Bayesian/fairness modeling work described in Research &
  Projects. It respects `prefers-reduced-motion` and only plays once, when
  scrolled into view.
