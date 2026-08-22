// Name parsing/matching for Scholar author strings ("JA Doe, B Smith, ...").
// Deliberately permissive: a missed match hides a paper that should be shown,
// which is worse than showing one extra paper.
(function (root) {
  const PARTICLES = new Set([
    'van', 'von', 'de', 'del', 'della', 'der', 'den', 'di', 'da', 'do', 'dos',
    'das', 'du', 'la', 'le', 'el', 'al', 'bin', 'ibn', 'ter', 'ten', 'st'
  ]);
  const SUFFIXES = /\b(jr|sr|ii|iii|iv|phd|md|dr|prof)\b/g;
  const VOWELS = /[aeiouy]/;

  function normalize(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[.'‘’`]/g, '')
      .replace(/[^a-z\u00c0-\u024f\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // "john" -> "j", "wei-chen" -> "wc", "jm" (an initial block) -> "jm"
  function initialsOf(token) {
    if (token.includes('-')) {
      return token.split('-').filter(Boolean).map(t => t[0]).join('');
    }
    if (token.length <= 3 && !VOWELS.test(token)) return token;
    return token[0];
  }

  // -> { last, initials } | null
  function parse(nameStr) {
    const parts = normalize(nameStr).replace(SUFFIXES, '').trim().split(' ').filter(Boolean);
    if (!parts.length) return null;
    if (parts.length === 1) return { last: parts[0].replace(/-/g, ''), initials: '' };

    let i = parts.length - 1;
    while (i > 1 && PARTICLES.has(parts[i - 1])) i--;

    return {
      last: parts.slice(i).join('').replace(/-/g, ''),
      initials: parts.slice(0, i).map(initialsOf).join('')
    };
  }

  function same(a, b) {
    if (!a || !b || a.last !== b.last) return false;
    if (!a.initials || !b.initials) return true; // one side gave no given name
    return a.initials[0] === b.initials[0];
  }

  function firstAuthorOf(authorLine) {
    const first = (authorLine || '').split(',')[0];
    return parse(first);
  }

  root.FAFNames = { normalize, parse, same, firstAuthorOf };
})(typeof window !== 'undefined' ? window : globalThis);
