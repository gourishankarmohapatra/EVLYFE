// Fuzzy Search Utility - EVLYFE
// Provides typo-tolerant search using Levenshtein distance and prefix matching

const FuzzySearch = {
  BRAND_ALIASES: {
    'nexon': 'nexon', 'nexn': 'nexon', 'nexo': 'nexon', 'nexan': 'nexon',
    'ola': 'ola', 'olaa': 'ola', 'ollaa': 'ola',
    'ather': 'ather', 'atheer': 'ather', 'athr': 'ather',
    'tata': 'tata', 'tta': 'tata', 'tatt': 'tata',
    'mahindra': 'mahindra', 'mahind': 'mahindra', 'mahindraa': 'mahindra',
    'tvs': 'tvs', 'tvsS': 'tvs',
    'bajaj': 'bajaj', 'bajjaj': 'bajaj',
    'hero': 'hero', 'heero': 'hero',
    'bgauss': 'bgauss', 'bgaus': 'bgauss', 'bguss': 'bgauss',
    'ampere': 'ampere', 'ampr': 'ampere', 'ampeer': 'ampere',
    'revolt': 'revolt', 'revoltt': 'revolt',
    'omega': 'omega', 'omega': 'omega',
    'pureev': 'pureev', 'pure ev': 'pureev', 'pureev': 'pureev',
    'tork': 'tork', 'torq': 'tork',
    'ultraviolette': 'ultraviolette', 'ultra violet': 'ultraviolette',
    'river': 'river', 'rivr': 'river',
    'quantum': 'quantum', 'quantm': 'quantum',
    'mg': 'mg', 'mgmotor': 'mg',
    'hyundai': 'hyundai', 'hyundei': 'hyundai', 'hyundia': 'hyundai',
    'kia': 'kia', 'kiia': 'kia',
    'toyota': 'toyota', 'toyta': 'toyota',
    'mercedes': 'mercedes', 'mercedez': 'mercedes',
    'bmw': 'bmw', 'bmww': 'bmw',
    'byd': 'byd', 'bydd': 'byd',
    'citroen': 'citroen', 'citroën': 'citroen',
    'volkswagen': 'volkswagen', 'volkswagon': 'volkswagen',
    'honda': 'honda', 'hondaa': 'honda',
    'tork': 'tork', 'torq': 'tork',
    'joymor': 'joymor', 'joy e-bike': 'joymor', 'joi': 'joymor',
    'ola electric': 'ola', 'tata motors': 'tata', 'ather energy': 'ather',
    'mg motor': 'mg', 'tvs motor': 'tvs'
  },

  levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  },

  normalize(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  },

  resolveAlias(query) {
    const normalized = this.normalize(query);
    if (this.BRAND_ALIASES[normalized]) {
      return this.BRAND_ALIASES[normalized];
    }
    for (const [alias, canonical] of Object.entries(this.BRAND_ALIASES)) {
      if (normalized.includes(alias) || alias.includes(normalized)) {
        return canonical;
      }
    }
    return null;
  },

  wordScore(query, word) {
    const q = this.normalize(query);
    const w = this.normalize(word);

    if (w === q) return 1.0;
    if (w.startsWith(q)) return 0.95;
    if (w.includes(q)) return 0.85;

    const alias = this.resolveAlias(q);
    if (alias && w.includes(alias)) return 0.9;
    if (alias && this.normalize(w).startsWith(alias)) return 0.88;

    const maxLen = Math.max(q.length, w.length);
    if (maxLen === 0) return 1.0;
    const dist = this.levenshtein(q, w);
    const threshold = Math.max(1, Math.floor(maxLen * 0.4));
    if (dist <= threshold) {
      return 0.7 - (dist / maxLen) * 0.5;
    }

    const qWords = q.split(/\s+/);
    const wWords = w.split(/\s+/);
    let bestWordMatch = 0;
    for (const qw of qWords) {
      for (const ww of wWords) {
        const ws = this.wordScore(qw, ww);
        if (ws > bestWordMatch) bestWordMatch = ws;
      }
    }
    if (bestWordMatch > 0.5) return bestWordMatch * 0.8;

    return 0;
  },

  matchScore(query, target) {
    if (!query || !target) return 0;
    const q = this.normalize(query);
    const t = this.normalize(target);

    if (t === q) return 1.0;
    if (t.startsWith(q)) return 0.95;
    if (t.includes(q)) return 0.85;

    const alias = this.resolveAlias(q);
    if (alias) {
      if (t.includes(alias)) return 0.9;
      if (t.startsWith(alias)) return 0.88;
    }

    const tWords = t.split(/\s+/);
    let best = 0;
    for (const word of tWords) {
      const s = this.wordScore(q, word);
      if (s > best) best = s;
    }
    if (best > 0.5) return best * 0.8;

    const maxLen = Math.max(q.length, t.length);
    if (maxLen === 0) return 1.0;
    const dist = this.levenshtein(q, t);
    const threshold = Math.max(2, Math.floor(maxLen * 0.35));
    if (dist <= threshold) {
      return 0.6 - (dist / maxLen) * 0.4;
    }

    return 0;
  },

  fuzzyFilter(query, items, fields, minScore = 0.4) {
    if (!query || !items || !items.length) return [];
    const scored = [];
    for (const item of items) {
      let bestScore = 0;
      for (const field of fields) {
        const val = item[field];
        if (!val) continue;
        const s = this.matchScore(query, String(val));
        if (s > bestScore) bestScore = s;
      }
      if (bestScore >= minScore) {
        scored.push({ item, score: bestScore });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.item);
  },

  suggestCorrection(query, items, fields) {
    if (!query || !items || !items.length) return null;
    const results = this.fuzzyFilter(query, items, fields, 0.3);
    if (results.length === 0) return null;
    const best = results[0];
    const bestField = fields.find(f => {
      const val = best[f];
      return val && this.matchScore(query, String(val)) >= 0.3;
    });
    if (bestField && best[bestField]) {
      const suggested = String(best[bestField]);
      if (this.normalize(suggested) !== this.normalize(query)) {
        return suggested;
      }
    }
    return null;
  }
};
