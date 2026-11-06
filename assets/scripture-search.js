(function () {
  'use strict';
  function matchesScripture(verse, query) {
    const q = query.trim().toLowerCase();
    const range = q.match(/^(.+?)\s+(\d+):(\d+)(?:[–-](\d+))?$/);
    if (range) {
      const ref = verse.ref.toLowerCase().match(/^(.+?)\s+(\d+):(\d+)$/);
      return !!ref && ref[1] === range[1] && Number(ref[2]) === Number(range[2]) && Number(ref[3]) >= Number(range[3]) && Number(ref[3]) <= Number(range[4] || range[3]);
    }
    return !q || (verse.ref + ' ' + verse.text).toLowerCase().includes(q);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = matchesScripture;
  else window.matchesScripture = matchesScripture;
})();
