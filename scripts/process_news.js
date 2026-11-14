/* Gate publication on actual Scripture commentary coverage.
   Unmatched headlines are retained for editorial review, not offered as
   imaginary or unfinished biblical interpretations on the public site. */
const fs=require('node:fs');
const path=require('node:path');
const {groupStories,guidance}=require('../assets/news.js');
const editorial=JSON.parse(fs.readFileSync(path.join(__dirname,'../content/editorial.json'),'utf8'));
let input='';
process.stdin.setEncoding('utf8');
process.stdin.on('data',chunk=>{input+=chunk;});
process.stdin.on('end',()=>{
  const data=JSON.parse(input);
  const grouped=groupStories(Array.isArray(data.items)?data.items:[]);
  const published=[],pending=[];
  for(const story of grouped){
    const result=guidance(story,'action',editorial.reviewedStories||[]);
    if(result && result.kind!=='questions' && result.ref && result.body && result.steps?.length && result.prayer){
      // Topic profiles are useful initial coverage, but are not a substitute for
      // independently reviewing an individual event and its source reporting.
      published.push({...story,reflectionStatus:result.kind==='editorial'?'reviewed':'topic-guidance'});
    }else{
      pending.push({...story,reflectionStatus:'needs-editorial-review'});
    }
  }
  if(!published.length)throw new Error('No stories have an applicable Scripture reflection; keep the previous published feed');
  process.stdout.write(JSON.stringify({
    updated:data.updated,items:published,pendingStories:pending,
    coverage:{total:grouped.length,published:published.length,pending:pending.length,
      individuallyReviewed:published.filter(x=>x.reflectionStatus==='reviewed').length,
      topicGuidance:published.filter(x=>x.reflectionStatus==='topic-guidance').length}
  },null,2)+'\n');
});
