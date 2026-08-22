(function () {
  const MODES = ['off', 'first', 'notfirst'];
  const LABEL = {
    off: 'Filter: off',
    first: 'First-author only',
    notfirst: 'Non-first-author only'
  };

  let mode = 'off';
  let identities = [];

  function profileIdentities(aliases) {
    const names = [];
    const el = document.getElementById('gsc_prf_in');
    if (el) names.push(el.textContent);
    for (const a of aliases || []) names.push(a);
    return names.map(FAFNames.parse).filter(Boolean);
  }

  function rows() {
    return Array.from(document.querySelectorAll('#gsc_a_b .gsc_a_tr'));
  }

  // 'yes' | 'no' | 'unknown'
  function classify(row) {
    const gray = row.querySelector('.gs_gray');
    const first = gray && FAFNames.firstAuthorOf(gray.textContent);
    if (!first) return 'unknown';
    return identities.some(id => FAFNames.same(id, first)) ? 'yes' : 'no';
  }

  function apply() {
    let first = 0, total = 0;
    for (const row of rows()) {
      const verdict = row.dataset.fafVerdict || (row.dataset.fafVerdict = classify(row));
      total++;
      if (verdict === 'yes') first++;
      const hide =
        (mode === 'first' && verdict === 'no') ||
        (mode === 'notfirst' && verdict === 'yes');
      row.classList.toggle('faf-hidden', hide);
    }
    updatePanel(first, total);
  }

  function updatePanel(first, total) {
    const btn = document.getElementById('faf-btn');
    const count = document.getElementById('faf-count');
    if (!btn) return;
    btn.textContent = LABEL[mode];
    btn.dataset.fafMode = mode;
    count.textContent = `${first} of ${total} shown are first-author`;
  }

  function buildPanel() {
    if (document.getElementById('faf-panel')) return;
    const anchor = document.getElementById('gsc_a_t');
    if (!anchor) return;

    const panel = document.createElement('div');
    panel.id = 'faf-panel';

    const btn = document.createElement('button');
    btn.id = 'faf-btn';
    btn.type = 'button';
    btn.addEventListener('click', () => {
      mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
      chrome.storage.sync.set({ mode });
      apply();
    });

    const count = document.createElement('span');
    count.id = 'faf-count';

    panel.append(btn, count);
    anchor.parentNode.insertBefore(panel, anchor);
  }

  // "Show more" appends rows in place; sorting/paging replaces the tbody.
  function watch() {
    const body = document.getElementById('gsc_a_b');
    if (!body) return;
    new MutationObserver(() => apply()).observe(body, { childList: true });
  }

  chrome.storage.sync.get({ mode: 'off', aliases: [] }, cfg => {
    identities = profileIdentities(cfg.aliases);
    if (!identities.length) return; // not a profile page
    mode = MODES.includes(cfg.mode) ? cfg.mode : 'off';
    buildPanel();
    apply();
    watch();
  });
})();
