/* Tests for the complete KJV collection and visitor-friendly Scripture search. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const scripture=require('../assets/scripture-search.js');
const books=JSON.parse(fs.readFileSync(path.join(__dirname,'../content/bible.json'),'utf8'));
const verses=books.flatMap(b=>b.chapters.flatMap((chapter,c)=>chapter.map((text,v)=>({ref:b.name+' '+(c+1)+':'+(v+1),text}))));
assert.equal(books.length,66);
assert.equal(verses.length,31102);
assert.equal(verses.length,new Set(verses.map(v=>v.ref)).size);
assert(verses.every(v=>v.text.trim()));
const lookup=(q,options)=>scripture.searchScripture(verses,q,options);
for(const topic of scripture.TOPICS){
  for(const reference of topic.refs){
    assert(verses.some(v=>scripture.matchesScripture(v,reference)),'Missing suggested Bible passage: '+reference);
  }
}
assert.equal(lookup('').items.length,31102,'Empty search offers the complete KJV collection');
assert.deepEqual(lookup('John 3:16').items.map(v=>v.ref),['John 3:16']);
assert.equal(lookup('Psalm 23:1–3').items.length,3,'Singular Psalm alias and passage range work');
assert.equal(lookup('Luke 18:35–43').items.length,9,'Artwork deep links to verse ranges work');
assert.equal(lookup('John 3').items.length,36,'Chapter lookup must not include John chapter 30');
assert.equal(lookup('anxiety').mode,'topic');
assert.equal(lookup('anxiety').items[0].ref,'Philippians 4:6');
assert(lookup('I am worried about my future').topics.some(x=>/anxiety/i.test(x)));
assert(lookup('I need courage').items.some(v=>v.ref==='Joshua 1:9'));
assert(lookup('I need strength').items.some(v=>v.ref==='Isaiah 40:29'));
assert(lookup('mourning my father').items.some(v=>v.ref==='Matthew 5:4'));
assert(lookup('bereavement').items.some(v=>v.ref==='Matthew 5:4'));
assert(lookup('I am scared').topics.some(t=>t.includes('Anxiety')));
assert(lookup('how should I pray').items.some(v=>v.ref==='Matthew 6:9'));
assert(lookup('confidence').items.some(v=>v.ref==='2 Timothy 1:7'));
assert(lookup('forgiveness').items.some(v=>v.ref==='Ephesians 4:31'));
assert(lookup('faith').items.some(v=>v.ref==='Hebrews 11:1'));
assert.equal(lookup('uncommonliteralxyz').mode,'text');
assert.equal(lookup('uncommonliteralxyz').items.length,0);
assert.deepEqual(lookup('anxiety',{favourites:['Philippians 4:6']}).items.map(v=>v.ref),['Philippians 4:6']);
console.log('Scripture search tests passed: 66 books, 31,102 unique nonempty verses; curated references and visitor queries resolve.');
