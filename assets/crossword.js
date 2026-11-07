/* Biblical clues are original editorial text. Answers are never put in DOM labels. */
(function(root){
'use strict';
const bank=[
 ['NOAH','Who built the ark before the flood?','Builder who found grace before the flood','A righteous man preserved through judgement'],
 ['RUTH','Which Moabite stayed with Naomi?','Moabite who gleaned in Boaz’s field','Widow whose loyalty placed her in David’s ancestry'],
 ['MARY','Who was the mother of Jesus?','Who treasured the shepherds’ words in her heart?','She pondered in her heart what was spoken about her son'],
 ['PAUL','Which apostle was once called Saul?','Apostle who wrote to the Philippians from imprisonment','Tentmaker who appealed to Caesar'],
 ['JONAH','Which prophet was swallowed by a great fish?','Prophet sent to Nineveh after fleeing towards Tarshish','He grieved over a plant while God showed mercy to a city'],
 ['DAVID','Who defeated Goliath?','Shepherd anointed by Samuel after his older brothers passed by','King who would not offer God that which cost him nothing'],
 ['MOSES','Who led Israel out of Egypt?','Leader whose face shone after speaking with the Lord','He asked to see God’s glory and was sheltered in a cleft'],
 ['JESUS','Who is our risen Lord and Saviour?','Who declared Himself the resurrection and the life?','He opened the Scriptures to two travellers on the Emmaus road'],
 ['PETER','Which disciple denied Jesus three times?','Disciple restored with the charge to feed Christ’s sheep','A rooftop vision prepared him to visit Cornelius'],
 ['SARAH','Who was Abraham’s wife and Isaac’s mother?','Who laughed at the promise of a son in her old age?','She judged the One who promised faithful, despite her age'],
 ['ESTHER','Which queen helped save her Jewish people?','Queen urged to consider whether she had come for such a time','She approached the inner court uninvited after a three-day fast'],
 ['DANIEL','Who was protected in the lions’ den?','Exile who continued praying despite a royal prohibition','Interpreter of the writing that announced Belshazzar’s downfall'],
 ['SAMUEL','Which boy heard God call him at night?','Prophet who anointed both Saul and David','He raised Ebenezer, declaring that the Lord had helped them'],
 ['JOSEPH','Which son of Jacob received a special coat?','Dream interpreter who stored grain before famine','He said that what his brothers meant for evil, God meant for good'],
 ['ABRAHAM','Whom did God call to leave his country for a promised land?','Patriarch who interceded for Sodom','He looked for a city whose builder and maker is God'],
 ['BETHLEHEM','In which town was Jesus born?','Town of David where the Magi found the child','Micah named this small place as the origin of Israel’s ruler'],
 ['GALILEE','Which region contains Nazareth?','Region of the lake where Jesus called fishermen','Territory associated by Isaiah with a people seeing a great light'],
 ['JERUSALEM','In which city was the temple?','City where the disciples awaited power from on high','City over which Jesus wept because it did not know its visitation'],
 ['COVENANT','What word describes God’s solemn agreement with His people?','The rainbow was a sign of this with Noah','Jeremiah promised a new one written on hearts'],
 ['TABERNACLE','What was Israel’s portable sanctuary called?','Wilderness dwelling made according to the pattern shown to Moses','Bezalel’s Spirit-given craftsmanship helped prepare this dwelling'],
 ['MELCHIZEDEK','Which priest and king blessed Abraham?','King of Salem who brought bread and wine to Abram','Priest whose order is invoked in Psalm 110'],
 ['GETHSEMANE','In which garden did Jesus pray before His arrest?','Place where the disciples slept while Jesus prayed in anguish','Here the Son prayed that the Father’s will be done concerning the cup'],
 ['RECONCILIATION','What word means restoring a broken relationship?','Paul describes believers as entrusted with this ministry','In 2 Corinthians 5, this ministry follows God bringing us to Himself through Christ'],
 ['RESURRECTION','What do Christians call Jesus rising from the dead?','Without this, Paul says our preaching and faith are vain','The firstfruits imagery of 1 Corinthians 15 concerns this triumph'],
 ['PENTECOST','At which feast did the Holy Spirit come upon the disciples?','Feast when hearers from many nations understood the apostles','Acts 2 locates the sound of a mighty rushing wind at this feast'],
 ['NEHEMIAH','Who led the rebuilding of Jerusalem’s walls?','Cupbearer who sought permission to rebuild Jerusalem','He refused an invitation to Ono, saying he was doing a great work'],
 ['HABAKKUK','Which prophet says the just shall live by faith?','Prophet who resolved to rejoice though the fig tree did not blossom','He stood upon his watch to await an answer to his complaint'],
 ['ZACCHAEUS','Which tax collector climbed a tree to see Jesus?','Chief tax collector who promised fourfold restitution','Salvation came to this man’s house after an encounter beneath a sycamore'],
 ['NICODEMUS','Who came to Jesus by night?','Pharisee taught about being born again','He brought myrrh and aloes for Jesus’ burial'],
 ['BEZALEL','Who was filled with God’s Spirit to craft the tabernacle?','Craftsman of Judah commissioned alongside Aholiab','Son of Uri, grandson of Hur, gifted for the sanctuary’s workmanship']
];
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function makePuzzle(date,level){
 const tier=['easy','medium','hard'].indexOf(level);if(tier<0)throw Error('Unknown difficulty');
 const count=[5,8,12][tier], size=[11,15,21][tier];
 let seed=Array.from(date).reduce((a,c)=>Math.imul(a,31)+c.charCodeAt(0),0)+tier;
 for(let attempt=0;attempt<200;attempt++){
  const rand=random(seed+attempt), grid=Array.from({length:size},()=>Array(size).fill(null)), entries=[];
  const pool=bank.filter(b=>tier===0?b[0].length<=6:tier===1?b[0].length<=10:true).map(b=>({b,k:rand()})).sort((a,b)=>a.k-b.k).map(x=>x.b);
  function fits(word,r,c,dir){let crosses=0;const dr=dir==='down'?1:0,dc=1-dr;
   if(r<0||c<0||r+dr*(word.length-1)>=size||c+dc*(word.length-1)>=size)return false;
   if(grid[r-dr]?.[c-dc]||grid[r+dr*word.length]?.[c+dc*word.length])return false;
   for(let i=0;i<word.length;i++){const y=r+dr*i,x=c+dc*i,cell=grid[y][x];if(cell){if(cell.letter!==word[i]||cell.dirs.includes(dir))return false;crosses++}else if(grid[y-dc]?.[x-dr]||grid[y+dc]?.[x+dr])return false;}
   return entries.length===0||crosses>0;
  }
  for(const b of pool){const word=b[0], choices=[];
   if(!entries.length)choices.push([Math.floor(size/2),Math.floor((size-word.length)/2),'across']);
   else for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(grid[r][c])for(let i=0;i<word.length;i++)if(word[i]===grid[r][c].letter)for(const dir of ['across','down'])choices.push([r-(dir==='down'?i:0),c-(dir==='across'?i:0),dir]);
   const choice=choices.filter(x=>fits(word,...x)).map(x=>({x,k:rand()})).sort((a,b)=>a.k-b.k)[0];if(!choice)continue;
   const [r,c,dir]=choice.x;for(let i=0;i<word.length;i++){const y=r+(dir==='down'?i:0),x=c+(dir==='across'?i:0);if(!grid[y][x])grid[y][x]={letter:word[i],dirs:[]};grid[y][x].dirs.push(dir)}
   entries.push({answer:word,clue:b[tier+1],r,c,dir});if(entries.length===count)break;
  }
  if(entries.length!==count)continue;
  const starts=[...new Set(entries.map(e=>e.r*size+e.c))].sort((a,b)=>a-b);entries.forEach(e=>e.number=starts.indexOf(e.r*size+e.c)+1);
  return {date,level,size,grid,entries};
 }
 throw Error('Unable to construct crossword');
}
if(typeof module!=='undefined')module.exports={makePuzzle,bank};
if(typeof document==='undefined')return;
const host=document.getElementById('crossword');if(!host)return;
const ukDate=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Europe/London'});
const archiveStart='2026-11-07';
function isArchiveDate(value,today){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||'')||value<archiveStart||value>today)return false;
 const parsed=new Date(value+'T12:00:00Z');
 return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
}
let date=ukDate(), latestDate=date;
const requestedDate=new URLSearchParams(location.search).get('puzzle');
if(isArchiveDate(requestedDate,latestDate))date=requestedDate;
let level='easy',puzzle,inputs,active,progress,storageKey;
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(progress))}catch{}}
function cells(entry){return Array.from({length:entry.answer.length},(_,i)=>[entry.r+(entry.dir==='down'?i:0),entry.c+(entry.dir==='across'?i:0)].join(','))}
function select(entry,focus=true){active=entry;host.querySelectorAll('.cw-cell').forEach(el=>el.classList.remove('active'));cells(entry).forEach(k=>inputs[k].parentElement.classList.add('active'));host.querySelectorAll('[data-clue]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.clue)===puzzle.entries.indexOf(entry))));if(focus)inputs[cells(entry)[0]].focus();}
function draw(){
 puzzle=makePuzzle(date,level);storageKey='db-crossword-v1-'+date+'-'+level;progress=read(storageKey,{});inputs={};
 host.innerHTML='<p class="meta">'+date+(date===ukDate()?' · Daily puzzle':' · Archived puzzle')+' · UK calendar</p><div class="cw-archive"><label for="puzzle-date">Puzzle archive </label><input id="puzzle-date" type="date" min="'+archiveStart+'" max="'+ukDate()+'" value="'+date+'"><button class="btn outline" id="open-puzzle">Open date</button><button class="btn outline" id="today-puzzle">Return to today</button></div><label for="quiz-level"><strong>Difficulty</strong></label> <select id="quiz-level"><option value="easy">Easy · 5 answers · familiar Bible stories</option><option value="medium">Medium · 8 answers · closer reading</option><option value="hard">Hard · 12 answers · deeper biblical knowledge</option></select><p class="small">Choose a numbered clue, then type in the grid. Arrow keys move; Backspace erases; Enter switches direction at a crossing. Your progress is saved for each date and difficulty.</p><div class="cw-layout"><div class="cw-scroll" tabindex="0" aria-label="Crossword grid, scroll horizontally if needed"><div class="cw-grid" style="--size:'+puzzle.size+'"></div></div><div class="cw-clues"></div></div><div class="cw-actions"><button class="btn" id="check-puzzle">Check answers</button><button class="btn outline" id="clear-puzzle">Clear this puzzle</button></div><p id="quiz-status" role="status" aria-live="polite"></p><details class="cw-solutions"><summary>Solutions — open only when you wish to reveal an answer</summary><p>Revealing an answer will mark this attempt as assisted.</p><button class="btn outline" id="reveal-clue">Reveal selected answer</button><div id="reveal-confirm" hidden><p>Show the selected answer and fill its squares?</p><button class="btn" id="confirm-reveal">Yes, reveal this answer</button><button class="btn outline" id="cancel-reveal">Keep it hidden</button></div></details>';
 host.querySelector('#open-puzzle').onclick=()=>{const value=host.querySelector('#puzzle-date').value;if(!isArchiveDate(value,ukDate())){host.querySelector('#quiz-status').textContent='Choose a date from 7 November 2026 through today.';return}date=value;draw()};host.querySelector('#today-puzzle').onclick=()=>{date=ukDate();latestDate=date;draw()};
 host.querySelector('#quiz-level').value=level;host.querySelector('#quiz-level').onchange=e=>{level=e.target.value;draw()};
 const grid=host.querySelector('.cw-grid');
 for(let r=0;r<puzzle.size;r++)for(let c=0;c<puzzle.size;c++){
  const cell=document.createElement('div');cell.className='cw-cell';const data=puzzle.grid[r][c];if(data){const start=puzzle.entries.find(e=>e.r===r&&e.c===c);if(start){const n=document.createElement('span');n.textContent=start.number;cell.append(n)}const input=document.createElement('input');input.maxLength=1;input.autocomplete='off';input.spellcheck=false;input.setAttribute('autocapitalize','characters');input.setAttribute('aria-label','Row '+(r+1)+', column '+(c+1)+(start?', clue '+start.number:''));const key=r+','+c;input.value=typeof progress[key]==='string'?progress[key].replace(/[^A-Z]/g,'').slice(0,1):'';inputs[key]=input;cell.append(input);
   input.onfocus=()=>{if(!active||!cells(active).includes(key))select(puzzle.entries.find(e=>cells(e).includes(key)),false)};
   input.oninput=()=>{input.value=input.value.toUpperCase().replace(/[^A-Z]/g,'').slice(-1);progress[key]=input.value;persist();input.removeAttribute('aria-invalid');cell.classList.remove('wrong');host.querySelector('#quiz-status').textContent='';const keys=cells(active),i=keys.indexOf(key);if(input.value&&i<keys.length-1)inputs[keys[i+1]].focus()};
   input.onkeydown=e=>{const dirs={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};if(dirs[e.key]){e.preventDefault();const [dr,dc]=dirs[e.key];select(puzzle.entries.find(a=>a.dir===(dr?'down':'across')&&cells(a).includes(key))||active,false);let y=r+dr,x=c+dc;while(y>=0&&x>=0&&y<puzzle.size&&x<puzzle.size){if(inputs[y+','+x]){inputs[y+','+x].focus();break}y+=dr;x+=dc}}
    if(e.key==='Enter'){e.preventDefault();const options=puzzle.entries.filter(a=>cells(a).includes(key));select(options.find(a=>a!==active)||active,false)}
    if(e.key==='Backspace'&&!input.value){e.preventDefault();const keys=cells(active),i=keys.indexOf(key);if(i>0){const prev=keys[i-1];inputs[prev].value='';progress[prev]='';persist();inputs[prev].focus()}}
   };
  }else cell.classList.add('block');grid.append(cell);
 }
 const clues=host.querySelector('.cw-clues');for(const dir of ['across','down']){const heading=document.createElement('h3');heading.textContent=dir==='across'?'Across':'Down';clues.append(heading);puzzle.entries.map((e,i)=>({e,i})).filter(x=>x.e.dir===dir).sort((a,b)=>a.e.number-b.e.number).forEach(({e,i})=>{const b=document.createElement('button');b.type='button';b.dataset.clue=i;b.textContent=e.number+'. '+e.clue+' ('+e.answer.length+')';b.onclick=()=>select(e);clues.append(b)})}
 select(puzzle.entries[0],false);
 host.querySelector('#check-puzzle').onclick=()=>{let empty=0,wrong=0;for(const [key,input]of Object.entries(inputs)){const [r,c]=key.split(',').map(Number);const bad=!!input.value&&input.value!==puzzle.grid[r][c].letter;if(!input.value)empty++;if(bad)wrong++;input.parentElement.classList.toggle('wrong',bad);input.setAttribute('aria-invalid',String(bad))}host.querySelector('#quiz-status').textContent=empty||wrong?empty+' empty squares; '+wrong+' incorrect squares. Incorrect letters are marked. Keep going.':'Well done! You completed '+(date===ukDate()?'today’s ':'the '+date+' ')+level+' crossword.'+(progress.assisted?' (With revealed answers.)':'')};
 host.querySelector('#clear-puzzle').onclick=()=>{progress={};persist();draw();host.querySelector('#quiz-status').textContent='Puzzle cleared.'};
 let revealEntry;host.querySelector('#reveal-clue').onclick=()=>{revealEntry=active;host.querySelector('#reveal-confirm').hidden=false};host.querySelector('#cancel-reveal').onclick=()=>host.querySelector('#reveal-confirm').hidden=true;
 host.querySelector('#confirm-reveal').onclick=()=>{cells(revealEntry).forEach((key,i)=>{inputs[key].value=revealEntry.answer[i];progress[key]=revealEntry.answer[i]});progress.assisted=true;persist();host.querySelector('#reveal-confirm').hidden=true;host.querySelector('#quiz-status').textContent='Selected answer revealed. This attempt is assisted.'};
}
draw();
function refreshDay(){if(latestDate!==ukDate()){const wasToday=date===latestDate;latestDate=ukDate();if(wasToday)date=latestDate;draw()}}
setInterval(refreshDay,15000);addEventListener('focus',refreshDay);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay()});
})(typeof globalThis!=='undefined'?globalThis:this);
