/* No external dependencies: exercise calendar rotation, archive filters and Bible links. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {dailyWork, dayNumber, dateKey, filterWorks} = require('../assets/christian-art.js');
const matchesScripture = require('../assets/scripture-search.js');
const works = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/art-collection.json'), 'utf8'));
const base = dayNumber('2026-11-06');
const seen = new Set();
for (let i = 0; i < works.length; i++) {
  const key = new Date((base + i) * 86400000).toISOString().slice(0, 10);
  seen.add(dailyWork(works, key).id);
}
assert.equal(seen.size, works.length, 'Every work appears once in a complete daily cycle');
assert.equal(dailyWork(works, '2026-11-06').id, 'met-436572');
assert.equal(dailyWork([...works].reverse(), '2026-11-06').id, 'met-436572', 'Sequence is independent of JSON order');
assert.equal(dailyWork(works, new Date((base + works.length) * 86400000).toISOString().slice(0,10)).id, 'met-436572');
assert.equal(dailyWork(works, '2026-11-05').id, [...works].sort((a,b)=>a.sequence-b.sequence).at(-1).id);
assert.equal(dayNumber('2027-03-29') - dayNumber('2027-03-28'), 1, 'Calendar arithmetic crosses daylight saving changes');
assert.equal(dayNumber('2028-03-01') - dayNumber('2028-02-28'), 2, 'Leap day remains in the rotation');
assert.equal(dateKey(new Date(2026,10,6,23,59)), '2026-11-06');
assert.throws(()=>dayNumber('2026-02-30'));
assert.throws(()=>dailyWork([], '2026-11-06'));
assert.equal(filterWorks(works, {query:'  el greco  '}).length, 4);
assert.equal(filterWorks(works, {query:'gutenberg'})[0].id, 'cma-143873');
assert.equal(filterWorks(works, {query:'no-such-artwork'}).length, 0);
const manuscripts = filterWorks(works, {medium:'Manuscripts & books'});
assert(manuscripts.length > 25);
const combined = filterWorks(works, {medium:'Manuscripts & books', topic:'Old Testament', period:'Before 1400'});
assert(combined.some(w=>w.id==='cma-165008'));
assert(combined.every(w=>w.type==='Manuscripts & books' && w.topic==='Old Testament' && w.period==='Before 1400'));
const books = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/bible.json'), 'utf8'));
const verses = books.flatMap(b=>b.chapters.flatMap((c,ci)=>c.map((text,vi)=>({ref:`${b.name} ${ci+1}:${vi+1}`,text}))));
assert.equal(verses.filter(v=>matchesScripture(v,'John 4:1–26')).length,26);
assert.equal(verses.filter(v=>matchesScripture(v,'John 4:1')).length,1);
assert.equal(verses.filter(v=>matchesScripture(v,'Matthew 17:1-8')).length,8);
for (const w of works.filter(w=>w.scripture)) assert(verses.some(v=>matchesScripture(v,w.scripture)), `Broken Bible link: ${w.scripture}`);
console.log(`Art tests passed: ${works.length}-day rotation, calendar boundaries, combined filters, and Bible passage links.`);
