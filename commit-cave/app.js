/* Commit Cave: 480x270 scene composed from the authored layer-far.png artwork. */
(()=>{
'use strict';
const W=480,H=270,$=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),DAY=86400000;
const lerp=(from,to,progress)=>from+(to-from)*progress;
const canvas=$('worldCanvas'),ctx=canvas&&canvas.getContext('2d',{alpha:false});if(!ctx)return;
canvas.width=W;canvas.height=H;ctx.imageSmoothingEnabled=false;
const C={void:'#060916'};
const state={total:0,repos:0,passed:0,failed:0,pending:0,checked:0,days:7,celebrate:0,boost:0};

function px(c,x,y,w,h,col){
 c.fillStyle=col;
 c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function poly(c,points,color){
 c.beginPath();
 c.moveTo(points[0][0],points[0][1]);
 points.slice(1).forEach(point=>c.lineTo(point[0],point[1]));
 c.closePath();
 c.fillStyle=color;
 c.fill();
}
function hash(x,y,s=0){
 const n=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;
 return n-Math.floor(n);
}

// Authored environment artwork: layer-far.png is the sole scene background.
// If it has not loaded successfully, render only the near-black safety background.
const pngAssets={far:null,hero:null};
const assetStatus={far:'loading',hero:'loading'};
const LPC_FRAME_SIZE=64;
const LPC_MIN_OPAQUE_PIXELS=150;
let heroRowVisibility=new Map();
let heroRowFrameCounts=new Map();
let heroFirstValidRow=-1;

function countVisiblePixels(image,minimum=1){
 const probeCanvas=document.createElement('canvas');
 probeCanvas.width=image.naturalWidth;
 probeCanvas.height=image.naturalHeight;
 const probe=probeCanvas.getContext('2d',{willReadFrequently:true});
 if(!probe)return false;
 try{
  probe.clearRect(0,0,probeCanvas.width,probeCanvas.height);
  probe.drawImage(image,0,0);
  const pixels=probe.getImageData(0,0,probeCanvas.width,probeCanvas.height).data;
  let count=0;
  for(let i=3;i<pixels.length;i+=4){
   if(pixels[i]>16&&++count>=minimum)return true;
  }
  return false;
 }catch(error){
  console.warn('[Commit Cave] Não foi possível validar a transparência do PNG.',error);
  return false;
 }
}

function inspectLpcRows(image){
 const visibility=new Map();
 const frameCounts=new Map();
 const totalRows=Math.floor(image.naturalHeight/LPC_FRAME_SIZE);
 const columns=Math.floor(image.naturalWidth/LPC_FRAME_SIZE);
 const probeCanvas=document.createElement('canvas');
 probeCanvas.width=image.naturalWidth;
 probeCanvas.height=image.naturalHeight;
 const probe=probeCanvas.getContext('2d',{willReadFrequently:true});
 if(!probe)return {visibility,frameCounts,firstValidRow:-1};

 try{
  probe.drawImage(image,0,0);
  const pixels=probe.getImageData(0,0,image.naturalWidth,image.naturalHeight).data;
  let firstValidRow=-1;
  for(let row=0;row<totalRows;row++){
   const counts=[];
   for(let col=0;col<columns;col++){
    let opaque=0;
    const startX=col*LPC_FRAME_SIZE;
    const startY=row*LPC_FRAME_SIZE;
    for(let y=0;y<LPC_FRAME_SIZE;y++){
     let index=((startY+y)*image.naturalWidth+startX)*4+3;
     for(let x=0;x<LPC_FRAME_SIZE;x++,index+=4){
      if(pixels[index]>128)opaque++;
     }
    }
    counts.push(opaque);
   }
   const rowValid=(counts[0]||0)>=LPC_MIN_OPAQUE_PIXELS;
   visibility.set(row,rowValid);
   let contiguous=0;
   for(const count of counts){
    if(count<LPC_MIN_OPAQUE_PIXELS)break;
    contiguous++;
   }
   frameCounts.set(row,contiguous);
   if(rowValid&&firstValidRow===-1)firstValidRow=row;
  }
  return {visibility,frameCounts,firstValidRow};
 }catch(error){
  console.warn('[Commit Cave] Falha ao inspecionar a spritesheet LPC; usando heroPixel().',error);
  return {visibility:new Map(),frameCounts:new Map(),firstValidRow:-1};
 }
}

function loadOptionalPng(key,src,isValid){
 const image=new Image();
 image.onload=()=>{
  if(!isValid(image)){
   assetStatus[key]='invalid';
   console.warn('[Commit Cave] PNG inválido; mantendo o fundo preto de segurança:',src);
   return;
  }
  pngAssets[key]=image;
  assetStatus[key]='ready';
  if(key==='hero'){
   const scan=inspectLpcRows(image);
   heroRowVisibility=scan.visibility;
   heroRowFrameCounts=scan.frameCounts;
   heroFirstValidRow=scan.firstValidRow;
   if(heroFirstValidRow<0){
    console.warn('[Commit Cave] Nenhuma linha LPC tem 150 pixels opacos. heroPixel() será utilizado.');
   }
  }
 };
 image.onerror=()=>{
  assetStatus[key]='missing';
  console.warn('[Commit Cave] Não foi possível carregar o asset:',src);
 };
 image.src=src;
}

loadOptionalPng(
 'far',
 './assets/layer-far.png',
 image=>image.naturalWidth===W&&image.naturalHeight===H&&countVisiblePixels(image,150)
);
loadOptionalPng(
 'hero',
 './assets/hero-sheet.png',
 image=>image.naturalWidth>=LPC_FRAME_SIZE&&
  image.naturalHeight>=LPC_FRAME_SIZE&&
  image.naturalWidth%LPC_FRAME_SIZE===0&&
  image.naturalHeight%LPC_FRAME_SIZE===0
);


function isLpcRowUsable(sheet,row){
 return Number.isInteger(row)&&row>=0&&
  (row+1)*LPC_FRAME_SIZE<=sheet.naturalHeight&&
  heroRowVisibility.get(row)===true;
}
function getLpcFrameCount(sheet,row,requested){
 if(!isLpcRowUsable(sheet,row))return 0;
 return Math.max(0,Math.min(requested,heroRowFrameCounts.get(row)||0));
}

// Standard LPC row blocks; each directional group is ordered up, left, down, right.
const LPC_ROWS={
 spellcast:{up:0,left:1,down:2,right:3},
 thrust:{up:4,left:5,down:6,right:7},
 walk:{up:8,left:9,down:10,right:11},
 slash:{up:12,left:13,down:14,right:15},
 shoot:{up:16,left:17,down:18,right:19},
 hurt:{row:20},
 climb:{row:21},
 idle:{up:22,left:23,down:24,right:25},
 jump:{up:26,left:27,down:28,right:29},
 sit:{up:30,left:31,down:32,right:33},
 emote:{up:34,left:35,down:36,right:37},
 run:{up:38,left:39,down:40,right:41},
 combatIdle:{up:42,left:43,down:44,right:45},
 backslash:{up:46,left:47,down:48,right:49},
 halfslash:{up:50,left:51,down:52,right:53}
};
const HERO_ANIMATIONS={
 idle:{row:LPC_ROWS.idle.right,frames:2,fps:2,loop:true},
 walk:{row:LPC_ROWS.walk.right,frames:9,fps:9,loop:true},
 run:{row:LPC_ROWS.run.right,frames:8,fps:13,loop:true},
 jump:{row:LPC_ROWS.jump.right,frames:5,fps:9,loop:false},
 climb:{row:LPC_ROWS.climb.row,frames:6,fps:8,loop:true},
 slash:{row:LPC_ROWS.slash.right,frames:6,fps:11,loop:true},
 attack:{row:LPC_ROWS.slash.right,frames:6,fps:11,loop:true},
 celebrate:{row:LPC_ROWS.spellcast.right,frames:7,fps:8,loop:true},
 drink:{row:LPC_ROWS.thrust.right,frames:8,fps:6,loop:true},
 sleep:{row:LPC_ROWS.hurt.row,frames:6,fps:3,loop:true}
};

function drawSceneLayer(key,fallback){
 const image=key==='far'&&assetStatus.far==='ready'?pngAssets.far:null;
 if(image){
  ctx.drawImage(image,0,0,W,H);
  return true;
 }
 ctx.fillStyle='#060916';
 ctx.fillRect(0,0,W,H);
 return false;
}

function drawHeroSprite(){
 const sheet=pngAssets.hero;
 const mode=hero.displayMode||(hero.eventMode&&time<hero.eventUntil?hero.eventMode:hero.mode);
 if(!sheet||heroFirstValidRow<0){
  heroPixel(ctx,hero.x,hero.y,mode,hero.dir);
  return;
 }

 const animation=HERO_ANIMATIONS[mode]||HERO_ANIMATIONS.idle;
 let row=animation.row;
 let frameCount=getLpcFrameCount(sheet,row,animation.frames);

 if(frameCount<1){
  // Prefer the verified Walk Right row before using an arbitrary scanned row.
  if(getLpcFrameCount(sheet,LPC_ROWS.walk.right,1)>0){
   row=LPC_ROWS.walk.right;
   frameCount=1;
  }else{
   row=heroFirstValidRow;
   frameCount=getLpcFrameCount(sheet,row,1);
  }
 }
 if(frameCount<1){
  heroPixel(ctx,hero.x,hero.y,mode,hero.dir);
  return;
 }

 const elapsed=(hero.eventMode&&time<hero.eventUntil?time-hero.eventStart:time-hero.segmentStart);
 let frame=Math.floor(Math.max(0,elapsed)*animation.fps);
 if(animation.loop)frame%=frameCount;
 else frame=Math.min(frame,frameCount-1);
 if(hero.segment&&hero.segment.reverse&&mode==='climb')frame=frameCount-1-frame;

 const sx=frame*LPC_FRAME_SIZE;
 const sy=row*LPC_FRAME_SIZE;
 if(sx+LPC_FRAME_SIZE>sheet.naturalWidth||sy+LPC_FRAME_SIZE>sheet.naturalHeight){
  heroPixel(ctx,hero.x,hero.y,mode,hero.dir);
  return;
 }

 ctx.save();
 ctx.imageSmoothingEnabled=false;
 ctx.translate(Math.round(hero.x),Math.round(hero.y));
 if(hero.dir===-1)ctx.scale(-1,1);
 ctx.drawImage(
  sheet,
  sx,sy,LPC_FRAME_SIZE,LPC_FRAME_SIZE,
  -19,-38,38,38
 );
 ctx.restore();
}

let time=0,last=0,randomWake=65;
const MAX_BATS=24;
const bats=[];
const batByCommit=new Map();
const fires=[{x:174,y:174,s:1.12}];
const fireY=172;
const torches=[{x:72,y:162}];
const altarCandles=[
 {x:382,y:92,opacity:.78,radius:8,next:0},
 {x:412,y:92,opacity:.66,radius:9,next:0}
];
const embers=Array.from({length:6},()=>({x:174,y:174,vy:rnd(-5.5,-3.2),size:1,alpha:.15}));

const foamBases=[{x:22,y:195,w:16}];

function spawnFoam(){
 const base=foamBases[0];
 return {
  x:base.x+rnd(-base.w/2+.5,base.w/2-.5),
  y:base.y,
  vx:rnd(-1.05,1.05),
  vy:rnd(-8,-5),
  life:rnd(.45,.75),
  bounces:0,
  size:1,
  tone:Math.random()
 };
}

// Sparse spray: just ten tiny droplets at the base of the authored waterfall.
const foam=Array.from({length:10},spawnFoam);

const hero={
 x:125,y:178,shadowY:178,fromX:125,fromY:178,targetX:125,targetY:178,
 start:0,segmentStart:0,duration:1,arc:0,mode:'sleep',displayMode:null,
 eventMode:null,eventUntil:0,eventStart:0,segment:null,routeIndex:0,dir:1,phase:0
};
const adventureRoute=[
 {x:125,y:178,mode:'sleep',duration:3.5},
 {x:125,y:178,mode:'idle',duration:1.0},
 {x:238,y:178,mode:'walk',duration:3.5},
 {x:284,y:178,mode:'jump',duration:1.08,arc:38},
 {x:358,y:178,mode:'run',duration:1.7},
 {x:358,y:114,mode:'climb',duration:2.35},
 {x:396,y:114,mode:'walk',duration:1.35},
 {x:396,y:114,mode:'slash',duration:2.8},
 {x:396,y:114,mode:'celebrate',duration:1.7},
 {x:358,y:114,mode:'walk',duration:1.35},
 {x:358,y:178,mode:'climb',duration:2.35,reverse:true},
 {x:284,y:178,mode:'jump',duration:1.08,arc:38},
 {x:238,y:178,mode:'jump',duration:1.0,arc:34},
 {x:75,y:178,mode:'walk',duration:4.0},
 {x:75,y:178,mode:'drink',duration:2.3},
 {x:125,y:178,mode:'walk',duration:2.1},
 {x:125,y:178,mode:'sleep',duration:4.2}
];
let hasInitialGitHubSnapshot=false;
function queueHeroReaction(mode,duration){
 hero.eventMode=mode;
 hero.eventStart=time;
 hero.eventUntil=time+duration;
}
function wakeBat(b,t){
 if(!b||b.permanentRoost)return false;
 b.mode='fly';
 b.until=Infinity;
 const angle=rnd(-Math.PI*.78,Math.PI*.78);
 const speed=rnd(24,48)*(b.depth===0?.72:b.depth===1?1:1.18);
 b.vx=Math.cos(angle)*speed;
 b.vy=Math.sin(angle)*speed;
 if(b.y<30)b.vy=Math.max(7,b.vy);
 return true;
}

function commitBatId(commit){
 return String(commit.sha||commit.url||[
  commit.repository||'repo',
  commit.date||'unknown-date',
  commit.message||'commit'
 ].join('|'));
}

function classifyCommitAge(commit,now){
 const stamp=Date.parse(commit.date||'');
 const ageMs=Number.isFinite(stamp)?Math.max(0,now-stamp):Infinity;
 return {ageMs,ageClass:ageMs<DAY?'young':'historical'};
}

function createCommitBat(commit,id,index,now){
 const seed=id.split('').reduce((value,char)=>
  ((value*31)+char.charCodeAt(0))>>>0,7);
 const age=classifyCommitAge(commit,now);
 const homeX=50+hash(seed,index,1)*380;
 const homeY=12+hash(seed,index,2)*16;
 const bat={
  id,
  commitSha:commit.sha||'',
  repository:commit.repository||'',
  x:homeX,
  y:homeY,
  homeX,
  homeY,
  size:age.ageClass==='historical'
   ?.9+hash(seed,index,3)*.48
   :.68+hash(seed,index,3)*.44,
  ageMs:age.ageMs,
  ageClass:age.ageClass,
  seed:hash(seed,index,4)*100,
  mode:'rest',
  until:Infinity,
  vx:0,
  vy:0,
  depth:index%3,
  permanentRoost:age.ageClass==='historical',
  permanentFlight:age.ageClass==='young'
 };
 if(bat.permanentRoost){
  bat.x=bat.homeX;
  bat.y=bat.homeY;
 }else{
  wakeBat(bat,time);
 }
 return bat;
}

function selectVisibleCommitRecords(records){
 if(records.length<=MAX_BATS)return records;
 const recentSlots=12;
 const recent=records.slice(0,recentSlots);
 const archive=records.slice(recentSlots);
 const sampled=[];
 const slots=MAX_BATS-recent.length;
 if(archive.length&&slots>0){
  const count=Math.min(slots,archive.length);
  for(let i=0;i<count;i++){
   const index=count===1
    ?Math.floor((archive.length-1)/2)
    :Math.round(i*(archive.length-1)/(count-1));
   sampled.push(archive[index]);
  }
 }
 const chosen=[...recent,...sampled];
 if(chosen.length<MAX_BATS){
  const used=new Set(chosen.map(commitBatId));
  for(const record of records){
   if(chosen.length>=MAX_BATS)break;
   const id=commitBatId(record);
   if(!used.has(id)){
    chosen.push(record);
    used.add(id);
   }
  }
 }
 return chosen.slice(0,MAX_BATS);
}

function syncBatsFromCommits(commits,now=Date.now()){
 const records=(Array.isArray(commits)?commits:[])
  .filter(commit=>commit&&typeof commit==='object')
  .slice()
  .sort((a,b)=>{
   const dateA=Date.parse(a.date||'');
   const dateB=Date.parse(b.date||'');
   return (Number.isFinite(dateB)?dateB:0)-(Number.isFinite(dateA)?dateA:0);
  });
 const activeIds=new Set();

 // One stable entity is maintained for every commit in the source JSON.
 // Only a curated subset is drawn, to preserve visual readability.
 records.forEach((commit,index)=>{
  const id=commitBatId(commit);
  activeIds.add(id);
  const age=classifyCommitAge(commit,now);
  let bat=batByCommit.get(id);

  if(!bat){
   bat=createCommitBat(commit,id,index,now);
   batByCommit.set(id,bat);
   return;
  }

  const previousClass=bat.ageClass;
  bat.ageMs=age.ageMs;
  bat.ageClass=age.ageClass;
  bat.commitSha=commit.sha||bat.commitSha;
  bat.repository=commit.repository||bat.repository;

  if(age.ageClass==='historical'){
   if(previousClass!=='historical'){
    bat.homeX=50+hash(bat.seed*1000,index,5)*380;
    bat.homeY=12+hash(bat.seed*1000,index,6)*16;
   }
   bat.permanentRoost=true;
   bat.permanentFlight=false;
   bat.mode='rest';
   bat.vx=0;
   bat.vy=0;
   bat.x=bat.homeX;
   bat.y=bat.homeY;
  }else{
   bat.permanentRoost=false;
   bat.permanentFlight=true;
   if(previousClass!=='young'||bat.mode!=='fly'){
    bat.x=bat.homeX;
    bat.y=bat.homeY;
    wakeBat(bat,time);
   }
  }
 });

 for(const id of batByCommit.keys()){
  if(!activeIds.has(id))batByCommit.delete(id);
 }

 const visibleRecords=selectVisibleCommitRecords(records);
 const visible=visibleRecords
  .map(record=>batByCommit.get(commitBatId(record)))
  .filter(Boolean);
 bats.splice(0,bats.length,...visible);
 return bats.length;
}

function wakeOneRecentBat(){
 const recent=bats.filter(b=>b.ageClass==='young'&&!b.permanentRoost);
 if(!recent.length)return false;
 return wakeBat(recent[Math.floor(Math.random()*recent.length)],time);
}

function drawBat(c,b,t){
 const flap=Math.sin(t*12+b.seed);
 const wingLift=b.mode==='rest'?Math.sin(t*2.15+b.seed)*.85:flap*5.5;
 c.save();
 c.translate(Math.round(b.x),Math.round(b.y+(b.mode==='rest'?Math.sin(t*1.9+b.seed)*.35:0)));
 c.scale(b.size,b.size);
 if(b.mode==='rest')c.rotate(Math.PI);

 // Wing outlines first, then dark membranes and subtle graphite ribs.
 if(b.mode==='rest'){
  poly(c,[[-1,-1],[-5,-5],[-10,-7-wingLift],[-13,-4-wingLift*.55],[-12,1],[-8,0],[-6,5],[-2,3],[0,7],[2,3],[6,5],[8,0],[12,1],[13,-4-wingLift*.55],[10,-7-wingLift],[5,-5],[1,-1]],'#2b243d');
  poly(c,[[-1,-1],[-5,-4],[-9,-5-wingLift*.65],[-11,-3-wingLift*.45],[-10,-1],[-7,-1],[-5,3],[-2,2],[-5,3],[7,-1],[10,-1],[11,-3-wingLift*.45],[9,-5-wingLift*.65],[5,-4],[1,-1]],'#12101c');
  px(c,-2,-4,4,10,'#171321');
  px(c,-1,-6,2,3,'#2b243d');
 }else{
  const leftOuter=[[-2,-1],[-7,-4-wingLift],[-13,-10-wingLift],[-15,-2],[-12,4],[-8,3],[-5,7],[-2,4]];
  const rightOuter=leftOuter.map(([x,y])=>[-x,y]);
  const leftInner=[[-2,-1],[-7,-3-wingLift],[-11,-7-wingLift],[-12,-1],[-9,2],[-5,5],[-2,3]];
  const rightInner=leftInner.map(([x,y])=>[-x,y]);
  poly(c,leftOuter,'#2b243d');
  poly(c,rightOuter,'#2b243d');
  poly(c,leftInner,'#12101c');
  poly(c,rightInner,'#12101c');
  // Pixel ribs and notched wing tips give the silhouette a hand-drawn sprite feel.
  px(c,-11,-3-wingLift,1,7,'#393149');
  px(c,-8,1,1,5,'#393149');
  px(c,10,-3-wingLift,1,7,'#393149');
  px(c,7,1,1,5,'#393149');
  px(c,-2,-4,4,11,'#171321');
 }
 // Ears, head and two unmistakable crimson eye pixels.
 poly(c,[[-4,-4],[-3,-9],[-1,-6],[0,-5],[1,-6],[3,-9],[4,-4],[3,1],[-3,1]],'#2b243d');
 poly(c,[[-3,-3],[-2,-7],[-1,-4],[0,-4],[1,-4],[2,-7],[3,-3],[2,1],[-2,1]],'#12101c');
 px(c,-2,-2,1,2,'#ff3b5c');
 px(c,1,-2,1,2,'#ff3b5c');
 px(c,-1,3,2,3,'#0b0a13');
 c.restore();
}
function updateBats(dt){
 for(const bat of bats){
  if(bat.ageClass==='historical'||bat.permanentRoost){
   bat.mode='rest';
   bat.x=bat.homeX+Math.sin(time*1.15+bat.seed)*.18;
   bat.y=bat.homeY+Math.sin(time*1.7+bat.seed)*.12;
   bat.vx=0;
   bat.vy=0;
   continue;
  }

  // Recent commits remain in continuous flight; they never time out into a static state.
  if(bat.mode!=='fly')wakeBat(bat,time);
  bat.x+=bat.vx*dt;
  bat.y+=bat.vy*dt+Math.sin(time*3.1+bat.seed)*7*dt;

  if(bat.x<18){
   bat.x=18;
   bat.vx=Math.abs(bat.vx);
  }else if(bat.x>W-18){
   bat.x=W-18;
   bat.vx=-Math.abs(bat.vx);
  }
  if(bat.y<30){
   bat.y=30;
   bat.vy=Math.abs(bat.vy);
  }else if(bat.y>150){
   bat.y=150;
   bat.vy=-Math.abs(bat.vy);
  }
 }
}

function updateHero(dt){
 if(!hero.segment){
  const segment=adventureRoute[hero.routeIndex];
  hero.segment=segment;
  hero.fromX=hero.x;
  hero.fromY=hero.y;
  hero.targetX=segment.x;
  hero.targetY=segment.y;
  if(segment.mode==='climb'){
   hero.x=358;
   hero.fromX=358;
   hero.targetX=358;
  }
  hero.segmentStart=time;
  hero.start=time;
  hero.duration=Math.max(.05,segment.duration);
  hero.arc=segment.arc||0;
  hero.mode=segment.mode;
  if(segment.mode!=='climb'&&Math.abs(segment.x-hero.x)>.5)hero.dir=segment.x>hero.x?1:-1;
  hero.shadowY=hero.y;
 }

 const segment=hero.segment;
 const elapsed=time-hero.segmentStart;
 const moving=['walk','run','jump','climb'].includes(segment.mode);
 if(moving){
  const progress=clamp(elapsed/hero.duration,0,1);
  const eased=progress*progress*(3-2*progress);
  hero.shadowY=lerp(hero.fromY,hero.targetY,eased);
  hero.x=segment.mode==='climb'?358:lerp(hero.fromX,hero.targetX,eased);
  hero.y=hero.shadowY;
  if(segment.mode==='jump')hero.y-=Math.sin(progress*Math.PI)*hero.arc;
  if(progress>=1){
   hero.x=segment.mode==='climb'?358:hero.targetX;
   hero.y=hero.targetY;
   hero.shadowY=hero.targetY;
  }
 }

 if(elapsed>=hero.duration){
  hero.x=segment.mode==='climb'?358:segment.x;
  hero.y=segment.y;
  hero.shadowY=segment.y;
  hero.routeIndex=(hero.routeIndex+1)%adventureRoute.length;
  hero.segment=null;
 }

 if(hero.eventMode&&time>=hero.eventUntil){
  hero.eventMode=null;
  hero.eventUntil=0;
 }
 hero.phase+=dt*(hero.mode==='run'?18:hero.mode==='walk'?11:hero.mode==='jump'?13:hero.mode==='climb'?8:2.8);
}
const HERO_ROWS_RAW=[
 "OOOOOOOOOO","OOOHHHHHHOOO","OOHHHHHHHHOO","OHhHHHHHHhHHO","OHhHHHHHHHHHO","OOHHHHHHHHOO",
 "OOOSSSSSSSOO","OOOSSSSSSSOO","OOOSSEEESSSOO","OOOSSSSSSSOO","OOOSSSBBBSSOO","OOOSSSBBBBBOO",
 "OOOCCCCCCOOO","OOCCCLLLCCCOO","OCCCLLLLLLCCO","OCCCLLLGLLLCCO","OCCCLLLLLLCCO","OOCCLLLLLLCCO",
 "OOOSLLLLLSSOO","OOOSLLLLLSSOO","OOOTLLLLLTTOO","OOOTLLLLLTTOO","OOOTTTTTTTTOO","OOOTTTTTTTTOO",
 "OOOTTT.TTTTOO","OOObbb.bbbOOO","OOObbb.bbbOOO","OOObbb.bbbOOO","OOObbb.bbbOOO","OOObbb.bbbOOO",
 "OOObbb.bbbOOO","OOOOOOOOOOOO"
];
const HERO_MATRIX=HERO_ROWS_RAW.map(row=>{const left=Math.floor((24-row.length)/2);return ('.'.repeat(left)+row+'.'.repeat(24-left-row.length)).slice(0,24);});
const HERO_COLORS={O:'#080b15',H:'#17131c',h:'#49303a',S:'#713f32',s:'#b97550',E:'#f2d5b4',B:'#462426',C:'#171624',c:'#4b3044',L:'#49302b',l:'#956044',G:'#e2b66d',T:'#302537',b:'#18151f'};
function heroPixel(c, x, y, mode, dir) {
 const cell=1.45, step=Math.sin(hero.phase);
 const breathe=mode==='idle'?Math.sin(hero.phase*1.5)*.65:0;
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(dir,1);
 c.fillStyle='#02040a99';c.beginPath();c.ellipse(0,1,14,2.7,0,0,Math.PI*2);c.fill();
 if(mode==='sleep'){
  px(c,-13,-7,26,6,'#1c1728');px(c,-10,-12,20,7,'#30243a');px(c,-8,-20,17,9,'#a96845');px(c,-9,-24,20,7,'#19131c');
  px(c,-5,-16,2,2,'#11101a');px(c,3,-16,2,2,'#11101a');c.restore();return;
 }
 const capeWind=Math.sin(hero.phase*.8)*1.7+(mode==='run'?Math.sin(hero.phase*1.7)*1.2:0);
 for(let r=12;r<24;r++){
  const shift=Math.round(capeWind*(r-12)/12);
  for(let col=0;col<24;col++){
   const ch=HERO_MATRIX[r][col];if(ch!=='C'&&ch!=='c')continue;
   const sway=col<8?shift:shift*.25;
   px(c,-12*cell+col*cell+sway,-32*cell+r*cell,cell+.18,cell+.18,ch==='C'?'#171522':'#493149');
  }
 }
 const walk=mode==='walk'||mode==='run',legSwing=walk?Math.round(step*1.4):0;
 for(let r=0;r<32;r++){
  const breath=r>12&&r<24?breathe:0;
  for(let col=0;col<24;col++){
   const ch=HERO_MATRIX[r][col];if(ch==='.')continue;
   let shift=0;if(r>=24&&col<11)shift=-legSwing;if(r>=24&&col>13)shift=legSwing;
   px(c,-12*cell+col*cell+shift,-32*cell+r*cell+breath,cell+.22,cell+.22,HERO_COLORS[ch]||'#171522');
   if(ch==='H'&&(col+r)%5===0)px(c,-12*cell+col*cell+shift,-32*cell+r*cell,1,1,'#69505a');
   if((ch==='l'||ch==='L')&&r>13&&r<21&&(col+r)%4===0)px(c,-12*cell+col*cell+shift,-32*cell+r*cell,1,1,'#c28a58');
  }
 }
 px(c,-4,-32*cell+8*cell,1.3,1.3,'#fff0d4');px(c,3,-32*cell+8*cell,1.3,1.3,'#fff0d4');
 px(c,0,-32*cell+10*cell,1.2,1.5,'#d58c62');px(c,-6,-15,2,2,'#edc477');px(c,5,-15,2,2,'#edc477');px(c,-1,-13,3,3,'#f4ce7a');
 if(mode==='celebrate'){
  for(let n=0;n<6;n++){px(c,-11-n*.75,-21-n*2,2.2,2.2,n%2?'#9b5d43':'#c07c52');px(c,9+n*.75,-21-n*2,2.2,2.2,n%2?'#9b5d43':'#c07c52');}
  c.fillStyle='#ffe28a';c.font='bold 8px monospace';c.fillText('+1!',-7,-51-Math.abs(Math.sin(time*8))*3);
 }
 if(mode==='drink'){px(c,12,-27,3,6,'#40d5ff');px(c,13,-28,1,2,'#eaffff');}
 c.restore();
}
function fire(c,f,i){
 // Ambient bounce light only; the authored fire remains untouched.
 const x=174,y=174;
 const pulse=.5+.5*Math.sin(time*6.2+i*.7);
 const boost=performance.now()<state.boost?1.12:1;
 const opacity=clamp((.035+.035*pulse)*boost,0,.08);
 const radius=(13+3*pulse)*(f.s||1);
 const halo=c.createRadialGradient(x,y,0,x,y,radius);
 halo.addColorStop(0,'rgba(255,183,112,'+opacity+')');
 halo.addColorStop(.42,'rgba(255,139,82,'+(opacity*.42)+')');
 halo.addColorStop(.78,'rgba(255,111,65,'+(opacity*.12)+')');
 halo.addColorStop(1,'rgba(255,96,48,0)');
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=1;
 c.fillStyle=halo;c.fillRect(x-radius,y-radius,radius*2,radius*2);c.restore();
}

function drawWater(c,dt){
 const base=foamBases[0];
 c.save();
 c.globalCompositeOperation='screen';

 // No water lines, strips or overlays: only a restrained spray at y=195.
 for(const particle of foam){
  particle.x+=particle.vx*dt;
  particle.y+=particle.vy*dt;
  particle.vy+=28*dt;
  particle.vx*=Math.max(0,1-3.5*dt);
  particle.life-=dt;

  // Keep droplets strictly inside the native waterfall opening.
  if(particle.x<14.5||particle.x>29.5){
   particle.x=clamp(particle.x,14.5,29.5);
   particle.vx*=-.18;
  }

  // Collision plane is the exact pool edge. A single soft rebound is allowed.
  if(particle.y>=base.y&&particle.vy>0){
   particle.y=base.y;
   particle.vy=-Math.abs(particle.vy)*.18;
   particle.bounces++;
  }

  if(particle.life<=0||particle.bounces>=2){
   Object.assign(particle,spawnFoam());
   continue;
  }

  c.globalAlpha=rnd(.04,.08);
  px(c,particle.x,particle.y,particle.size,particle.size,
   particle.tone>.5?'#ffffff':'#d9f8ff');
 }
 c.restore();
 c.globalAlpha=1;
}

function drawTorches(c){
 torches.forEach((torch,index)=>{
  const pulse=.5+.5*Math.sin(time*8.5+index*1.7);
  const radius=8+3*pulse;
  const glow=c.createRadialGradient(torch.x,torch.y-3,0,torch.x,torch.y-3,radius);
  glow.addColorStop(0,'rgba(255,174,91,'+(.18+.1*pulse)+')');
  glow.addColorStop(.55,'rgba(255,112,48,'+(.08+.04*pulse)+')');
  glow.addColorStop(1,'rgba(255,80,28,0)');
  c.save();c.globalCompositeOperation='screen';c.fillStyle=glow;
  c.fillRect(torch.x-radius,torch.y-3-radius,radius*2,radius*2);c.restore();
 });
 c.globalAlpha=1;
}

function drawAltarCandles(c,dt){
 altarCandles.forEach((candle,index)=>{
  if(time>=candle.next){
   candle.opacity=.58+Math.random()*.4;
   candle.radius=7+Math.random()*5;
   candle.next=time+.045+Math.random()*.13;
  }
  const pulse=.68+.32*Math.sin(time*(15+index*2.5)+index*1.9);
  const alpha=clamp(candle.opacity*pulse,0,1);
  const radius=candle.radius*(.88+.12*Math.sin(time*18+index));
  const glow=c.createRadialGradient(candle.x,candle.y,0,candle.x,candle.y,radius);
  glow.addColorStop(0,'rgba(255,190,92,'+(alpha*.31)+')');
  glow.addColorStop(.42,'rgba(255,130,53,'+(alpha*.18)+')');
  glow.addColorStop(1,'rgba(255,112,45,0)');
  c.save();c.globalCompositeOperation='screen';c.fillStyle=glow;
  c.fillRect(candle.x-radius,candle.y-radius,radius*2,radius*2);
  // Native candle artwork stays unobstructed; glow only.
  c.restore();
 });
 c.globalAlpha=1;
}

function drawEmbers(c,dt){
 for(let i=0;i<embers.length;i++){
  const particle=embers[i];
  particle.y+=particle.vy*dt;
  // Rare charcoal dust rises vertically and disappears after 14 pixels.
  if(particle.y<160){
   embers[i]={x:174,y:174,vy:rnd(-5.5,-3.2),size:1,alpha:.15};
   continue;
  }
  const rise=174-particle.y;
  c.globalAlpha=particle.alpha*clamp(1-rise/14,0,1);
  px(c,particle.x,particle.y,particle.size,particle.size,'#2d2830');
 }
 c.globalAlpha=1;
}

const mistBands=[
 {y:47,width:174,height:4,speed:7.2,offset:11,seed:1},
 {y:68,width:216,height:5,speed:4.6,offset:173,seed:2},
 {y:201,width:198,height:4,speed:3.1,offset:317,seed:3}
];
let mistClock=0;
function drawAtmosphericMist(c,dt){
 if(!Number.isFinite(dt))return;
 c.save();
 c.globalCompositeOperation='screen';

 for(const band of mistBands){
  const cycle=W+band.width;
  const travel=(mistClock*band.speed+band.offset)%cycle;
  const x=travel-band.width;

  c.fillStyle='rgba(150, 170, 200, 0.03)';
  c.fillRect(Math.round(x),band.y,band.width,band.height);

  c.fillStyle='rgba(150, 170, 200, 0.018)';
  c.fillRect(Math.round(x+18),band.y-2,Math.round(band.width*.28),2);
  c.fillRect(Math.round(x+band.width*.58),band.y+band.height,Math.round(band.width*.2),1);
  for(let i=0;i<12;i++){
   const dx=x+(i*17+band.seed*13)%band.width;
   c.fillRect(Math.round(dx),band.y+(i%2?0:band.height),5+(i%3)*3,1);
  }
 }
 c.restore();
}

function drawCrystalGlow(c){
 const crystals=[
  {x:88,y:198,color:'rgba(155,104,255,'},
  {x:392,y:198,color:'rgba(92,196,255,'}
 ];
 c.save();
 c.globalCompositeOperation='screen';
 crystals.forEach((item,index)=>{
  const pulse=.5+.5*Math.sin(time*2.25+index*1.4);
  const radius=7+pulse*5;
  const halo=c.createRadialGradient(item.x,item.y,0,item.x,item.y,radius);
  halo.addColorStop(0,item.color+(0.12+pulse*.13)+')');
  halo.addColorStop(.58,item.color+(0.045+pulse*.06)+')');
  halo.addColorStop(1,item.color+'0)');
  c.fillStyle=halo;
  c.fillRect(item.x-radius,item.y-radius,radius*2,radius*2);
  c.globalAlpha=.38+pulse*.42;
  poly(c,[[item.x,item.y-5-pulse],[item.x+3,item.y],[item.x,item.y+5+pulse],[item.x-3,item.y]],index===0?'#bf94ff':'#8aeaff');
  px(c,item.x,item.y-3,1,6,index===0?'#ead7ff':'#d8fbff');
 });
 c.restore();
 c.globalAlpha=1;
}
function render(dt){
 ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#060916';
 ctx.fillRect(0,0,W,H);

 // Authored background only. No procedural terrain, castle, cave or front layers.
 drawSceneLayer('far');
 drawAtmosphericMist(ctx,dt);
 drawWater(ctx,dt);
 drawCrystalGlow(ctx);
 fires.forEach(fire.bind(null,ctx));
 drawTorches(ctx);
 drawAltarCandles(ctx,dt);
 drawEmbers(ctx,dt);

 updateBats(dt);
 bats.sort((a,b)=>a.depth-b.depth).forEach(b=>drawBat(ctx,b,time));

 updateHero(dt);
 ctx.fillStyle='#03050a99';
 ctx.beginPath();
 ctx.ellipse(hero.x,hero.shadowY+1,13,2.4,0,0,Math.PI*2);
 ctx.fill();
 drawHeroSprite();

 const visibleMode=hero.displayMode||(hero.eventMode&&time<hero.eventUntil?hero.eventMode:hero.mode);
 if(visibleMode==='sleep'){
  ctx.fillStyle='#d8ebff';
  ctx.font='7px monospace';
  ctx.fillText('Z',hero.x+12,hero.y-34+Math.sin(time*2)*2);
 }
 if(state.failed>0&&Math.floor(time*2)%2===0){
  px(ctx,285,207,15,2,'#d1c4b5');
  px(ctx,288,202,10,3,'#eee1cb');
  px(ctx,284,203,3,4,'#eee1cb');
  px(ctx,298,203,3,4,'#eee1cb');
 }
}

function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;}
function updateHUD(d){const previous={total:state.total,passed:state.passed,failed:state.failed};const commits=Array.isArray(d.commits)?d.commits:[],last=d.lastCommit||commits.reduce((a,b)=>!a||new Date(b.date)>new Date(a.date)?b:a,null),days=last?.date?Math.max(0,Math.floor((Date.now()-new Date(last.date))/DAY)):7,ci=d.ci||{};Object.assign(state,{total:Number(d.totalCommits??commits.length),repos:Number(d.repositoriesScanned||0),passed:Number(ci.successfulRuns||0),failed:Number(ci.failedRuns||0),pending:Number(ci.pendingRuns||0),checked:Number(ci.checkedRuns||0),days});
syncBatsFromCommits(commits,Date.now());
if(hasInitialGitHubSnapshot){
 const newCommits=Math.max(0,state.total-previous.total);
 if(state.failed>previous.failed){
  queueHeroReaction('slash',2.6);
  wakeOneRecentBat();
 }else if(newCommits>0||state.passed>previous.passed){
  queueHeroReaction('celebrate',2.0);
  state.boost=performance.now()+4200;
 }
}
hasInitialGitHubSnapshot=true;const level=Math.max(1,Math.floor(state.total/25)+1+Math.floor(state.passed/5)),hunger=clamp(100-Math.max(0,days-1)*27,5,100),water=clamp(100-days*10,8,100),evolution=clamp(16+level*8+state.passed*2,8,100);$('hungerBar').style.width=hunger+'%';$('waterBar').style.width=water+'%';$('evolutionBar').style.width=evolution+'%';$('level').textContent='Lv. '+level;$('hudCommits').textContent=new Intl.NumberFormat('pt-BR').format(state.total);$('hudRepos').textContent=state.repos;$('hudActivity').textContent=last?days===0?'Hoje':days+'d':'—';$('hudActions').textContent=state.pending?'RUN':state.failed?'FAIL':state.passed?'PASS':'—';$('totalCommits').textContent=new Intl.NumberFormat('pt-BR').format(state.total);$('lastCommit').textContent=last?(days===0?'hoje':days===1?'há 1 dia':'há '+days+' dias'):'Ainda não';$('lastCommitDate').textContent=last?new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium'}).format(new Date(last.date))+(last.repository?' · '+last.repository:''):'esperando atividade';$('hungerLabel').textContent=days>=7?'Faminto':days>=3?'Com fome':'Satisfeito';$('hungerDetail').textContent=days+' dia(s) desde o último commit';$('ciSummary').textContent=state.passed+' aprovadas · '+state.failed+' falhas · '+state.pending+' em andamento';$('ciLight').style.background=state.failed?'#ff4b64':state.pending?'#ffd16e':'#52ef91';$('testBar').style.width=(state.checked?state.passed/state.checked*100:0)+'%';$('testCount').textContent=state.checked?state.passed+'/'+state.checked+' workflows aprovados':'sem execuções classificadas';$('waterEvent').textContent=days===0?'+1 Água':'Água '+water+'%';$('waterDetail').textContent=days===0?'commit recente renova a jornada':'atividade recente mantém a fonte viva';$('qualityEvent').textContent=state.failed?'Build com falha':state.passed?'+1 Evolução':'Qualidade em construção';$('qualityDetail').textContent=state.failed?'marcas vermelhas no chão':state.passed+' workflows concluídos com sucesso';$('updateStatus').textContent='Dados coletados em '+new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(d.generatedAt||Date.now()))+' · '+state.repos+' repositórios públicos analisados.';const sha=last?.sha||'',runAt=ci.latestRunAt||'',oldSha=store('cc-sha'),oldRun=store('cc-run'),initial=oldSha===null&&oldRun===null;if(!initial&&sha&&oldSha&&sha!==oldSha){state.celebrate=time+5;state.boost=performance.now()+5500;$('waterEvent').textContent='+1 Água';$('waterDetail').textContent='novo commit detectado · explorador celebra';wakeOneRecentBat();}if(!initial&&runAt&&oldRun&&runAt!==oldRun&&ci.latestConclusion==='success'){state.celebrate=time+5;state.boost=performance.now()+6000;$('qualityEvent').textContent='+1 Evolução';$('qualityDetail').textContent='execução verde detectada · caverna floresce';wakeOneRecentBat();}if(oldSha===null)store('cc-sha',sha);else if(sha)store('cc-sha',sha);if(oldRun===null)store('cc-run',runAt);else if(runAt)store('cc-run',runAt);if(state.failed>0&&Math.random()<.15){wakeOneRecentBat();}}
async function refresh(){try{const r=await fetch('./data/commits.json?ts='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);updateHUD(await r.json());}catch(e){$('updateStatus').textContent='Dados do GitHub indisponíveis; o fundo preto de segurança foi mantido.';$('ciSummary').textContent='Resultados de CI indisponíveis.';console.warn('[Commit Cave]',e.message);}}
let frame=0;function loop(now){if(!frame)frame=now;const dt=Math.min(.04,Math.max(0,(now-frame)/1000));frame=now;time+=dt;mistClock+=dt;render(dt);requestAnimationFrame(loop);}requestAnimationFrame(loop);refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)frame=0;});
})();