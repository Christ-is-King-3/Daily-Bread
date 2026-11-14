const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {guidance}=require('../assets/news.js');
const root=path.join(__dirname,'..');
const make=(title,section='UK')=>({title,section,publisher:'Editorial test source',date:'Fri, 13 Nov 2026 12:00:00 GMT',url:'https://example.org/story/'+encodeURIComponent(title)});
function process(items){
 const run=cp.spawnSync('node',[path.join(__dirname,'process_news.js')],{input:JSON.stringify({updated:'2026-11-14T00:00:00Z',items}),encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 return JSON.parse(run.stdout);
}
const known=make('Bomb hoaxes across Europe disrupt flights as two UK airports receive threats');
const unknown=make('Unexpected discovery in ocean microbiology changes research methods');
const data=process([known,unknown]);
assert.equal(data.coverage.total,2);
assert.equal(data.coverage.published,1);
assert.equal(data.coverage.pending,1);
assert.equal(data.items[0].reflectionStatus,'topic-guidance');
assert.equal(data.pendingStories[0].reflectionStatus,'needs-editorial-review');
assert.equal(data.items[0].title,known.title);
assert.equal(data.pendingStories[0].title,unknown.title);
assert.equal(guidance(data.items[0],'action').kind,'headline');
assert.equal(guidance(data.pendingStories[0],'action').kind,'questions');
const real=JSON.parse(fs.readFileSync(path.join(root,'content/news.json'),'utf8'));
if(real.coverage){
 assert.equal(real.items.length,real.coverage.published);
 assert.equal(real.pendingStories.length,real.coverage.pending);
 assert.equal(real.coverage.total,real.coverage.published+real.coverage.pending);
 assert(real.items.every(story=>guidance(story,'action').kind!=='questions'), 'Unanalysed story was published as a reflection');
 assert(real.pendingStories.every(story=>guidance(story,'action').kind==='questions'), 'Match incorrectly queued');
 assert(real.items.every(story=>['reviewed','topic-guidance'].includes(story.reflectionStatus)));
}
console.log('News publication gate passed: no unsupported reflections published; unmatched headlines retained for editorial review.');
