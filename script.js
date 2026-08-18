// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const sidenav = document.getElementById('sidenav');
navToggle.addEventListener('click', () => {
  const open = sidenav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.navlist a').forEach(link => {
  link.addEventListener('click', () => {
    sidenav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Scroll-spy =====
const sections = document.querySelectorAll('main .section, .hero');
const navLinks = document.querySelectorAll('[data-nav]');
const setActive = (id) => {
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
};
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) setActive(entry.target.id);
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
sections.forEach(s => spy.observe(s));

// ===== Resume download: force a save instead of navigating away =====
(function () {
  const links = document.querySelectorAll('.resume-download');
  links.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const filename = link.getAttribute('download') || 'resume.pdf';
      try {
        const res = await fetch(link.href);
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (err) {
        // Fallback: let the browser handle it the normal way.
        window.location.href = link.href;
      }
    });
  });
})();

// ===== Robot mascot: walks up to the chatbot, on a repeating loop =====
(function () {
  const mascot = document.getElementById('ragMascot');
  const bubbleClose = document.getElementById('robotBubbleClose');
  const toggle = document.getElementById('ragToggle');
  if (!mascot || !toggle) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const walkDuration = reduceMotion ? 400 : 1300;
  const bubbleVisibleDuration = 5000;
  const fadeDuration = 400;
  const pauseBetweenCycles = 9000;

  let stopped = false;

  function stop() {
    stopped = true;
    mascot.classList.remove('is-walking', 'show-bubble', 'has-arrived');
    mascot.classList.add('is-hidden');
    setTimeout(() => mascot.remove(), fadeDuration);
  }

  mascot.addEventListener('click', (e) => {
    if (e.target === bubbleClose) return;
    stop();
    toggle.click();
  });
  bubbleClose.addEventListener('click', (e) => {
    e.stopPropagation();
    stop();
  });

  function cycle() {
    if (stopped) return;
    mascot.classList.remove('is-hidden');
    mascot.classList.add('is-walking');

    setTimeout(() => {
      if (stopped) return;
      mascot.classList.add('has-arrived', 'show-bubble');

      setTimeout(() => {
        if (stopped) return;
        mascot.classList.remove('show-bubble');

        setTimeout(() => {
          if (stopped) return;
          mascot.classList.remove('is-walking', 'has-arrived');
          mascot.classList.add('is-hidden');

          setTimeout(() => {
            if (stopped) return;
            mascot.classList.remove('is-hidden');
            cycle();
          }, pauseBetweenCycles);
        }, fadeDuration);
      }, bubbleVisibleDuration);
    }, walkDuration);
  }

  setTimeout(cycle, 1400);
})();

// ===== Project filter (Work section) =====
(function () {
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.project-card');
  const empty = document.getElementById('filterEmpty');
  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const filter = chip.dataset.filter;
      let visibleCount = 0;
      cards.forEach(card => {
        const tags = (card.dataset.tags || '').split(',');
        const show = filter === 'All' || tags.includes(filter);
        card.classList.toggle('is-hidden', !show);
        if (show) visibleCount++;
      });
      empty.hidden = visibleCount !== 0;
    });
  });
})();

// ===== Accordion: only one entry open at a time =====
(function () {
  const entries = document.querySelectorAll('#experience .entry');
  entries.forEach(entry => {
    entry.addEventListener('toggle', () => {
      if (entry.open) {
        entries.forEach(other => {
          if (other !== entry) other.open = false;
        });
      }
    });
  });
})();

// ===== Hero: prior -> posterior belief update =====
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const priorPath = document.getElementById('priorPath');
  const priorStroke = document.getElementById('priorStroke');
  const postPath = document.getElementById('postPath');
  const postStroke = document.getElementById('postStroke');
  const ticksGroup = document.getElementById('evidenceTicks');
  const postLabel = document.getElementById('postLabel');

  const baseline = 300;

  // Gaussian-ish curve as an SVG path across x in [30, 430]
  function curvePath(mean, spread, height) {
    const points = [];
    for (let x = 30; x <= 430; x += 8) {
      const z = (x - mean) / spread;
      const y = baseline - height * Math.exp(-0.5 * z * z);
      points.push([x, y]);
    }
    let d = `M30,${baseline} `;
    points.forEach(([x, y]) => { d += `L${x.toFixed(1)},${y.toFixed(1)} `; });
    d += `L430,${baseline} Z`;
    return d;
  }
  function strokeOnly(mean, spread, height) {
    const points = [];
    for (let x = 30; x <= 430; x += 8) {
      const z = (x - mean) / spread;
      const y = baseline - height * Math.exp(-0.5 * z * z);
      points.push([x, y]);
    }
    let d = `M${points[0][0]},${points[0][1]} `;
    points.slice(1).forEach(([x, y]) => { d += `L${x.toFixed(1)},${y.toFixed(1)} `; });
    return d;
  }

  const prior = { mean: 170, spread: 90, height: 130 };
  const posterior = { mean: 300, spread: 42, height: 210 };

  priorPath.setAttribute('d', curvePath(prior.mean, prior.spread, prior.height));
  priorStroke.setAttribute('d', strokeOnly(prior.mean, prior.spread, prior.height));

  if (reduceMotion) {
    postPath.setAttribute('d', curvePath(posterior.mean, posterior.spread, posterior.height));
    postStroke.setAttribute('d', strokeOnly(posterior.mean, posterior.spread, posterior.height));
    postLabel.textContent = 'posterior';
    return;
  }

  postPath.setAttribute('d', curvePath(prior.mean, prior.spread, prior.height));
  postStroke.setAttribute('d', strokeOnly(prior.mean, prior.spread, prior.height));
  postPath.style.opacity = '0';
  postStroke.style.opacity = '0';

  const evidence = [
    { x: 205, label: '92%' },
    { x: 250, label: '90%' },
    { x: 300, label: '~80%' },
    { x: 350, label: '0.89' },
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function runCycle() {
    ticksGroup.innerHTML = '';
    postPath.style.opacity = '0';
    postStroke.style.opacity = '0';
    postLabel.textContent = '+ evidence';

    const duration = 2600;
    const start = performance.now();
    let tickIndex = 0;
    const tickTimes = evidence.map((_, i) => 400 + i * 480);

    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const e = easeInOut(t);

      if (t > 0.15) {
        postPath.style.opacity = String(Math.min((t - 0.15) / 0.2, 1) * 0.9);
        postStroke.style.opacity = String(Math.min((t - 0.15) / 0.2, 1));
      }

      const mean = lerp(prior.mean, posterior.mean, e);
      const spread = lerp(prior.spread, posterior.spread, e);
      const height = lerp(prior.height, posterior.height, e);
      postPath.setAttribute('d', curvePath(mean, spread, height));
      postStroke.setAttribute('d', strokeOnly(mean, spread, height));

      while (tickIndex < evidence.length && elapsed > tickTimes[tickIndex]) {
        const ev = evidence[tickIndex];
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tick.setAttribute('transform', `translate(${ev.x}, ${baseline})`);
        tick.innerHTML = `
          <circle r="4" class="evidence-tick" />
          <text y="-10" text-anchor="middle" class="svg-label" style="fill:#D9A441">${ev.label}</text>
        `;
        tick.style.opacity = '0';
        tick.style.transition = 'opacity .35s ease';
        ticksGroup.appendChild(tick);
        requestAnimationFrame(() => { tick.style.opacity = '1'; });
        tickIndex++;
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        postLabel.textContent = 'posterior';
        setTimeout(runCycle, 2600);
      }
    }
    requestAnimationFrame(frame);
  }

  const heroVisual = document.querySelector('.hero-visual');
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCycle();
        heroObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  heroObserver.observe(heroVisual);
})();
