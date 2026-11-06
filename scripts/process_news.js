/* The refresh pipeline and browser use the very same grouping rules. */
const {groupStories} = require('../assets/news.js');
let input='';
process.stdin.setEncoding('utf8');
process.stdin.on('data',chunk=>{input+=chunk;});
process.stdin.on('end',()=>{
  const data=JSON.parse(input);
  const items=groupStories(data.items);
  process.stdout.write(JSON.stringify({...data,items},null,2)+'\n');
});
