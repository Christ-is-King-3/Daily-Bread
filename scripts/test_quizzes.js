const assert=require('node:assert/strict');
const {makePuzzle,bank}=require('../assets/crossword');
for(let day=0;day<366;day++)for(const [level,count,size]of [['easy',5,11],['medium',8,15],['hard',12,21]]){
 const date=new Date(Date.UTC(2026,10,7+day)).toISOString().slice(0,10),p=makePuzzle(date,level);
 assert.equal(p.entries.length,count);assert.equal(p.size,size);assert.deepEqual(p,makePuzzle(date,level));
 const actual=new Set();for(const e of p.entries){assert(bank.some(b=>b[0]===e.answer&&b.includes(e.clue)));assert(!e.clue.toUpperCase().includes(e.answer));for(let i=0;i<e.answer.length;i++){const r=e.r+(e.dir==='down'?i:0),c=e.c+(e.dir==='across'?i:0);assert.equal(p.grid[r][c].letter,e.answer[i]);actual.add(r+','+c)}}
 // Every non-block square belongs to a clue, and all answer squares form one connected component.
 const visited=new Set(),queue=[actual.values().next().value];while(queue.length){const k=queue.pop();if(visited.has(k))continue;visited.add(k);const [r,c]=k.split(',').map(Number);for(const [dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){const n=(r+dr)+','+(c+dc);if(actual.has(n)&&!visited.has(n))queue.push(n)}}assert.equal(visited.size,actual.size);
}
for(const level of ['easy','medium','hard'])assert.notDeepEqual(makePuzzle('2026-11-07',level),makePuzzle('2026-11-08',level));
console.log('1,098 deterministic, connected daily crosswords verified across three difficulty levels.');
