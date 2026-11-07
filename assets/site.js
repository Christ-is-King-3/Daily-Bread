const placeholders={};

const $=id=>document.getElementById(id)||placeholders[id]||(placeholders[id]=document.createElement('div')), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const starter=[['Psalm 23:1','The LORD is my shepherd; I shall not want.','Trust God with the needs and uncertainties of today.'],['Romans 12:21','Be not overcome of evil, but overcome evil with good.','Choose goodness even when evil seems overwhelming.'],['Micah 6:8','He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?','Justice and mercy belong together.'],['Matthew 5:9','Blessed are the peacemakers: for they shall be called the children of God.','Seek reconciliation without abandoning truth.'],['Isaiah 41:10','Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.','God offers strength in fear.'],['Psalm 46:1','God is our refuge and strength, a very present help in trouble.','Turn to God in hardship.'],['Proverbs 3:5','Trust in the LORD with all thine heart; and lean not unto thine own understanding.','Let wisdom begin in trust.'],['John 14:27','Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.','Christ offers peace amid uncertainty.'],['Romans 8:18','For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in us.','Hope reaches beyond present suffering.'],['Matthew 5:4','Blessed are they that mourn: for they shall be comforted.','God sees those who grieve.'],['James 1:19','Wherefore, my beloved brethren, let every man be swift to hear, slow to speak, slow to wrath:','Listen carefully before responding.'],['Galatians 6:9','And let us not be weary in well doing: for in due season we shall reap, if we faint not.','Persevere in doing good.']].map(([ref,text,reflection])=>({ref,text,reflection}));
let verses=starter, daily=null, saved=JSON.parse(localStorage.getItem('db-favorites')||'[]'),showSaved=false,limit=12,news=[],reviewedStories=[],selectedStory=null,selectedPath=null,churchFilter='all';
let today=new Date();
const ukDate=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Europe/London'});
let currentDate=ukDate(), dayNo=Math.floor(Date.parse(currentDate+'T00:00:00Z')/86400000);
function refreshDay(){if(ukDate()!==currentDate){currentDate=ukDate();today=new Date();dayNo=Math.floor(Date.parse(currentDate+'T00:00:00Z')/86400000);setDaily()}}
setInterval(refreshDay,15000);addEventListener('focus',refreshDay);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay()});
function dailyIndex(n){ // permutation through all verses, no repetition until the full cycle completes
 const N=verses.length;let step=104729%N||1;function gcd(a,b){while(b)[a,b]=[b,a%b];return a};while(gcd(step,N)!==1)step++;return ((n*step)%N+N)%N;
}
const esvUrl=r=>'https://www.esv.org/'+encodeURIComponent(r.replace(/\s+/g,'+'));
function notice(s){$('toast').textContent=s;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',2300)}
function setDaily(){daily=verses[dailyIndex(dayNo)];$('today-date').textContent=today.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/London'});$('verse-text').textContent='“'+daily.text+'”';$('verse-ref').textContent=daily.ref+' · King James Version';$('verse-thought').textContent=daily.reflection||'What does the Lord teach here? Consider His commands, His promises and what obedience to Christ requires of you today.';$('esv').href=esvUrl(daily.ref);$('translation-note').textContent=verses.length>1000?'Selected from the complete public-domain KJV. Updates at midnight UK time.':'Starter selection active. The full Bible will be downloaded by the GitHub Actions setup.';$('save').textContent=saved.includes(daily.ref)?'♥ Saved':'♡ Save verse'}
$('save').onclick=()=>toggle(daily.ref);$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(daily.text+' — '+daily.ref+' (KJV)');notice('Verse copied')}catch(e){notice('Copy is unavailable in this browser')}};
function toggle(ref){saved=saved.includes(ref)?saved.filter(x=>x!==ref):[...saved,ref];localStorage.setItem('db-favorites',JSON.stringify(saved));setDaily();renderLibrary();notice(saved.includes(ref)?'Saved to favourites':'Removed from favourites')}
function syncTheme(){const dark=document.body.classList.contains('dark');$('theme').setAttribute('aria-pressed',String(dark));$('theme').textContent=dark?'☀ Light':'☾ Dark'}
$('theme').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('db-dark',document.body.classList.contains('dark')?'1':'0');syncTheme()};if(localStorage.getItem('db-dark')==='1')document.body.classList.add('dark');syncTheme();
const paths={peace:{title:'A Path of Comfort & Peace',ref:'Matthew 5:4',quote:'Blessed are they that mourn: for they shall be comforted.',body:'Jesus Christ does not abandon His people in suffering. Trust His promises, bear one another’s burdens and meet the needs of your neighbour. Christian compassion is not weakness; it is obedience to our Lord.',steps:['Pray specifically for those harmed and for those entrusted with their care.','Act as a faithful neighbour: listen, help and offer practical Christian service.','Hold fast to truth while refusing hatred or rumours about the innocent.'],prayer:'Lord Jesus Christ, strengthen those who suffer, comfort the grieving and teach us to serve You faithfully. Amen.'},action:{title:'A Call to Truth & Action',ref:'Micah 6:8',quote:'...to do justly, and to love mercy, and to walk humbly with thy God?',body:'As Christians, we are called to stand firmly in God’s truth, defend what is right, care for our neighbours and take responsibility for our actions. Compassion must never require us to abandon biblical conviction. Seek evidence, speak plainly and act with courage and self-control.',steps:['Know the facts and test the claims before forming a judgement.','Ask what righteousness, duty, fair treatment and personal responsibility require.','Stand up for the vulnerable and pursue practical, lawful ways to correct wrongdoing.'],prayer:'Almighty God, strengthen our resolve to do what is right, speak the truth and show mercy as faithful servants of Jesus Christ. Amen.'}};
function showPath(p){
 selectedPath=p;
 ['peace','action'].forEach(x=>$(x).classList.toggle('active',x===p));
 const response=selectedStory?DailyBreadNews.guidance(selectedStory,p,reviewedStories):null;
 const general=paths[p];
 const v=response||{...general,question:'What does Scripture command of us, and how can we respond faithfully in truth and love?'};
 const passage=verses.filter(verse=>matchesScripture(verse,v.ref));
 const quote=passage.length?passage.map(verse=>verse.text).join(' '):(response?'':general.quote);
 $('guidance').classList.remove('hidden');
 $('guidance').innerHTML='<div class="eyebrow">'+esc(general.title)+'</div><h3>'+esc(selectedStory?DailyBreadNews.cleanTitle(selectedStory):'General Christian guidance')+'</h3>'+(selectedStory?'<p class="meta">Based on the linked headline · <a href="'+esc(selectedStory.url)+'" target="_blank" rel="noopener">Read the original report ↗</a></p>':'')+'<p><strong>'+esc(v.question)+'</strong></p>'+(quote?'<blockquote>'+esc(quote)+'</blockquote>':'')+'<p class="meta"><a href="scripture.html?scripture='+encodeURIComponent(v.ref)+'#library">'+esc(v.ref)+' · KJV ↗</a></p><p>'+esc(v.body)+'</p><h4>Ways to respond to '+esc(selectedStory?'this report':'today’s world')+'</h4><ul>'+v.steps.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ul><p><em>'+esc(v.prayer)+'</em></p>'+'<p class="small"><a class="step-link" href="'+(selectedStory&&selectedStory.section==='Christian world'?'#church-news':'#latest-headlines')+'">← Return to '+(selectedStory&&selectedStory.section==='Christian world'?'Church reports':'the headlines')+'</a></p>'+(selectedStory?'<p class="meta">A Christian response to the issue reported in this headline. The full article has not been independently analysed or verified by Daily Bread.</p>':'');
 $('guidance').focus({preventScroll:true});
 $('guidance').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}
$('peace').onclick=()=>showPath('peace');$('action').onclick=()=>showPath('action');
function sourceDate(n){const date=new Date(n.date);return Number.isNaN(date.getTime())?'':date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
function storyCard(n,i){
 const others=(n.sources||[]).slice(1);
 return '<article class="newsitem" data-story-card="'+i+'"><span class="meta">'+esc(n.section)+' · '+esc(sourceDate(n))+'</span><h3><a target="_blank" rel="noopener noreferrer" href="'+esc(n.url)+'">'+esc(n.title)+' ↗</a></h3><p class="meta">Reporting: '+esc(n.publisher)+'</p>'+(others.length?'<details><summary class="small">'+others.length+' more source'+(others.length===1?'':'s')+' on this story</summary><ul>'+others.map(source=>'<li class="small"><a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.publisher)+' · '+esc(source.title)+'</a></li>').join('')+'</ul></details>':'')+'<button class="btn outline small" data-story="'+i+'">Read the Christian reflection</button></article>';
}
function attachStoryButtons(){document.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>{
 selectedStory=news[Number(b.dataset.story)];
 $('selected-story').innerHTML='<strong>Selected:</strong> '+esc(selectedStory.title)+'<br><span class="meta">'+esc(selectedStory.publisher)+' · '+esc(sourceDate(selectedStory))+'</span>';
 document.querySelectorAll('[data-story-card]').forEach(card=>card.classList.toggle('selected',card.dataset.storyCard===b.dataset.story));
 showPath(selectedPath||'action');
})}
function renderNews(){
 const normal=news.filter(n=>n.section!=='Christian world');
 $('headlines').innerHTML=normal.length?normal.map(n=>storyCard(n,news.indexOf(n))).join(''):'<div class="notice">No current headlines are available. Please check back later; the feed may be temporarily unavailable.</div>';
 const c=news.filter(n=>n.section==='Christian world'&&(churchFilter==='all'||n.editorialCategory===churchFilter));
 $('church-news').innerHTML=c.length?c.map(n=>storyCard(n,news.indexOf(n))).join(''):'<div class="notice">No matching reports are available. The Hope and Hardship filters show only editor-reviewed classifications.</div>';
 attachStoryButtons();
}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{churchFilter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('selected',x===b));renderNews()});
function renderLibrary(){
 if(!document.getElementById('library'))return;
 const q=$('search').value.trim();
 const search=DailyBreadScripture.searchScripture(verses,q,{favourites:showSaved?saved:null});
 const list=search.items;
 $('search-help').textContent=search.mode==='topic'?'Suggested Scripture for: '+search.topics.join(', ')+'. Begin with these passages and read them in their wider biblical context. These are editorial suggestions, not a diagnosis.':search.mode==='reference'?'Showing the passage you requested. References from the Christian Art collection open here.':search.mode==='text'?'Searching exact words in the King James Version. Try a feeling or prayer need for themed suggestions.':'Type how you feel or what you need, or choose a topic above. You can also search the full KJV by text or reference.';
 $('library-count').textContent=list.length.toLocaleString('en-GB')+(search.mode==='topic'?' suggested or matching verses':' verses found');
 $('results').innerHTML=list.slice(0,limit).map(v=>'<div class="newsitem"><div class="meta">'+esc(v.ref)+' · KJV</div><p>'+esc(v.text)+'</p><button class="btn outline" data-save="'+esc(v.ref)+'">'+(saved.includes(v.ref)?'♥ Saved':'♡ Save')+'</button><a class="btn outline" href="'+esvUrl(v.ref)+'" target="_blank" rel="noopener">Read ESV ↗</a></div>').join('')||'<div class="notice">No verses found. Try another word, a feeling such as “anxiety”, or a Scripture reference.</div>';
 $('more').classList.toggle('hidden',limit>=list.length);
 document.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>toggle(b.dataset.save));
}
$('search').oninput=()=>{limit=12;renderLibrary()};document.querySelectorAll('[data-topic-query]').forEach(b=>b.onclick=()=>{$('search').value=b.dataset.topicQuery;showSaved=false;$('allverses').classList.add('selected');$('favorites').classList.remove('selected');limit=12;renderLibrary();$('results').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})});$('allverses').onclick=()=>{showSaved=false;$('allverses').classList.add('selected');$('favorites').classList.remove('selected');renderLibrary()};$('favorites').onclick=()=>{showSaved=true;$('favorites').classList.add('selected');$('allverses').classList.remove('selected');renderLibrary()};$('more').onclick=()=>{limit+=24;renderLibrary()};
async function loadJson(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(r.status);return r.json()}
// Keep incoming section links aligned after asynchronous content changes the page height.
const arrivalHash=location.hash;
let visitorInteracted=false,arrivalObserver=null;
for(const event of ['pointerdown','keydown','wheel','touchstart'])addEventListener(event,()=>{visitorInteracted=true;arrivalObserver?.disconnect()},{once:true,passive:true});
async function init(){try{const books=await loadJson('content/bible.json');const full=[];for(const b of books)for(let c=0;c<b.chapters.length;c++)for(let v=0;v<b.chapters[c].length;v++)if(b.chapters[c][v])full.push({ref:b.name+' '+(c+1)+':'+(v+1),text:b.chapters[c][v]});if(full.length>30000)verses=full}catch(e){}setDaily();const requestedScripture=new URLSearchParams(location.search).get('scripture');if(requestedScripture)$('search').value=requestedScripture;renderLibrary();try{const data=await loadJson('content/news.json');news=DailyBreadNews.groupStories(Array.isArray(data.items)?data.items:[]);try{const editorial=await loadJson('content/editorial.json');const reviewed=Array.isArray(editorial.reviewedStories)?editorial.reviewedStories:[];reviewedStories=reviewed;const byUrl=new Map(reviewed.filter(x=>x.url&&['hope','hardship'].includes(x.editorialCategory)).map(x=>[x.url,x.editorialCategory]));news=news.map(n=>({...n,editorialCategory:(n.sources||[n]).map(source=>byUrl.get(source.url)).find(Boolean)||undefined}));}catch(e){}$('news-updated').textContent=data.updated?news.length+' distinct stories · '+news.reduce((total,n)=>total+n.sources.length,0)+' source reports · Collected: '+new Date(data.updated).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}):'Live feed not yet initialised.'}catch(e){}renderNews();try{const posts=await loadJson('content/posts.json');$('posts').innerHTML=posts.map((p,i)=>'<article class="card article"><div class="eyebrow">'+esc(p.role||'Guest reflection')+'</div><h3>'+esc(p.title)+'</h3><div class="meta">'+esc(p.author)+' · '+esc(p.date)+' · '+esc(p.category)+'</div><p>'+esc(p.excerpt||'')+'</p><button class="btn outline" data-post="'+i+'">Read article ↗</button><div class="hidden" id="post-'+i+'">'+(p.body||[]).map(t=>'<p>'+esc(t)+'</p>').join('')+(p.scripture?'<p><a href="'+esvUrl(p.scripture)+'" target="_blank" rel="noopener">Read '+esc(p.scripture)+' in the ESV ↗</a></p>':'')+'</div></article>').join('');document.querySelectorAll('[data-post]').forEach(b=>b.onclick=()=>{const el=$('post-'+b.dataset.post);el.classList.toggle('hidden');b.textContent=el.classList.contains('hidden')?'Read article ↗':'Close article ↑'})}catch(e){$('posts').innerHTML='<p class="notice">Articles will appear here when published.</p>'}}
init().then(()=>{
 document.body.dataset.ready='true';
 if(arrivalHash&&location.hash===arrivalHash&&!visitorInteracted){
  const target=document.getElementById(arrivalHash.slice(1));
  if(target){
   const align=()=>requestAnimationFrame(()=>{
    if(!visitorInteracted&&location.hash===arrivalHash)target.scrollIntoView({behavior:'instant',block:'start'});
    else arrivalObserver?.disconnect();
   });
   // Initial images and fragment restoration can settle after the JSON requests.
   // Follow layout changes only until the visitor takes control.
   arrivalObserver=new ResizeObserver(align);
   arrivalObserver.observe(document.querySelector('main'));
   if(document.readyState!=='complete')addEventListener('load',align,{once:true});
   const followScroll=()=>{
    if(visitorInteracted||location.hash!==arrivalHash){removeEventListener('scroll',followScroll);return}
    align();
   };
   addEventListener('scroll',followScroll,{passive:true});
   align();
  }
 }
});
