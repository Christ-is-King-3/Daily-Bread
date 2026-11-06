/* Bible lookup and locally curated Scripture themes. No AI API or remote search. */
(function () {
  'use strict';
  function canonicalBook(s) {
    return s.trim().toLowerCase().replace(/^psalm(?=\s|$)/, 'psalms').replace(/\s+/g, ' ');
  }
  function matchesScripture(verse, query) {
    const q = String(query || '').trim().toLowerCase();
    const ref = String(verse.ref || '').toLowerCase().match(/^(.+?)\s+(\d+):(\d+)$/);
    const range = q.match(/^(.+?)\s+(\d+):(\d+)(?:[–—-](\d+))?$/);
    if (range) return !!ref && canonicalBook(ref[1]) === canonicalBook(range[1])
      && Number(ref[2]) === Number(range[2]) && Number(ref[3]) >= Number(range[3])
      && Number(ref[3]) <= Number(range[4] || range[3]);
    const chapter = q.match(/^(.+?)\s+(\d+)$/);
    if (chapter) return !!ref && canonicalBook(ref[1]) === canonicalBook(chapter[1])
      && Number(ref[2]) === Number(chapter[2]);
    return !q || (verse.ref + ' ' + verse.text).toLowerCase().includes(q);
  }

  // References are hand-selected, not inferred from the visitor's private circumstances.
  // These passages offer biblical starting points, not an exhaustive interpretation.
  const TOPICS = [
    {id:'anxiety',label:'Anxiety, worry & peace',pattern:/\b(anxious|anxiety|worried|worry|worries|afraid|frightened|fearful|fear|panic|panicking|nervous|stressed|stress|overwhelmed|restless|uneasy)\b|can.t sleep|cannot sleep|trouble sleeping/i,refs:['Philippians 4:6–7','Matthew 6:25–34','1 Peter 5:7','Isaiah 41:10','John 14:27','Psalms 46:1']},
    {id:'courage',label:'Courage & confidence',pattern:/\b(courage|brave|bravery|bold|boldness|confidence|confident|stand firm|afraid to|scared to)\b/i,refs:['Joshua 1:9','2 Timothy 1:7','1 Corinthians 16:13','Psalms 27:1','Romans 8:31','Ephesians 6:10']},
    {id:'strength',label:'Strength & perseverance',pattern:/\b(strength|strong|weary|exhausted|tired|weak|weakness|perseverance|endurance|keep going|give up|struggling|struggle)\b/i,refs:['Isaiah 40:29–31','Philippians 4:13','2 Corinthians 12:9','Psalms 28:7','Galatians 6:9','Nehemiah 8:10']},
    {id:'grief',label:'Grief, death & mourning',pattern:/\b(grief|grieving|grieve|mourning|mourn|bereave|bereaved|funeral|died|death|dying|loss|lost someone|miss my|passed away|passing away)\b/i,refs:['Matthew 5:4','John 11:25–26','Psalms 34:18','Revelation 21:4','1 Thessalonians 4:13–14','Romans 8:18']},
    {id:'faith',label:'Faith & trusting God',pattern:/\b(faith|believe|belief|believing|doubt|doubting|doubts|trust god|trusting god|spiritual doubt|unbelief)\b/i,refs:['Hebrews 11:1','Romans 10:17','Mark 9:24','Proverbs 3:5–6','James 1:5–6','2 Corinthians 5:7']},
    {id:'prayer',label:'Learning to pray',pattern:/\b(pray|prayer|praying|talk to god|how to ask god|ask god)\b/i,refs:['Matthew 6:9–13','Philippians 4:6','1 Thessalonians 5:17','James 5:16','Romans 8:26','John 15:7']},
    {id:'forgiveness',label:'Forgiveness & reconciliation',pattern:/\b(forgive|forgiveness|forgiving|resentment|bitter|bitterness|grudge|reconcile|reconciliation)\b/i,refs:['Ephesians 4:31–32','Matthew 6:14–15','Colossians 3:13','Romans 12:18–21','Luke 6:37']},
    {id:'temptation',label:'Temptation & self-control',pattern:/\b(temptation|tempted|tempt|addiction|habit|self.control|discipline|lust|sinful habit|resist sin)\b/i,refs:['1 Corinthians 10:13','James 4:7','Galatians 5:22–23','2 Timothy 1:7','Psalms 119:11','Romans 12:2']},
    {id:'guidance',label:'Wisdom & decisions',pattern:/\b(wisdom|decision|decide|choices|choice|direction|guidance|purpose|calling|future|what should i do|lost in life)\b/i,refs:['James 1:5','Proverbs 3:5–6','Psalms 119:105','Proverbs 16:9','Matthew 6:33','Romans 12:2']},
    {id:'loneliness',label:'Loneliness & belonging',pattern:/\b(lonely|loneliness|alone|isolated|isolation|abandoned|rejected|no friends|no one cares)\b/i,refs:['Psalms 27:10','Hebrews 13:5','Matthew 28:20','Psalms 68:6','John 14:18','Romans 8:38–39']},
    {id:'hope',label:'Hope in hardship',pattern:/\b(hope|hopeless|despair|desperate|discouraged|discouragement|sad|sadness|depressed|depression|suffering|hardship)\b/i,refs:['Romans 15:13','Romans 8:18','Lamentations 3:22–23','Psalms 42:11','2 Corinthians 4:16–18','John 16:33']},
    {id:'family',label:'Family, marriage & love',pattern:/\b(family|marriage|husband|wife|children|parent|parents|fatherhood|motherhood|relationship|love someone)\b/i,refs:['Ephesians 5:25','1 Corinthians 13:4–7','Colossians 3:12–14','Joshua 24:15','Ephesians 6:1–4','Ecclesiastes 4:9–12']},
    {id:'provision',label:'Work, money & provision',pattern:/\b(money|financial|finances|debt|rent|work|job|unemployed|poverty|provision|provide|bills|employment)\b/i,refs:['Matthew 6:31–33','Colossians 3:23','Proverbs 21:5','Philippians 4:19','1 Timothy 5:8','2 Thessalonians 3:10']},
    {id:'healing',label:'Illness, healing & comfort',pattern:/\b(sick|illness|unwell|health|hospital|heal|healing|pain|diagnosis|disease|recovery)\b/i,refs:['James 5:14–15','Psalms 147:3','2 Corinthians 12:9','Matthew 11:28','Psalms 23:4']},
    {id:'gratitude',label:'Gratitude & thanksgiving',pattern:/\b(gratitude|grateful|thankful|thanksgiving|give thanks|thank god|blessings|appreciation)\b/i,refs:['1 Thessalonians 5:18','Psalms 100:4','James 1:17','Colossians 3:17','Psalms 107:1']},
    {id:'repentance',label:'Repentance & returning to God',pattern:/\b(repent|repentance|guilt|guilty|ashamed|shame|sin|sinned|turn back to god|return to god)\b/i,refs:['1 John 1:9','Acts 3:19','Psalms 51:10','Luke 15:20–24','Romans 3:23–24']},
    {id:'justice',label:'Justice, truth & responsibility',pattern:/\b(justice|truth|responsibility|accountability|integrity|honesty|righteousness|stand for what is right|doing right)\b/i,refs:['Micah 6:8','Proverbs 31:8–9','Psalms 82:3–4','James 1:22','Ephesians 6:14']}
  ];
  function findTopics(query) {
    const q = String(query || '').trim();
    return q ? TOPICS.filter(t => t.pattern.test(q)) : [];
  }
  function looksLikeReference(q) {
    return /^(.+?)\s+\d+(?::\d+(?:[–—-]\d+)?)?$/.test(q.trim());
  }
  function searchScripture(verses, query, {favourites = null} = {}) {
    const q = String(query || '').trim();
    const pool = Array.isArray(favourites) ? verses.filter(v => favourites.includes(v.ref)) : verses;
    if (!q) return {items:pool,topics:[],mode:'all'};
    if (looksLikeReference(q)) return {items:pool.filter(v => matchesScripture(v,q)),topics:[],mode:'reference'};
    const topics=findTopics(q);
    if (!topics.length) return {items:pool.filter(v => matchesScripture(v,q)),topics:[],mode:'text'};
    const found=[],used=new Set();
    const add=v=>{if(v && !used.has(v.ref)){found.push(v);used.add(v.ref);}};
    for (const topic of topics) for (const ref of topic.refs)
      for (const verse of pool) if (matchesScripture(verse,ref)) add(verse);
    for (const verse of pool) if (matchesScripture(verse,q)) add(verse);
    return {items:found,topics:topics.map(t=>t.label),mode:'topic'};
  }
  const api = {matchesScripture,findTopics,searchScripture,TOPICS};
  if (typeof module !== 'undefined' && module.exports) module.exports = Object.assign(matchesScripture,api);
  else { window.matchesScripture=matchesScripture; window.DailyBreadScripture=api; }
})();
