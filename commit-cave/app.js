/* Commit Cave: 480x270 procedural dark-fantasy pixel-art world. No external assets or engines. */
(()=>{
'use strict';
const W=480,H=270,$=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),DAY=86400000;
const lerp=(from,to,progress)=>from+(to-from)*progress;
const canvas=$('worldCanvas'),ctx=canvas&&canvas.getContext('2d',{alpha:false});if(!ctx)return;
canvas.width=W;canvas.height=H;ctx.imageSmoothingEnabled=false;
const C={void:'#060916',rock:'#171a2c',rock2:'#292b40',rock3:'#423a50',edge:'#79616a',moss:'#226747',moss2:'#48a56a',blue:'#167ab8',cyan:'#65dcff',violet:'#984bd3',pink:'#ee65d2',fire:'#ff702d',gold:'#ffd078',skin:'#a96845',leather:'#80503a'};
const state={total:0,repos:0,passed:0,failed:0,pending:0,checked:0,days:7,celebrate:0,boost:0};
function px(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
function poly(c,p,col){c.beginPath();c.moveTo(p[0][0],p[0][1]);p.slice(1).forEach(v=>c.lineTo(v[0],v[1]));c.closePath();c.fillStyle=col;c.fill();}
function hash(x,y,s=0){const n=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return n-Math.floor(n);}
function layer(draw){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;draw(g);return c;}
function rock(c,x,y,w,h,seed){
 const top=3+hash(seed,31)*4;
 poly(c,[[x+2,y+top],[x+w*.12,y+1],[x+w*.29,y+top*.6],[x+w*.53,y],[x+w*.76,y+2],[x+w-3,y+top],[x+w,y+h*.48],[x+w-4,y+h-2],[x+w*.69,y+h-1],[x+w*.39,y+h-2],[x+4,y+h-3]],'#0a1020');
 poly(c,[[x+3,y+top],[x+w*.12,y+3],[x+w*.29,y+top],[x+w*.53,y+2],[x+w*.76,y+4],[x+w-5,y+top+2],[x+w-8,y+h*.55],[x+w*.7,y+h*.75],[x+w*.38,y+h*.82],[x+5,y+h*.68]],'#211f34');
 poly(c,[[x+5,y+top],[x+w*.12,y+4],[x+w*.29,y+top],[x+w*.52,y+4],[x+w*.72,y+6],[x+w*.52,y+h*.3],[x+w*.19,y+h*.26]],'#514056');
 poly(c,[[x+6,y+top+2],[x+w*.17,y+5],[x+w*.28,y+top+2],[x+w*.43,y+7],[x+w*.29,y+h*.2],[x+w*.12,y+h*.24]],'#716071');
 poly(c,[[x+4,y+h*.69],[x+w*.38,y+h*.79],[x+w*.7,y+h*.72],[x+w-7,y+h*.48],[x+w-4,y+h-2],[x+w*.69,y+h-1],[x+w*.39,y+h-2],[x+4,y+h-3]],'#111629');
 for(let i=0;i<w*h/7;i++){const xx=x+3+hash(seed,i+1)*(w-6),yy=y+3+hash(seed+9,i+4)*(h-6),v=hash(seed+19,i+7);px(c,xx,yy,v>.93?2:1,v>.9?2:1,v>.94?'#a17b77':v>.78?'#776174':v>.59?'#4a4058':v>.36?'#2a2c43':'#121a2c');}
 if(seed%2===0){c.strokeStyle='#12182a';c.lineWidth=1;c.beginPath();c.moveTo(x+w*.55,y+h*.22);c.lineTo(x+w*.48,y+h*.45);c.lineTo(x+w*.59,y+h*.63);c.stroke();px(c,x+w*.56,y+h*.61,3,1,'#96747b');}
 for(let i=0;i<w/5;i++){const rx=x+4+i*5+hash(seed+70,i)*2;if(hash(seed+71,i)>.22)px(c,rx,y+top,1,1,'#78b9ef');}
 const warmSources=[{x:312,y:211},{x:46,y:165},{x:355,y:164},{x:436,y:133}];
 for(const light of warmSources){const d=Math.hypot(x+w*.5-light.x,y+h*.5-light.y);if(d<72){const intensity=1-d/72;for(let i=0;i<w/10*intensity;i++){const rx=x+4+hash(seed+90,i)*(w-8),ry=y+top+1+hash(seed+91,i)*Math.max(1,h*.2);px(c,rx,ry,1,1,intensity>.6?'#c47b53':'#8b6250');}}}
}
function crystal(c,x,y,s=1){poly(c,[[x,y-11*s],[x+5*s,y-2*s],[x+3*s,y+8*s],[x,y+12*s],[x-5*s,y+7*s],[x-6*s,y-2*s]],'#6e36a5');poly(c,[[x,y-9*s],[x+2*s,y-1*s],[x+1*s,y+7*s],[x-2*s,y+5*s]],'#c58bff');px(c,x-1,y-5*s,2,8*s,'#f0dbff');}
const far=layer(c=>{
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#080d20');g.addColorStop(.55,'#102956');g.addColorStop(1,'#07172d');c.fillStyle=g;c.fillRect(0,0,W,H);
 for(let i=0;i<140;i++)px(c,hash(i,2)*W,hash(i,4)*130,hash(i,8)>.9?2:1,1,hash(i,7)>.5?'#789acb':'#344b79');
 c.fillStyle='#172c55';c.beginPath();c.arc(207,73,35,0,Math.PI*2);c.fill();c.fillStyle='#b3d9ff';c.beginPath();c.arc(207,73,27,0,Math.PI*2);c.fill();c.fillStyle='#dcedff';c.beginPath();c.arc(207,73,21,0,Math.PI*2);c.fill();
 for(let i=0;i<24;i++)px(c,187+hash(i,3)*40,53+hash(i,9)*39,2+hash(i,5)*3,2,hash(i,6)>.5?'#a9c9ec':'#d9eaff');
 poly(c,[[0,167],[33,119],[69,147],[104,94],[148,138],[187,105],[225,143],[267,103],[311,144],[355,95],[399,139],[445,108],[480,148],[480,226],[0,226]],'#111e3d');
 poly(c,[[0,185],[60,146],[102,170],[148,127],[190,168],[228,126],[270,161],[320,130],[365,167],[415,126],[480,164],[480,235],[0,235]],'#172c52');
 // Gothic keep, pointed towers and moonlit bridge.
 poly(c,[[143,174],[151,151],[160,151],[168,128],[177,128],[185,101],[195,101],[202,72],[211,101],[222,101],[232,127],[241,127],[250,153],[263,153],[270,178]],'#080e22');
 poly(c,[[156,174],[165,150],[177,147],[184,118],[195,118],[202,91],[211,118],[224,117],[235,148],[249,151],[258,177]],'#111b37');
 const spires=[[165,137,17,40],[184,111,17,65],[202,75,18,100],[225,103,17,72],[246,132,15,44]];
 for(const [sx,sy,sw,sh] of spires){poly(c,[[sx,sy+sh],[sx,sy+9],[sx+sw*.5,sy],[sx+sw,sy+9],[sx+sw,sy+sh]],'#080e20');poly(c,[[sx+2,sy+sh-2],[sx+2,sy+10],[sx+sw*.5,sy+3],[sx+sw-2,sy+10],[sx+sw-2,sy+sh-2]],'#1b2c50');px(c,sx+sw*.5-1,sy-5,2,7,'#5578a7');}
 poly(c,[[145,174],[145,150],[155,140],[163,150],[163,174]],'#101a34');poly(c,[[244,174],[244,148],[255,138],[264,151],[266,174]],'#101a34');
 for(let i=0;i<18;i++){const x=174+(i%4)*18,y=124+Math.floor(i/4)*13;px(c,x,y,3,7,i%3?'#f2b454':'#6fb4ed');px(c,x+1,y+2,1,4,'#fff0a8');}
 c.strokeStyle='#243d66';c.lineWidth=5;c.beginPath();c.moveTo(90,173);c.quadraticCurveTo(183,205,277,173);c.stroke();
 c.strokeStyle='#6e86ac';c.lineWidth=1;c.beginPath();c.moveTo(91,169);c.quadraticCurveTo(183,198,276,169);c.stroke();
 for(let x=98;x<276;x+=8){const y=171+Math.sin((x-98)/178*Math.PI)*8;px(c,x,y,1,8,'#18243b');}
 for(let i=0;i<8;i++)px(c,hash(i,66)*W,145+i*8,42,2,'#526c9830');
});
const mid=layer(c=>{
 for(let r=0;r<5;r++)for(let col=0;col<15;col++){const x=col*34+(r%2)*10,y=r*14-5;if(r>1&&x>67&&x<420)continue;rock(c,x,y,31,18,40+r*20+col);}
 for(let r=0;r<9;r++){const y=55+r*19;rock(c,-15,y,79,23,110+r);rock(c,420,y,80,22,220+r);if(r%2===0){rock(c,16,y+8,44,17,350+r);rock(c,396,y+5,54,19,430+r);}}
 // Stalactites, irregular and shadowed.
 for(let i=0;i<17;i++){const x=i*30-5,len=10+hash(i,91)*28;poly(c,[[x,0],[x+15,0],[x+12,len*.6],[x+7,len],[x+3,len*.6]],'#191a2d');px(c,x+4,len*.6,3,2,'#6b505c');}
 // Ancient arch and inner blackness.
 c.fillStyle='#050914';c.beginPath();c.arc(365,154,57,Math.PI,Math.PI*2);c.fill();c.strokeStyle='#3b3047';c.lineWidth=15;c.beginPath();c.arc(365,154,59,Math.PI,Math.PI*2);c.stroke();c.strokeStyle='#92705f';c.lineWidth=2;c.beginPath();c.arc(365,154,53,Math.PI,Math.PI*2);c.stroke();
 for(let i=0;i<10;i++){const a=Math.PI+i*Math.PI/9,x=365+59*Math.cos(a),y=154+59*Math.sin(a);px(c,x-4,y-4,8,7,i%2?'#564052':'#72515a');px(c,x-2,y-5,4,1,'#ae7d61');}
 // Rope bridge, railings, and far ladder.
 for(let i=0;i<9;i++){px(c,25+i*16,157,15,5,i%2?'#71482f':'#4f352e');px(c,25+i*16,156,13,1,'#d09655');px(c,26+i*16,162,2,9,'#37283a');}
 px(c,24,148,145,3,'#553d3a');for(let i=0;i<9;i++)px(c,29+i*16,145,2,8,'#9a6643');
 for(const x of [457,472])px(c,x,75,3,177,'#704932');for(let y=82;y<254;y+=13){px(c,457,y,18,3,'#b77d49');px(c,459,y+1,14,1,'#e2aa65');}
 // Moss and hanging vines grow out of cracks at rock edges.
 for(let i=0;i<145;i++){const x=hash(i,201)*480,y=40+hash(i,202)*165;if(x<75||x>405){px(c,x,y,1+hash(i,203)*4,2+hash(i,204)*5,hash(i,205)>.5?'#236946':'#41845a');}}
 for(let i=0;i<18;i++){const x=hash(i,211)<.5?hash(i,212)*60:410+hash(i,213)*65,y=60+hash(i,214)*100;px(c,x,y,1,8+hash(i,215)*15,'#1a573e');px(c,x-2,y+6,3,2,'#479263');}
 crystal(c,90,204,1);crystal(c,397,187,.85);crystal(c,314,126,.65);
});
const front=layer(c=>{
 const ledges=[[0,167,170,12],[188,207,180,14],[351,178,129,13],[0,245,480,25]];
 ledges.forEach(([x,y,w,h],n)=>{rock(c,x,y,w,h,700+n);px(c,x,y,w,2,'#987869');px(c,x,y+2,w,1,'#49704f');for(let xx=x+3;xx<x+w;xx+=6){const q=hash(xx,n+31);px(c,xx,y-1,2,2,q>.4?'#3a8b59':'#1b603f');if(q>.85)px(c,xx+1,y-3,1,3,'#2c744c');}});
 for(let i=0;i<5;i++)rock(c,153+i*8,178+i*5,13,9,820+i);
 for(let i=0;i<80;i++){const x=hash(i,901)*480,y=174+hash(i,902)*4;if(x<170||x>350)px(c,x,y,2,4+hash(i,903)*8,'#246c49');}
 for(let i=0;i<60;i++){const x=hash(i,920)*480,y=252+hash(i,921)*10;px(c,x,y,2+hash(i,922)*4,1,hash(i,923)>.5?'#238ac4':'#51d7fa');}
});
// Optional high-resolution PNG assets. Missing/invalid files never block the procedural world.
// Optional scene layers + verified Universal LPC spritesheet (64x64 frames).
const pngAssets={far:null,mid:null,front:null,hero:null};
const assetStatus={far:'loading',mid:'loading',front:'loading',hero:'loading'};
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
   console.warn('[Commit Cave] PNG vazio/inválido; fallback ativo:',src);
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
  console.info('[Commit Cave] Asset ausente; mantendo fallback procedural:',src);
 };
 image.src=src;
}

const validSceneLayer=img=>img.naturalWidth===W&&img.naturalHeight===H&&countVisiblePixels(img,32);
loadOptionalPng('far','./assets/layer-far.png',img=>img.naturalWidth===W&&img.naturalHeight===H&&countVisiblePixels(img,150));
loadOptionalPng('mid','./assets/layer-mid.png',validSceneLayer);
loadOptionalPng('front','./assets/layer-front.png',validSceneLayer);
loadOptionalPng('hero','./assets/hero-sheet.png',img=>
 img.naturalWidth>=LPC_FRAME_SIZE&&img.naturalHeight>=LPC_FRAME_SIZE&&
 img.naturalWidth%LPC_FRAME_SIZE===0&&img.naturalHeight%LPC_FRAME_SIZE===0
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

function drawSceneLayer(key,fallback,offsetX=0){
 const image=pngAssets[key];
 if(image){
  ctx.drawImage(image,0,0,W,H);
  return;
 }
 if(key==='far'||!pngAssets.far){
  ctx.drawImage(fallback,0,0,W,H);
 }
}
function drawFrontLayer(){
 if(pngAssets.front){
  ctx.drawImage(pngAssets.front,0,0,W,H);
 }else if(!pngAssets.far){
  ctx.drawImage(front,0,0,W,H);
 }
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
const BAT_HOMES=[
 {x:62,y:14,size:.82},{x:151,y:10,size:1.05},{x:244,y:21,size:1.22},
 {x:340,y:13,size:.9},{x:429,y:18,size:1.12}
];
const bats=BAT_HOMES.map((p,i)=>({
 x:p.x,y:p.y,homeX:p.x,homeY:p.y,size:p.size,
 age:i%2?70:3,seed:i*1.7,mode:'rest',until:0,vx:0,vy:0,depth:i%3
}));
const fires=[{x:138,y:176,s:1.12}];
const fireY=176;
const torches=[{x:19,y:177},{x:462,y:172},{x:424,y:94}];
const embers=Array.from({length:34},()=>({
 x:138+rnd(-8,8),y:176-rnd(0,22),vx:rnd(-7,7),vy:rnd(-24,-5),
 life:rnd(.4,1.8),size:rnd(1,1.8)
}));
const foamBases=[{x:112,y:185,w:18}];
function spawnFoam(){
 const base=foamBases[0];
 return {base,x:base.x+rnd(-base.w/2,base.w/2),y:base.y-rnd(0,2),
  vx:rnd(-7,7),vy:rnd(-17,-5),life:rnd(.22,.72),size:rnd(1,1.8)};
}
const foam=Array.from({length:28},spawnFoam);

const hero={
 x:125,y:181,shadowY:181,fromX:125,fromY:181,targetX:125,targetY:181,
 start:0,segmentStart:0,duration:1,arc:0,mode:'sleep',displayMode:null,
 eventMode:null,eventUntil:0,eventStart:0,segment:null,routeIndex:0,dir:1,phase:0
};
const adventureRoute=[
 {x:125,y:181,mode:'sleep',duration:3.5},
 {x:125,y:181,mode:'idle',duration:1.0},
 {x:245,y:181,mode:'walk',duration:3.7},
 {x:285,y:181,mode:'jump',duration:1.05,arc:39},
 {x:344,y:181,mode:'run',duration:1.65},
 {x:344,y:118,mode:'climb',duration:2.45},
 {x:382,y:118,mode:'walk',duration:1.25},
 {x:382,y:118,mode:'slash',duration:2.6},
 {x:382,y:118,mode:'celebrate',duration:1.7},
 {x:344,y:118,mode:'walk',duration:1.25},
 {x:344,y:181,mode:'climb',duration:2.45,reverse:true},
 {x:285,y:181,mode:'jump',duration:1.05,arc:38},
 {x:245,y:181,mode:'jump',duration:1.05,arc:38},
 {x:75,y:181,mode:'walk',duration:4.25},
 {x:75,y:181,mode:'drink',duration:2.3},
 {x:125,y:181,mode:'walk',duration:2.1},
 {x:125,y:181,mode:'sleep',duration:4.2}
];
let hasInitialGitHubSnapshot=false;
function queueHeroReaction(mode,duration){
 hero.eventMode=mode;
 hero.eventStart=time;
 hero.eventUntil=time+duration;
}
function wakeBat(b,t){b.mode='fly';b.until=t+rnd(6,10);const a=rnd(-2.7,.4),speed=rnd(24,52)*(b.depth===0?.7:b.depth===1?1:1.2);b.vx=Math.cos(a)*speed;b.vy=Math.sin(a)*speed;b.y=b.homeY+8;}
function drawBat(c,b,t){
 const flap=Math.sin(t*12+b.seed);
 const wingLift=b.mode==='rest'?0:flap*5.5;
 c.save();
 c.translate(Math.round(b.x),Math.round(b.y));
 c.scale(b.size,b.size);

 // Wing outlines first, then dark membranes and subtle graphite ribs.
 if(b.mode==='rest'){
  poly(c,[[-1,-1],[-5,-5],[-10,-7],[-13,-4],[-12,1],[-8,0],[-6,5],[-2,3],[0,7],[2,3],[6,5],[8,0],[12,1],[13,-4],[10,-7],[5,-5],[1,-1]],'#2b243d');
  poly(c,[[-1,-1],[-5,-4],[-9,-5],[-11,-3],[-10,-1],[-7,-1],[-5,3],[-2,2],[0,5],[2,2],[5,3],[7,-1],[10,-1],[11,-3],[9,-5],[5,-4],[1,-1]],'#12101c');
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
function updateBats(dt){if(time>randomWake&&bats.filter(b=>b.mode==='fly').length<2){const idle=bats.filter(b=>b.mode==='rest');if(idle.length)wakeBat(idle[Math.floor(Math.random()*idle.length)],time);randomWake=time+rnd(55,95);}bats.forEach(b=>{if(b.mode==='rest'){b.x=b.homeX+Math.sin(time*1.8+b.seed)*.5;b.y=b.homeY+Math.sin(time*1.5+b.seed)*.5;return;}b.x=clamp(b.x+b.vx*dt,12,W-12);b.y=clamp(b.y+b.vy*dt+Math.sin(time*4+b.seed)*4*dt,24,145);if(b.x<=12||b.x>=W-12)b.vx*=-1;if(b.y<=12||b.y>=145)b.vy*=-1;if(time>b.until){b.mode='rest';b.homeX=clamp(b.x,25,W-25);b.homeY=10+(Math.floor(Math.abs(b.seed)*7)%15);}});}
function updateHero(dt){
 if(!hero.segment){
  const segment=adventureRoute[hero.routeIndex];
  hero.segment=segment;
  hero.fromX=hero.x;
  hero.fromY=hero.y;
  hero.targetX=segment.x;
  hero.targetY=segment.y;
  hero.segmentStart=time;
  hero.start=time;
  hero.duration=Math.max(.05,segment.duration);
  hero.arc=segment.arc||0;
  hero.mode=segment.mode;
  if(Math.abs(segment.x-hero.x)>.5)hero.dir=segment.x>hero.x?1:-1;
  hero.shadowY=hero.y;
 }

 const segment=hero.segment;
 const elapsed=time-hero.segmentStart;
 const moving=['walk','run','jump','climb'].includes(segment.mode);
 if(moving){
  const progress=clamp(elapsed/hero.duration,0,1);
  const eased=progress*progress*(3-2*progress);
  hero.shadowY=lerp(hero.fromY,hero.targetY,eased);
  hero.x=lerp(hero.fromX,hero.targetX,eased);
  hero.y=hero.shadowY;
  if(segment.mode==='jump')hero.y-=Math.sin(progress*Math.PI)*hero.arc;
  if(progress>=1){
   hero.x=hero.targetX;
   hero.y=hero.targetY;
   hero.shadowY=hero.targetY;
  }
 }

 if(elapsed>=hero.duration){
  hero.x=segment.x;
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
 const wave=Math.sin(time*7.5+i*1.7);
 const boost=performance.now()<state.boost?1.35:1;
 const x=f.x,y=f.y,r=(22+Math.abs(wave)*7)*f.s*boost;
 const halo=c.createRadialGradient(x,y,1,x,y,r);
 halo.addColorStop(0,'rgba(255,146,65,'+(.23*boost)+')');
 halo.addColorStop(.38,'rgba(255,104,43,.12)');
 halo.addColorStop(.72,'rgba(255,78,32,.045)');
 halo.addColorStop(1,'rgba(255,60,20,0)');
 c.save();
 c.globalCompositeOperation='screen';
 c.fillStyle=halo;
 c.fillRect(x-r,y-r,r*2,r*2);
 c.restore();
}
function drawWater(c,dt){
 const base=foamBases[0];

 // Fine moving highlights follow the waterfall already painted into layer-far.png.
 c.save();
 c.globalCompositeOperation='screen';
 for(let i=0;i<7;i++){
  const streamX=105+i*2.1+Math.sin(time*1.8+i*1.3)*.75;
  const streamY=137+((time*(19+i*2.2)+i*11)%47);
  const alpha=.09+(i%3)*.035;
  c.fillStyle='rgba(217,248,255,'+alpha+')';
  c.fillRect(Math.round(streamX),Math.round(streamY),1,4+(i%3)*2);
  if(i%2===0){
   c.fillStyle='rgba(217,248,255,'+(alpha*.7)+')';
   c.fillRect(Math.round(streamX+2),Math.round(streamY+8),1,3);
  }
 }

 // Low-opacity foam particles bounce where the original waterfall meets the pool.
 foam.forEach(p=>{
  p.x+=p.vx*dt;
  p.y+=p.vy*dt;
  p.vy+=49*dt;
  p.life-=dt;
  if(p.y>=base.y-1){
   p.y=base.y-1;
   p.vy=-Math.abs(p.vy)*.42;
   p.vx+=rnd(-2.5,2.5);
  }
  if(p.life<=0||Math.abs(p.x-base.x)>base.w)Object.assign(p,spawnFoam());
  c.globalAlpha=.16+clamp(p.life/.72,0,1)*.18;
  px(c,p.x,p.y,p.size,p.size,'#d9f8ff');
 });
 c.restore();
 c.globalAlpha=1;
}
function drawTorches(c){
 torches.forEach((p,i)=>{const f=.5+.5*Math.sin(time*14+i*2.25),r=13+f*9,g=c.createRadialGradient(p.x,p.y,1,p.x,p.y,r);g.addColorStop(0,'rgba(255,137,53,.31)');g.addColorStop(1,'rgba(255,80,20,0)');c.fillStyle=g;c.fillRect(p.x-r,p.y-r,r*2,r*2);px(c,p.x-5,p.y+2,10,3,'#24202b');px(c,p.x-2,p.y+4,4,7,'#573a31');px(c,p.x-6,p.y+9,12,2,'#171522');const fy=p.y+Math.sin(time*16+i)*1.2;poly(c,[[p.x-4,fy+4],[p.x-3,fy-2],[p.x-1,fy-8-f*3],[p.x+1,fy-4],[p.x+4,fy-9],[p.x+5,fy+4]],'#9b3c25');poly(c,[[p.x-3,fy+3],[p.x-1,fy-3],[p.x+1,fy-7],[p.x+4,fy+3]],'#ff9d35');px(c,p.x,fy-3,2,4,'#fff0aa');});
}
function drawEmbers(c,dt){
 for(let i=0;i<embers.length;i++){
  const p=embers[i];
  p.x+=p.vx*dt;
  p.y+=p.vy*dt;
  p.life-=dt;
  if(p.life<=0||p.y<fireY-48){
   embers[i]={
    x:138+rnd(-9,9),y:176,vx:rnd(-8,8),vy:rnd(-26,-7),
    life:rnd(.5,1.9),size:rnd(1,2)
   };
   continue;
  }
  c.globalAlpha=clamp(p.life,0,1);
  px(c,p.x,p.y,p.size,p.size,i%3?'#ffb85a':'#ff6c38');
  c.globalAlpha=1;
 }
}
function drawAtmosphericMist(c){
 const bands=[
  {y:48,w:94,h:3,speed:4.1,offset:12},
  {y:62,w:126,h:4,speed:2.7,offset:168},
  {y:82,w:108,h:3,speed:3.4,offset:276},
  {y:190,w:142,h:4,speed:2.1,offset:48},
  {y:207,w:118,h:3,speed:3.2,offset:226},
  {y:222,w:156,h:4,speed:1.7,offset:348}
 ];
 c.save();
 c.globalCompositeOperation='screen';
 bands.forEach((band,index)=>{
  const travel=(time*band.speed+band.offset)%(W+band.w);
  const x=travel-band.w;
  c.fillStyle='rgba(140, 165, 205, 0.07)';
  c.fillRect(Math.round(x),band.y,band.w,band.h);
  c.fillRect(Math.round(x+band.w+W-band.w),band.y,band.w,band.h);
  // Dithered edge pixels prevent the mist from reading as a solid UI-like bar.
  c.fillStyle='rgba(140, 165, 205, 0.035)';
  for(let j=0;j<8;j++){
   const dx=x+(j*17+index*7)%band.w;
   c.fillRect(Math.round(dx),band.y+(j%2?0:band.h),6+(j%3)*3,1);
  }
 });
 c.restore();
}
function drawCrystalGlow(c){[[90,204,1],[397,187,.85],[314,126,.65]].forEach(([x,y,s])=>{const a=.5+.5*Math.sin(time*2+x);c.fillStyle='rgba(159,77,255,'+(.06+a*.12)+')';c.fillRect(x-9*s,y-12*s,18*s,25*s);crystal(c,x,y,s);});}
function render(dt){
 ctx.imageSmoothingEnabled=false;
 ctx.fillStyle=C.void;
 ctx.fillRect(0,0,W,H);

 // The uploaded far layer is the complete cave composition. Transparent mid/front
 // overlays are optional; an empty/missing overlay must never cover the final artwork.
 drawSceneLayer('far',far,0);
 drawSceneLayer('mid',mid,0);
 drawAtmosphericMist(ctx);
 drawWater(ctx,dt);
 drawFrontLayer();
 drawCrystalGlow(ctx);
 fires.forEach(fire.bind(null,ctx));
 drawTorches(ctx);
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
if(hasInitialGitHubSnapshot){
 if(state.failed>previous.failed){
  queueHeroReaction('slash',2.6);
  const resting=bats.filter(b=>b.mode==='rest');
  if(resting.length)wakeBat(resting[Math.floor(Math.random()*resting.length)],time);
 }else if(state.total>previous.total||state.passed>previous.passed){
  queueHeroReaction('celebrate',2.0);
  state.boost=performance.now()+4200;
 }
}
hasInitialGitHubSnapshot=true;const level=Math.max(1,Math.floor(state.total/25)+1+Math.floor(state.passed/5)),hunger=clamp(100-Math.max(0,days-1)*27,5,100),water=clamp(100-days*10,8,100),evolution=clamp(16+level*8+state.passed*2,8,100);$('hungerBar').style.width=hunger+'%';$('waterBar').style.width=water+'%';$('evolutionBar').style.width=evolution+'%';$('level').textContent='Lv. '+level;$('hudCommits').textContent=new Intl.NumberFormat('pt-BR').format(state.total);$('hudRepos').textContent=state.repos;$('hudActivity').textContent=last?days===0?'Hoje':days+'d':'—';$('hudActions').textContent=state.pending?'RUN':state.failed?'FAIL':state.passed?'PASS':'—';$('totalCommits').textContent=new Intl.NumberFormat('pt-BR').format(state.total);$('lastCommit').textContent=last?(days===0?'hoje':days===1?'há 1 dia':'há '+days+' dias'):'Ainda não';$('lastCommitDate').textContent=last?new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium'}).format(new Date(last.date))+(last.repository?' · '+last.repository:''):'esperando atividade';$('hungerLabel').textContent=days>=7?'Faminto':days>=3?'Com fome':'Satisfeito';$('hungerDetail').textContent=days+' dia(s) desde o último commit';$('ciSummary').textContent=state.passed+' aprovadas · '+state.failed+' falhas · '+state.pending+' em andamento';$('ciLight').style.background=state.failed?'#ff4b64':state.pending?'#ffd16e':'#52ef91';$('testBar').style.width=(state.checked?state.passed/state.checked*100:0)+'%';$('testCount').textContent=state.checked?state.passed+'/'+state.checked+' workflows aprovados':'sem execuções classificadas';$('waterEvent').textContent=days===0?'+1 Água':'Água '+water+'%';$('waterDetail').textContent=days===0?'commit recente renova a jornada':'atividade recente mantém a fonte viva';$('qualityEvent').textContent=state.failed?'Build com falha':state.passed?'+1 Evolução':'Qualidade em construção';$('qualityDetail').textContent=state.failed?'marcas vermelhas no chão':state.passed+' workflows concluídos com sucesso';$('updateStatus').textContent='Dados coletados em '+new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(d.generatedAt||Date.now()))+' · '+state.repos+' repositórios públicos analisados.';const sha=last?.sha||'',runAt=ci.latestRunAt||'',oldSha=store('cc-sha'),oldRun=store('cc-run'),initial=oldSha===null&&oldRun===null;if(!initial&&sha&&oldSha&&sha!==oldSha){state.celebrate=time+5;state.boost=performance.now()+5500;$('waterEvent').textContent='+1 Água';$('waterDetail').textContent='novo commit detectado · explorador celebra';const b=bats.find(v=>v.mode==='rest');if(b)wakeBat(b,time);}if(!initial&&runAt&&oldRun&&runAt!==oldRun&&ci.latestConclusion==='success'){state.celebrate=time+5;state.boost=performance.now()+6000;$('qualityEvent').textContent='+1 Evolução';$('qualityDetail').textContent='execução verde detectada · caverna floresce';const b=bats.find(v=>v.mode==='rest');if(b)wakeBat(b,time);}if(oldSha===null)store('cc-sha',sha);else if(sha)store('cc-sha',sha);if(oldRun===null)store('cc-run',runAt);else if(runAt)store('cc-run',runAt);if(state.failed>0&&Math.random()<.15){const b=bats.find(v=>v.mode==='rest');if(b)wakeBat(b,time);}}
async function refresh(){try{const r=await fetch('./data/commits.json?ts='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);updateHUD(await r.json());}catch(e){$('updateStatus').textContent='Dados do GitHub indisponíveis; a caverna procedural continua ativa.';$('ciSummary').textContent='Resultados de CI indisponíveis.';console.warn('[Commit Cave]',e.message);}}
let frame=0;function loop(now){if(!frame)frame=now;const dt=Math.min(.04,(now-frame)/1000);frame=now;time+=dt;render(dt);requestAnimationFrame(loop);}requestAnimationFrame(loop);refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)frame=0;});
})();