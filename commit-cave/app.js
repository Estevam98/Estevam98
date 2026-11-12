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
const pngAssets={far:null,mid:null,front:null,hero:null};
const assetStatus={far:'loading',mid:'loading',front:'loading',hero:'loading'};
const LPC_FRAME_SIZE=64;
const LPC_MIN_OPAQUE_PIXELS=150;
let heroRowVisibility=new Map();
let heroFirstValidRow=-1;

// Scan every LPC row. A row is usable only when its first 64x64 frame
// contains at least 150 pixels whose alpha channel is greater than 128.
function inspectLpcRows(image){
 const visibility=new Map();
 const totalRows=Math.floor(image.naturalHeight/LPC_FRAME_SIZE);
 const probeCanvas=document.createElement('canvas');
 probeCanvas.width=LPC_FRAME_SIZE;
 probeCanvas.height=LPC_FRAME_SIZE;
 const probe=probeCanvas.getContext('2d',{willReadFrequently:true});
 if(!probe){
  console.warn('[Commit Cave] Canvas de inspeção indisponível; usando heroPixel().');
  return {visibility,firstValidRow:-1};
 }

 let firstValidRow=-1;
 try{
  for(let row=0;row<totalRows;row++){
   const sourceY=row*LPC_FRAME_SIZE;
   if(sourceY+LPC_FRAME_SIZE>image.naturalHeight){
    visibility.set(row,false);
    continue;
   }

   probe.clearRect(0,0,LPC_FRAME_SIZE,LPC_FRAME_SIZE);
   probe.drawImage(
    image,
    0,sourceY,LPC_FRAME_SIZE,LPC_FRAME_SIZE,
    0,0,LPC_FRAME_SIZE,LPC_FRAME_SIZE
   );

   const pixels=probe.getImageData(0,0,LPC_FRAME_SIZE,LPC_FRAME_SIZE).data;
   let opaquePixels=0;
   for(let i=3;i<pixels.length;i+=4){
    if(pixels[i]>128){
     opaquePixels++;
     if(opaquePixels>=LPC_MIN_OPAQUE_PIXELS)break;
    }
   }

   const valid=opaquePixels>=LPC_MIN_OPAQUE_PIXELS;
   visibility.set(row,valid);
   if(valid&&firstValidRow===-1)firstValidRow=row;
  }
  return {visibility,firstValidRow};
 }catch(error){
  console.warn('[Commit Cave] Falha ao inspecionar pixels LPC; usando heroPixel().',error);
  return {visibility:new Map(),firstValidRow:-1};
 }
}

function loadOptionalPng(key,src,isValid){
 const image=new Image();
 image.onload=()=>{
  if(!isValid(image)){
   assetStatus[key]='invalid';
   console.warn('[Commit Cave] Asset PNG inválido; usando fallback procedural:',src);
   return;
  }
  pngAssets[key]=image;
  assetStatus[key]='ready';
  if(key==='hero'){
   const scan=inspectLpcRows(image);
   heroRowVisibility=scan.visibility;
   heroFirstValidRow=scan.firstValidRow;
   if(heroFirstValidRow===-1){
    console.warn('[Commit Cave] Nenhuma linha LPC possui 150 pixels opacos. heroPixel() continuará ativo.');
   }
  }
 };
 image.onerror=()=>{
  assetStatus[key]='missing';
  console.info('[Commit Cave] Asset ausente; fallback procedural ativo:',src);
 };
 image.src=src;
}
loadOptionalPng('far','./assets/layer-far.png',img=>img.naturalWidth===W&&img.naturalHeight===H);
loadOptionalPng('mid','./assets/layer-mid.png',img=>img.naturalWidth===W&&img.naturalHeight===H);
loadOptionalPng('front','./assets/layer-front.png',img=>img.naturalWidth===W&&img.naturalHeight===H);
// Universal LPC sheets use 64x64 frames and dimensions aligned to the frame grid.
loadOptionalPng('hero','./assets/hero-sheet.png',img=>
 img.naturalWidth>=LPC_FRAME_SIZE&&img.naturalHeight>=LPC_FRAME_SIZE&&
 img.naturalWidth%LPC_FRAME_SIZE===0&&img.naturalHeight%LPC_FRAME_SIZE===0
);

function isLpcRowUsable(sheet,row){
 if(!Number.isInteger(row)||row<0)return false;
 if((row+1)*LPC_FRAME_SIZE>sheet.naturalHeight)return false;
 return heroRowVisibility.get(row)===true;
}

// Universal LPC row groups, all indexed from zero and facing right on the final row.
const LPC_ROWS={
 spellcast:{up:0,left:1,down:2,right:3},
 thrust:{up:4,left:5,down:6,right:7},
 walk:{up:8,left:9,down:10,right:11},
 slash:{up:12,left:13,down:14,right:15},
 hurt:{row:20}
};
const HERO_ANIMATIONS={
 idle:{row:LPC_ROWS.walk.right,frames:1,fps:1},
 walk:{row:LPC_ROWS.walk.right,frames:9,fps:9},
 run:{row:LPC_ROWS.walk.right,frames:9,fps:14},
 celebrate:{row:LPC_ROWS.spellcast.right,frames:7,fps:8},
 drink:{row:LPC_ROWS.thrust.right,frames:8,fps:6},
 sleep:{row:LPC_ROWS.hurt.row,frames:6,fps:3}
};
function drawSceneLayer(key,fallback,offsetX=0){
 const image=pngAssets[key];
 if(image){
  // Wrap the 480px layer horizontally so the parallax never exposes an empty seam.
  const x=((offsetX%W)+W)%W;
  ctx.drawImage(image,x-W,0,W,H);
  ctx.drawImage(image,x,0,W,H);
  return;
 }
 // Per-layer fallback: a missing PNG does not prevent the other PNGs from rendering.
 ctx.drawImage(fallback,offsetX,0);
 ctx.drawImage(fallback,offsetX-W,0);
}
function drawFrontLayer(){
 const image=pngAssets.front;
 if(image)ctx.drawImage(image,0,0,W,H);
 else ctx.drawImage(front,0,0);
}
function drawHeroSprite(){
 const sheet=pngAssets.hero;
 if(!sheet||heroFirstValidRow===-1){
  heroPixel(ctx,hero.x,hero.y,hero.mode,hero.dir);
  return;
 }

 const animation=HERO_ANIMATIONS[hero.mode]||HERO_ANIMATIONS.idle;
 let row=animation.row;
 let frameCount=animation.frames;

 // If the configured LPC row is sparse/empty, scan result provides the first
 // complete character row across the entire sheet (not just known animation rows).
 if(!isLpcRowUsable(sheet,row)){
  row=heroFirstValidRow;
  frameCount=1;
 }
 if(row<0||!isLpcRowUsable(sheet,row)){
  heroPixel(ctx,hero.x,hero.y,hero.mode,hero.dir);
  return;
 }

 const columns=Math.floor(sheet.naturalWidth/LPC_FRAME_SIZE);
 frameCount=Math.max(1,Math.min(frameCount,columns));
 const frame=Math.floor(time*animation.fps)%frameCount;
 const sx=frame*LPC_FRAME_SIZE;
 const sy=row*LPC_FRAME_SIZE;

 // Guard both axes before drawing so an absent/partial frame never becomes invisible.
 if(sx+LPC_FRAME_SIZE>sheet.naturalWidth||sy+LPC_FRAME_SIZE>sheet.naturalHeight){
  heroPixel(ctx,hero.x,hero.y,hero.mode,hero.dir);
  return;
 }

 ctx.save();
 ctx.imageSmoothingEnabled=false;
 ctx.translate(Math.round(hero.x),Math.round(hero.y));
 if(hero.dir===-1)ctx.scale(-1,1);
 ctx.drawImage(
  sheet,
  sx,sy,LPC_FRAME_SIZE,LPC_FRAME_SIZE,
  -32,-64,LPC_FRAME_SIZE,LPC_FRAME_SIZE
 );
 ctx.restore();
}

let time=0,last=0,randomWake=65;
const bats=Array.from({length:5},(_,i)=>({x:65+i*84,y:20+(i%2)*7,homeX:65+i*84,homeY:20+(i%2)*7,size:i===1||i===4?1.3:i===2?1.1:.82,age:i%2?70:3,seed:i*1.7,mode:'rest',until:0,vx:0,vy:0,depth:i%3}));
const fires=[{x:312,y:211,s:1.25}],torches=[{x:46,y:165},{x:355,y:164},{x:436,y:133}];
const embers=Array.from({length:34},()=>({x:260+rnd(-10,10),y:211-rnd(0,30),vx:rnd(-8,8),vy:rnd(-27,-7),life:rnd(.4,1.8),size:rnd(1,2)}));
const hero={x:248,y:207,fromX:248,fromY:207,targetX:248,targetY:207,start:0,duration:1,arc:0,mode:'idle',until:3,next:3,idx:0,dir:1,phase:0,activity:'rest'};
const route=[{x:108,y:167,a:'drink'},{x:155,y:167,a:'walk'},{x:208,y:207,a:'walk'},{x:258,y:207,a:'rest'},{x:372,y:178,a:'run'},{x:425,y:178,a:'drink'},{x:372,y:178,a:'walk'},{x:348,y:207,a:'walk'},{x:258,y:207,a:'rest'},{x:158,y:167,a:'walk'}];
function wakeBat(b,t){b.mode='fly';b.until=t+rnd(6,10);const a=rnd(-2.7,.4),speed=rnd(24,52)*(b.depth===0?.7:b.depth===1?1:1.2);b.vx=Math.cos(a)*speed;b.vy=Math.sin(a)*speed;b.y=b.homeY+8;}
function drawBat(c,b,t){c.save();c.translate(Math.round(b.x),Math.round(b.y));c.scale(b.size,b.size);if(b.mode==='rest'){c.translate(0,3);poly(c,[[-6,-5],[-4,-9],[0,-8],[4,-9],[6,-5],[3,-2],[0,0],[-3,-2]],'#20142a');poly(c,[[-8,-4],[-13,1],[-8,6],[-3,3],[0,1],[3,3],[8,6],[13,1],[8,-4],[4,-1],[-4,-1]],'#613174');px(c,-2,0,2,2,'#ffb7e7');px(c,2,0,2,2,'#ffb7e7');}else{const f=Math.sin(t*13+b.seed)*6;poly(c,[[-2,-1],[-7,-4-f],[-13,-8-f],[-12,0],[-7,5],[-2,3]],'#29142f');poly(c,[[2,-1],[7,-4-f],[13,-8-f],[12,0],[7,5],[2,3]],'#29142f');poly(c,[[-2,-1],[-7,-4-f],[-11,-6-f],[-9,0],[-5,3],[-2,2]],'#a638a7');poly(c,[[2,-1],[7,-4-f],[11,-6-f],[9,0],[5,3],[2,2]],'#ea54c9');px(c,-2,-2,4,8,'#201326');px(c,-2,0,1,1,'#fff0ad');px(c,2,0,1,1,'#fff0ad');}c.restore();}
function updateBats(dt){if(time>randomWake&&bats.filter(b=>b.mode==='fly').length<2){const idle=bats.filter(b=>b.mode==='rest');if(idle.length)wakeBat(idle[Math.floor(Math.random()*idle.length)],time);randomWake=time+rnd(55,95);}bats.forEach(b=>{if(b.mode==='rest'){b.x=b.homeX+Math.sin(time*1.8+b.seed)*.5;b.y=b.homeY+Math.sin(time*1.5+b.seed)*.5;return;}b.x=clamp(b.x+b.vx*dt,12,W-12);b.y=clamp(b.y+b.vy*dt+Math.sin(time*4+b.seed)*4*dt,12,145);if(b.x<=12||b.x>=W-12)b.vx*=-1;if(b.y<=12||b.y>=145)b.vy*=-1;if(time>b.until){b.mode='rest';b.homeX=clamp(b.x,25,W-25);b.homeY=16+(Math.floor(b.seed)%3)*5;}});}
function updateHero(dt){
 if(hero.mode==='idle'&&time>hero.next){
  const p=route[hero.idx++%route.length];hero.fromX=hero.x;hero.fromY=hero.y;hero.targetX=p.x;hero.targetY=p.y;
  hero.start=time;hero.dir=hero.targetX>=hero.x?1:-1;hero.activity=p.a;hero.mode=p.a==='run'?'run':'walk';
  const distance=Math.hypot(hero.targetX-hero.x,hero.targetY-hero.y);
  hero.duration=Math.max(1,distance/(hero.mode==='run'?66:42));
  hero.arc=Math.abs(hero.targetX-hero.x)>55?21:Math.abs(hero.targetY-hero.y)>12?9:0;
 }
 if(hero.mode==='walk'||hero.mode==='run'){
  const p=clamp((time-hero.start)/hero.duration,0,1),ease=p*p*(3-2*p);
  hero.x=lerp(hero.fromX,hero.targetX,ease);
  hero.y=lerp(hero.fromY,hero.targetY,ease)-Math.sin(p*Math.PI)*hero.arc;
  if(p>=1){hero.x=hero.targetX;hero.y=hero.targetY;hero.mode=hero.activity==='drink'?'drink':hero.activity==='rest'?'sleep':'idle';hero.until=time+(hero.mode==='sleep'?3.1:hero.mode==='drink'?2.1:0);hero.next=hero.until;}
 }
 if((hero.mode==='sleep'||hero.mode==='drink')&&time>hero.until){hero.mode='idle';hero.next=time+1.1;}
 if(time<state.celebrate)hero.mode='celebrate';else if(hero.mode==='celebrate')hero.mode='idle';
 hero.phase+=dt*(hero.mode==='run'?18:hero.mode==='walk'?11:2.8);
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
 const wave=Math.sin(time*10.5+i*1.9),boost=performance.now()<state.boost?1.6:1,x=f.x,y=f.y,s=f.s,r=(28+Math.abs(wave)*10)*s*boost;
 const halo=c.createRadialGradient(x,y,1,x,y,r);halo.addColorStop(0,'rgba(255,132,51,'+(.3*boost)+')');halo.addColorStop(.45,'rgba(255,83,25,.12)');halo.addColorStop(1,'rgba(255,60,20,0)');c.fillStyle=halo;c.fillRect(x-r,y-r,r*2,r*2);
 c.save();c.translate(x,y+4*s);c.rotate(-.22);px(c,-13*s,-2*s,26*s,5*s,'#241923');px(c,-12*s,-3*s,24*s,3*s,'#6f4431');px(c,-9*s,-2*s,17*s,1*s,'#b37b49');px(c,9*s,-2*s,3*s,2*s,'#d89b59');c.restore();
 c.save();c.translate(x,y+4*s);c.rotate(.25);px(c,-13*s,-2*s,26*s,5*s,'#211722');px(c,-11*s,-3*s,22*s,3*s,'#805039');px(c,-7*s,-2*s,15*s,1*s,'#c1844a');c.restore();
 poly(c,[[x-10*s,y+3*s],[x-8*s,y-6*s+wave*2],[x-5*s,y-13*s],[x-2*s,y-9*s],[x+1*s,y-23*s+wave],[x+4*s,y-13*s],[x+9*s,y-5*s],[x+11*s,y+3*s]],'#8f321f');
 poly(c,[[x-9*s,y+2*s],[x-6*s,y-8*s+wave],[x-2*s,y-15*s],[x+1*s,y-8*s],[x+5*s,y-18*s],[x+8*s,y-5*s],[x+9*s,y+2*s]],'#f15b27');
 poly(c,[[x-6*s,y+2*s],[x-3*s,y-8*s],[x,y-15*s],[x+3*s,y-8*s],[x+6*s,y+2*s]],'#ffb13d');
 poly(c,[[x-2*s,y+1*s],[x-1*s,y-6*s],[x+1*s,y-11*s],[x+3*s,y-3*s],[x+3*s,y+2*s]],'#fff0ad');
 smoke.forEach(p=>{p.x+=p.vx*.012;p.y+=p.vy*.012;p.life-=.012;if(p.life<=0||p.y<y-53*s){p.x=x+rnd(-4,4);p.y=y-8*s;p.vx=rnd(-4,4);p.vy=rnd(-8,-3);p.life=rnd(.5,1.8);}});
 for(const p of smoke){if(Math.abs(p.x-x)>9)continue;c.globalAlpha=clamp(p.life/1.8,0,.25);px(c,p.x,p.y,2,2,'#777080');}c.globalAlpha=1;
}
function drawWater(c,dt){
 const falls=[{x:119,top:130,bottom:215,w:15},{x:408,top:110,bottom:178,w:12},{x:74,top:224,bottom:258,w:22}];
 falls.forEach(f=>{px(c,f.x-4,f.top-4,f.w+8,5,'#151e34');px(c,f.x-2,f.top-2,f.w+4,2,'#91b8c8');px(c,f.x,f.top,f.w,f.bottom-f.top,'#07518f');
  for(let col=0;col<f.w;col+=3)for(let j=0;j<13;j++){const speed=30+j*3.7+col*1.2,y=f.top+(time*speed+j*17+col*5)%(f.bottom-f.top);px(c,f.x+col+Math.sin(time*4+j+col)*.8,y,1.5+(j%3===0?1:0),3+(j%4),j%5===0?'#d5f8ff':j%3===0?'#76e0ff':j%2?'#36b8e8':'#1378bd');}
  for(let j=0;j<6;j++){const xx=f.x+2+(j*7)%(f.w-1),yy=f.top+(time*(42+j*5)+j*23)%(f.bottom-f.top);px(c,xx,yy,1,7+(j%3)*3,'#e5fbff');}
  for(let j=0;j<12;j++){const xx=f.x-f.w/2+((j*8+Math.floor(time*14))%(f.w+14)),yy=f.bottom+Math.sin(time*8+j)*1.8;px(c,xx,yy,2+j%3,1,j%2?'#efffff':'#78e6ff');}
 });
 foam.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=55*dt;p.life-=dt;if(p.y>=p.base.y-1){p.y=p.base.y-1;p.vy=-Math.abs(p.vy)*.48;p.vx+=rnd(-3,3);}if(p.life<=0||Math.abs(p.x-p.base.x)>p.base.w)Object.assign(p,spawnFoam());c.globalAlpha=clamp(p.life/.9,0,.9);px(c,p.x,p.y,p.size,p.size,'#bdefff');});
 c.globalAlpha=1;for(let i=0;i<58;i++){const x=(i*37+Math.floor(time*16))%W,y=260+i%8;if(hash(i,54)>.35)px(c,x,y,2+i%3,1,i%2?'#5ed7ff':'#177dbc');}
 for(let i=0;i<5;i++){const x=85+i*76+Math.sin(time*1.7+i)*5,y=263+(i%2)*3,r=4+(time*8+i*7)%13;c.strokeStyle='rgba(128,224,255,.55)';c.lineWidth=1;c.beginPath();c.ellipse(x,y,r,2,0,0,Math.PI*2);c.stroke();}
}
function drawTorches(c){
 torches.forEach((p,i)=>{const f=.5+.5*Math.sin(time*14+i*2.25),r=13+f*9,g=c.createRadialGradient(p.x,p.y,1,p.x,p.y,r);g.addColorStop(0,'rgba(255,137,53,.31)');g.addColorStop(1,'rgba(255,80,20,0)');c.fillStyle=g;c.fillRect(p.x-r,p.y-r,r*2,r*2);px(c,p.x-5,p.y+2,10,3,'#24202b');px(c,p.x-2,p.y+4,4,7,'#573a31');px(c,p.x-6,p.y+9,12,2,'#171522');const fy=p.y+Math.sin(time*16+i)*1.2;poly(c,[[p.x-4,fy+4],[p.x-3,fy-2],[p.x-1,fy-8-f*3],[p.x+1,fy-4],[p.x+4,fy-9],[p.x+5,fy+4]],'#9b3c25');poly(c,[[p.x-3,fy+3],[p.x-1,fy-3],[p.x+1,fy-7],[p.x+4,fy+3]],'#ff9d35');px(c,p.x,fy-3,2,4,'#fff0aa');});
}
function drawEmbers(c,dt){for(let i=0;i<embers.length;i++){const p=embers[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0||p.y<100){embers[i]={x:312+rnd(-11,11),y:211,vx:rnd(-9,9),vy:rnd(-29,-8),life:rnd(.5,1.9),size:rnd(1,2)};continue;}c.globalAlpha=clamp(p.life,0,1);px(c,p.x,p.y,p.size,p.size,i%3?'#ffb85a':'#ff6c38');c.globalAlpha=1;}}
function drawCrystalGlow(c){[[90,204,1],[397,187,.85],[314,126,.65]].forEach(([x,y,s])=>{const a=.5+.5*Math.sin(time*2+x);c.fillStyle='rgba(159,77,255,'+(.06+a*.12)+')';c.fillRect(x-9*s,y-12*s,18*s,25*s);crystal(c,x,y,s);});}
function render(dt){
 ctx.imageSmoothingEnabled=false;
 ctx.fillStyle=C.void;
 ctx.fillRect(0,0,W,H);
 const fx=Math.sin(time*.07)*1.4,mx=Math.sin(time*.13);
 drawSceneLayer('far',far,fx);
 drawSceneLayer('mid',mid,mx);
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
 ctx.ellipse(hero.x,hero.y+1,13,2.4,0,0,Math.PI*2);
 ctx.fill();
 drawHeroSprite();
 if(hero.mode==='sleep'){
  ctx.fillStyle='#d8ebff';
  ctx.font='7px monospace';
  ctx.fillText('Z',hero.x+10,hero.y-34+Math.sin(time*2)*2);
 }
 if(state.failed>0&&Math.floor(time*2)%2===0){
  px(ctx,389,200,15,2,'#d1c4b5');
  px(ctx,392,195,10,3,'#eee1cb');
  px(ctx,388,196,3,4,'#eee1cb');
  px(ctx,402,196,3,4,'#eee1cb');
 }
}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;}
function updateHUD(d){const commits=Array.isArray(d.commits)?d.commits:[],last=d.lastCommit||commits.reduce((a,b)=>!a||new Date(b.date)>new Date(a.date)?b:a,null),days=last?.date?Math.max(0,Math.floor((Date.now()-new Date(last.date))/DAY)):7,ci=d.ci||{};Object.assign(state,{total:Number(d.totalCommits??commits.length),repos:Number(d.repositoriesScanned||0),passed:Number(ci.successfulRuns||0),failed:Number(ci.failedRuns||0),pending:Number(ci.pendingRuns||0),checked:Number(ci.checkedRuns||0),days});const level=Math.max(1,Math.floor(state.total/25)+1+Math.floor(state.passed/5)),hunger=clamp(100-Math.max(0,days-1)*27,5,100),water=clamp(100-days*10,8,100),evolution=clamp(16+level*8+state.passed*2,8,100);$('hungerBar').style.width=hunger+'%';$('waterBar').style.width=water+'%';$('evolutionBar').style.width=evolution+'%';$('level').textContent='Lv. '+level;$('hudCommits').textContent=new Intl.NumberFormat('pt-BR').format(state.total);$('hudRepos').textContent=state.repos;$('hudActivity').textContent=last?days===0?'Hoje':days+'d':'—';$('hudActions').textContent=state.pending?'RUN':state.failed?'FAIL':state.passed?'PASS':'—';$('totalCommits').textContent=new Intl.NumberFormat('pt-BR').format(state.total);$('lastCommit').textContent=last?(days===0?'hoje':days===1?'há 1 dia':'há '+days+' dias'):'Ainda não';$('lastCommitDate').textContent=last?new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium'}).format(new Date(last.date))+(last.repository?' · '+last.repository:''):'esperando atividade';$('hungerLabel').textContent=days>=7?'Faminto':days>=3?'Com fome':'Satisfeito';$('hungerDetail').textContent=days+' dia(s) desde o último commit';$('ciSummary').textContent=state.passed+' aprovadas · '+state.failed+' falhas · '+state.pending+' em andamento';$('ciLight').style.background=state.failed?'#ff4b64':state.pending?'#ffd16e':'#52ef91';$('testBar').style.width=(state.checked?state.passed/state.checked*100:0)+'%';$('testCount').textContent=state.checked?state.passed+'/'+state.checked+' workflows aprovados':'sem execuções classificadas';$('waterEvent').textContent=days===0?'+1 Água':'Água '+water+'%';$('waterDetail').textContent=days===0?'commit recente renova a jornada':'atividade recente mantém a fonte viva';$('qualityEvent').textContent=state.failed?'Build com falha':state.passed?'+1 Evolução':'Qualidade em construção';$('qualityDetail').textContent=state.failed?'marcas vermelhas no chão':state.passed+' workflows concluídos com sucesso';$('updateStatus').textContent='Dados coletados em '+new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(d.generatedAt||Date.now()))+' · '+state.repos+' repositórios públicos analisados.';const sha=last?.sha||'',runAt=ci.latestRunAt||'',oldSha=store('cc-sha'),oldRun=store('cc-run'),initial=oldSha===null&&oldRun===null;if(!initial&&sha&&oldSha&&sha!==oldSha){state.celebrate=time+5;state.boost=performance.now()+5500;$('waterEvent').textContent='+1 Água';$('waterDetail').textContent='novo commit detectado · explorador celebra';const b=bats.find(v=>v.mode==='rest');if(b)wakeBat(b,time);}if(!initial&&runAt&&oldRun&&runAt!==oldRun&&ci.latestConclusion==='success'){state.celebrate=time+5;state.boost=performance.now()+6000;$('qualityEvent').textContent='+1 Evolução';$('qualityDetail').textContent='execução verde detectada · caverna floresce';const b=bats.find(v=>v.mode==='rest');if(b)wakeBat(b,time);}if(oldSha===null)store('cc-sha',sha);else if(sha)store('cc-sha',sha);if(oldRun===null)store('cc-run',runAt);else if(runAt)store('cc-run',runAt);if(state.failed>0&&Math.random()<.15){const b=bats.find(v=>v.mode==='rest');if(b)wakeBat(b,time);}}
async function refresh(){try{const r=await fetch('./data/commits.json?ts='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);updateHUD(await r.json());}catch(e){$('updateStatus').textContent='Dados do GitHub indisponíveis; a caverna procedural continua ativa.';$('ciSummary').textContent='Resultados de CI indisponíveis.';console.warn('[Commit Cave]',e.message);}}
let frame=0;function loop(now){if(!frame)frame=now;const dt=Math.min(.04,(now-frame)/1000);frame=now;time+=dt;render(dt);requestAnimationFrame(loop);}requestAnimationFrame(loop);refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)frame=0;});
})();