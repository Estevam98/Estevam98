/* Commit Cave — unified 2D pixel-art platform scene.
 * All world geometry is drawn on one pixelated Phaser canvas. GitHub data drives bats,
 * water, vegetation, hero level, failure remains and scene ambience.
 */
(() => {
  if (!window.Phaser) return;
  const host = document.getElementById('caveFrame');
  if (!host || document.getElementById('commitCaveGame')) return;

  const mount = document.createElement('div');
  mount.id = 'commitCaveGame';
  mount.setAttribute('aria-label', 'Caverna 2D interativa: morcegos representam commits, a vegetação representa testes aprovados e ossos indicam falhas.');
  host.prepend(mount);

  const state = {
    totalCommits: 0, repositories: 0, successfulRuns: 0, failedRuns: 0,
    pendingRuns: 0, checkedRuns: 0, daysSinceCommit: 0, latestConclusion: null
  };
  let gameScene;
  const COLORS = {
    void: 0x070914, deepest: 0x0c1022, rock: 0x25253b, rockLight: 0x49415b,
    rockShade: 0x151729, blue: 0x1589e8, blueLight: 0x56d9ff,
    green: 0x38e66f, greenDark: 0x155a39, orange: 0xff8a35,
    gold: 0xffd66b, red: 0xff354f, purple: 0xb59bff, pink: 0xff4fcf
  };

  function preload() {
    this.load.svg('caveBackdrop', './assets/cave-backdrop.svg');
    this.load.svg('heroSprite', './assets/hero-explorer.svg');
    this.load.svg('batSprite', './assets/bat.svg');
    this.load.svg('fireSprite', './assets/fire.svg');
  }

  new Phaser.Game({
    type: Phaser.CANVAS,
    parent: mount,
    width: 960, height: 520,
    backgroundColor: '#070914',
    antialias: false, pixelArt: true, roundPixels: true,
    render: { pixelArt: true, antialias: false, roundPixels: true, transparent: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: { preload, create, update }
  });

  function create() {
    gameScene = this;
    this.cameras.main.setBackgroundColor('#070914');
    this.world = {
      rocks: [], water: [], grass: [], bats: [], embers: [],
      bones: [], crystals: [], torches: [], platforms: [], foliage: []
    };
    this.elapsed = 0;
    this.hero = { x: 315, y: 390, jump: 0, cheer: 0, hungry: false, mode: 'idle', modeUntil: 0, direction: 1 };
    this.add.image(480,260,'caveBackdrop').setDisplaySize(960,520).setDepth(0);
    drawBackdrop.call(this);
    drawPlatforms.call(this);
    drawWaterfalls.call(this);
    drawDecorations.call(this);
    drawHero.call(this);
    drawHud.call(this);
    this.rebuildBats();
    this.refreshWorldState();

    this.input.on('pointerdown', pointer => {
      const x = pointer.x, y = pointer.y;
      const hit = this.world.bats.some(b => Phaser.Math.Distance.Between(x, y, b.sprite.x, b.sprite.y) < 23);
      if (hit) return;
      if (y > this.scale.height * .42) {
        this.hero.cheer = 1.25;
        this.hero.jump = 1;
        this.hero.mode = 'walk';
        this.hero.modeUntil = this.elapsed + 2.5;
        this.hero.targetX = Phaser.Math.Clamp(x, 80, 900);
        this.hero.direction = this.hero.targetX >= this.hero.x ? 1 : -1;
      }
    });
    this.scale.on('resize', size => layout(size.width, size.height));
    window.addEventListener('commit-cave-state', event => {
      Object.assign(state, event.detail || {});
      this.rebuildBats();
      this.refreshWorldState();
    });
    layout(this.scale.width, this.scale.height);
    host.classList.add('phaser-ready');
  }

  function rect(x, y, w, h, color, alpha = 1, depth = 1) {
    const obj = gameScene.add.rectangle(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)), color, alpha);
    obj.setOrigin(.5).setDepth(depth);
    return obj;
  }
  function pixel(x, y, color, size = 4, depth = 2) { return rect(x, y, size, size, color, 1, depth); }
  function poly(points, color, alpha = 1, depth = 1) {
    const g = gameScene.add.graphics().setDepth(depth);
    g.fillStyle(color, alpha);
    g.fillPoints(points.map(p => new Phaser.Geom.Point(Math.round(p[0]), Math.round(p[1]))), true);
    return g;
  }
  function text(x, y, value, size = 10, color = '#e8e7ff', depth = 20) {
    return gameScene.add.text(x, y, value, { fontFamily: 'monospace', fontSize: size + 'px', color, fontStyle: 'bold', stroke: '#080914', strokeThickness: 2 }).setDepth(depth);
  }

  function drawBackdrop() {
    const w = 960, h = 520;
    rect(w/2,h/2,w,h,COLORS.void,1,-1);
    // Moonlit castle far behind the cave mouth.
    rect(295,190,235,255,0x101b3b,.95,0);
    rect(295,205,165,230,0x142954,.9,0);
    rect(300,145,38,130,0x0a122c,1,0);
    rect(300,125,18,30,0x0a122c,1,0);
    rect(365,160,28,100,0x0a122c,1,0);
    rect(365,140,12,25,0x0a122c,1,0);
    rect(425,180,32,120,0x0a122c,1,0);
    rect(425,157,14,27,0x0a122c,1,0);
    rect(300,180,3,110,COLORS.blue,.5,0);
    rect(365,194,3,88,COLORS.blue,.4,0);
    // Layered cave walls: irregular pixel rock clusters, not gradients or smooth vectors.
    for (let row=0; row<11; row++) {
      const y=25+row*31;
      for (let col=0; col<24; col++) {
        const x=col*42+(row%2)*20;
        const edge = x<150 || x>790 || y<75 || y>390;
        if (!edge && !(x<265 && y>130 && y<320) && !(x>560 && y>190 && y<340)) continue;
        const seed=(row*17+col*13)%7;
        const colors=[0x17192c,0x222238,0x302c43,0x393349,0x1a1d32,0x28253b,0x454057];
        const rock=rect(x,y,32+(seed%3)*3,17+(seed%2)*5,colors[seed],1,2);
        this.world.rocks.push(rock);
        rect(x-2,y-7,20,3,0x65516a,.5,2);
        if(seed===3 || seed===6) pixel(x+10,y+7,0x8e563c,3,3);
      }
    }
    // Stalactites and stalagmites are built as chunky stepped silhouettes.
    for(let i=0;i<18;i++){
      const x=i*57-8, len=16+(i*29)%65;
      for(let j=0;j<Math.ceil(len/8);j++) rect(x+j*2,25+j*7,14-j%3*2,8, j%2?0x29253b:0x171728,1,4);
    }
    for(let i=0;i<13;i++){
      const x=i*78+5, len=14+(i*17)%34;
      for(let j=0;j<Math.ceil(len/7);j++) rect(x+j*2,385-j*6,13-j%2*3,7,0x28233b,1,4);
    }
    // Warm-lit entrance and deep doorway.
    rect(695,272,145,180,0x42283a,1,3);
    rect(712,286,112,152,0x090a16,1,4);
    rect(725,300,86,130,0x03050d,1,4);
    for(let i=0;i<7;i++) rect(699+i*20,276,12,5,0x9a593b,1,5);
    // Cracks and mineral flecks.
    for(let i=0;i<95;i++){
      const x=(i*83+31)%950, y=(i*47+18)%385;
      if((x<130||x>820||y<70||y>345) && i%2===0) pixel(x,y,i%3?0x4a4059:0x9b633f,2+(i%3),4);
    }
    // Two hanging banners embedded in the wall.
    drawBanner.call(this,670,108,0x8e302d,'TESTES','QUALIDADE','☠');
    drawBanner.call(this,832,122,0x1c653d,'EVOLUÇÃO','É PROCESSO','✦');
    // Tool runes carved into the left wall.
    rect(86,230,126,168,0x080914,.95,8);
    rect(86,230,126,168,0x4a405a,.75,7).setStrokeStyle(2,0x6c5a78);
    const tools=['⚔ PLAYWRIGHT','⌘ POSTMAN','◇ GITHUB ACTIONS','JS JAVASCRIPT','PY PYTHON','◈ GIT'];
    tools.forEach((label,i)=>{
      text(39,171+i*25,label,10,i===2?'#86b9ff':'#aaa2c7',9);
      rect(146,190+i*25,2,2,0x9b8cae,1,9);
    });
  }

  function drawBanner(x,y,color,line1,line2,symbol){
    poly([[x,y],[x+104,y],[x+100,y+82],[x+52,y+101],[x+4,y+82]],color,.92,9);
    poly([[x+7,y+5],[x+97,y+5],[x+93,y+77],[x+52,y+91],[x+11,y+77]],0x100e1d,.72,10);
    text(x+15,y+20,line1,10,'#ffb8a7',11);
    text(x+15,y+39,line2,10,'#ffb8a7',11);
    text(x+41,y+59,symbol,17,'#ffb8a7',11);
    rect(x+5,y+2,94,3,color,1,11);
  }

  function drawPlatforms(){
    // Broken stone ledges create a side-scrolling platformer silhouette.
    const ledges=[
      [0,375,230,24],[0,445,270,18],[270,405,190,20],
      [440,385,180,24],[600,420,360,22],[280,470,250,18],
      [0,500,960,25]
    ];
    ledges.forEach(([x,y,w,h],i)=>{
      rect(x+w/2,y,w,h,0x151526,1,10);
      rect(x+w/2,y-5,w,8,i%2?0x5d4350:0x66505b,1,11);
      rect(x+w/2,y+5,w,h-7,0x29243a,1,11);
      for(let xx=x+7;xx<x+w;xx+=24){
        rect(xx,y+4,2,h-5,0x0b0c18,1,12);
        if((xx/24|0)%3===0) rect(xx+5,y-6,7,3,0x8c634d,1,12);
      }
    });
    // A bridge of broken timber and iron.
    for(let i=0;i<8;i++){
      rect(110+i*17,365,17,7,i%2?0x855035:0x5e382f,1,13);
      rect(110+i*17,360,14,3,0xd58b45,1,13);
    }
  }

  function drawWaterfalls(){
    for(const waterfall of [{x:145,y:418,h:75},{x:867,y:423,h:72}]){
      rect(waterfall.x,waterfall.y+waterfall.h/2,22,waterfall.h,0x0876c8,.95,12);
      rect(waterfall.x-5,waterfall.y+waterfall.h/2,5,waterfall.h,0x35b9ff,.9,13);
      rect(waterfall.x+7,waterfall.y+waterfall.h/2,4,waterfall.h,0x8beaff,.9,13);
      for(let i=0;i<9;i++){
        const p=rect(waterfall.x-7+(i%4)*5,waterfall.y+(i*17)%waterfall.h,3,8,i%2?0x8beaff:0x168fff,.9,14);
        this.world.water.push(p);
      }
      rect(waterfall.x,waterfall.y+waterfall.h,45,5,0x168fff,.85,14);
      for(let i=0;i<5;i++) pixel(waterfall.x-17+i*8,waterfall.y+waterfall.h+7,0x63dfff,3,14);
    }
    // Collectible blue water vials.
    drawItem.call(this,214,432,'water');
    drawItem.call(this,829,450,'crystal');
  }

  function drawItem(x,y,type){
    if(type==='water'){
      rect(x,y,14,20,0x0a2440,1,16);
      rect(x,y-2,8,4,0x9a6a35,1,17);
      rect(x,y+2,8,10,0x1c9dff,1,17);
      pixel(x-2,y,0x75e5ff,3,18);
      pixel(x+3,y+5,0xd5f8ff,3,18);
    } else {
      poly([[x,y-12],[x+8,y],[x,y+13],[x-8,y]],0x37f4b1,1,16);
      poly([[x,y-8],[x+4,y],[x,y+7]],0xb2ffe0,1,17);
    }
  }

  function drawDecorations(){
    // Torches flicker against the stone; moss grows only with successful tests.
    for(const t of [{x:31,y:291},{x:603,y:320},{x:827,y:290}]){
      rect(t.x,t.y+16,7,25,0x5e3a31,1,12);
      rect(t.x,t.y+3,11,12,0xff6d2d,1,14);
      pixel(t.x,t.y-2,0xffd56a,5,15);
      pixel(t.x+2,t.y+6,0xfff1a1,3,15);
      const flame=rect(t.x,t.y-6,4,5,0xffe18a,1,16);
      const flameCore=rect(t.x,t.y+1,3,4,0xff762e,1,16);
      this.world.torches.push({x:t.x,y:t.y,flame,flameCore});
    }
    for(let i=0;i<34;i++){
      const x=8+i*29, y=389+(i%3)*5;
      const g=rect(x,y,3,5,0x2f9c51,.75,13);
      this.world.grass.push(g);
    }
    for(let i=0;i<14;i++){
      const x=460+(i*31)%450, y=356+(i%4)*5;
      const g=rect(x,y,4,8,0x38d45d,.8,13);
      this.world.foliage.push(g);
    }
    // Scattered glowing mineral crystals.
    for(const [x,y,c] of [[253,352,0x298fff],[580,350,0x8d6cff],[900,370,0x33e8ff],[475,322,0x9d7cff]]){
      poly([[x,y-10],[x+5,y],[x,y+10],[x-5,y]],c,.9,14);
      pixel(x,y-2,0xd9f7ff,2,15);
      this.world.crystals.push({x,y,base:c});
    }
    // Bones appear only if the latest relevant test workflows are failing.
    this.world.bonesGroup = this.add.container(490,448).setDepth(17);
    const boneColor=0xd9c9b6;
    const bone=rect(0,0,30,3,boneColor,1,17);bone.setAngle(-18);this.world.bonesGroup.add(bone);
    const bone2=rect(0,0,27,3,boneColor,1,17);bone2.setAngle(22);this.world.bonesGroup.add(bone2);
    [[-15,-4],[-15,4],[15,-4],[15,4],[-12,-3],[-12,3],[12,-3],[12,3]].forEach(([x,y])=>this.world.bonesGroup.add(rect(x,y,5,5,boneColor,1,17)));
    this.world.bonesGroup.setVisible(false);
    this.world.failureLabel=text(456,420,'TESTE FALHOU',10,'#ff667b',18).setVisible(false);
    this.world.failureMark=text(484,402,'!',20,'#ff354f',18).setVisible(false);
  }

  function drawHero(){
    this.heroParts=this.add.image(315,390,'heroSprite').setOrigin(.5,1).setScale(1.65).setDepth(19);
    // Original chunky sprite: dark skin, textured hair, beard, leather tunic and boots.
    part(0,22,42,5,0x070914);
    part(-12,-18,8,26,0x2a202d); part(12,-18,8,26,0x2a202d);
    part(-12,-6,10,7,0x70412f);part(12,-6,10,7,0x70412f);
    part(0,-35,27,30,0x4a2c2b);
    part(0,-43,27,15,0x2a1c28);
    part(-12,-42,6,9,0x171321);part(-5,-48,7,8,0x171321);part(3,-45,7,7,0x171321);part(10,-41,5,8,0x171321);
    part(-13,-30,4,12,0x2a1c28);part(13,-30,4,12,0x2a1c28);
    part(0,-30,23,24,0x9b5b3e);
    part(-7,-34,4,4,0x090914);part(7,-34,4,4,0x090914);
    part(0,-27,4,5,0x75412f);
    part(0,-20,16,8,0x32202a);
    part(-2,-18,5,3,0x16111a);
    part(0,-4,30,31,0x86503b);
    part(-2,-7,34,7,0xb47b48);
    part(-18,-1,7,24,0x9b5b3e);part(18,-1,7,24,0x9b5b3e);
    part(-20,18,8,7,0x9b5b3e);part(20,18,8,7,0x9b5b3e);
    part(-8,25,10,20,0x30212b);part(8,25,10,20,0x30212b);
    part(-8,43,13,5,0x62402e);part(8,43,13,5,0x62402e);
    // Belt pouch and a small blue water charm.
    part(12,7,7,10,0x3a2b35);part(13,8,4,4,0x258cff);
    this.heroShadow=rect(315,436,44,7,0x03040a,.8,18);
    this.heroAura=rect(315,386,50,2,0xffa74a,.2,18);
  }

  function drawHud(){
    // HUD inside the game viewport, styled as an actual game status display.
    rect(153,42,274,54,0x050812,.95,25).setStrokeStyle(2,0x6375a2);
    text(27,22,'LUCAS ESTEVAM',10,'#f2e9ff',26);
    text(28,48,'♥ FOME',9,'#ff6076',26);
    rect(112,54,150,8,0x20243c,1,26);
    this.hungerFill=rect(112,54,144,4,0xff4058,1,27);
    text(28,67,'♦ ÁGUA',9,'#63d8ff',26);
    rect(112,73,150,8,0x20243c,1,26);
    this.waterFill=rect(112,73,144,4,0x21baff,1,27);
    text(28,86,'✦ EVOLUÇÃO',9,'#69f58b',26);
    rect(112,92,150,8,0x20243c,1,26);
    this.evolutionFill=rect(112,92,30,4,0x43e36e,1,27);
    rect(777,42,155,54,0x050812,.95,25).setStrokeStyle(2,0x6375a2);
    text(790,51,'COMMITS',8,'#68caff',26);
    this.commitText=text(790,66,'0',14,'#f3efff',26);
    text(847,51,'REPOS',8,'#68caff',26);
    this.repoText=text(847,66,'0',14,'#f3efff',26);
    text(890,51,'ACTIONS',8,'#68caff',26);
    this.actionsText=text(890,66,'—',11,'#70f58f',26);
    this.message=text(480,474,'CADA COMMIT DEIXA UMA PEGADA',10,'#d3c7e8',26).setOrigin(.5);
    this.levelText=text(40,116,'NÍVEL 1 · EXPLORADOR',9,'#ffd66b',26);
  }

  function rebuildBats(){
    if(!gameScene || !gameScene.world) return;
    gameScene.world.bats.forEach(b=>b.sprite.destroy());
    gameScene.world.bats=[];
    const commits=Array.isArray(window.commitCaveCommits)?window.commitCaveCommits:[];
    const total=Math.max(0,Number(state.totalCommits)||commits.length);
    const count=Math.min(44,Math.max(total?Math.min(total,12):7,Math.min(44,Math.ceil(total/2))));
    for(let i=0;i<count;i++){
      const commit=commits[i]||null;
      const ageDays=commit?.date?Math.max(0,(Date.now()-new Date(commit.date).getTime())/86400000):i%40;
      const sprite=gameScene.add.image(180+(i*71)%590,130+(i*43)%205,'batSprite').setDepth(15).setScale(ageDays<3?1.05:ageDays<30?.9:.72);
      sprite.setTint(ageDays<3?0xffd66b:ageDays<30?0xff4fcf:0xb59bff);
      sprite.setInteractive({useHandCursor:true});
      sprite.on('pointerdown',()=>{if(commit?.url)window.open(commit.url,'_blank','noopener,noreferrer');else if(commit?.repository)window.open('https://github.com/Estevam98/'+commit.repository,'_blank','noopener,noreferrer');});
      const b={sprite,seed:i*.83,baseY:130+(i*43)%205,baseX:180+(i*71)%590,ageDays,url:commit?.url,repository:commit?.repository};
      gameScene.world.bats.push(b);
    }
  }

  function refreshWorldState(){
    if(!gameScene || !gameScene.world) return;
    const s=gameScene, success=Number(state.successfulRuns)||0, failed=Number(state.failedRuns)||0, pending=Number(state.pendingRuns)||0;
    const total=Number(state.totalCommits)||0, level=Math.max(1,Math.floor(total/25)+1+Math.floor(success/5));
    const days=Number(state.daysSinceCommit)||0;
    s.hungerFill.width=144*Math.max(.04,Math.min(1,18+Math.max(0,days-1)*20)/100);
    s.waterFill.width=144*Math.max(.05,Math.min(1,1-Math.min(days,10)*.08));
    s.evolutionFill.width=144*Math.max(.06,Math.min(1,(12+level*7+Math.min(success,10)*2)/100));
    s.commitText.setText(new Intl.NumberFormat('pt-BR').format(total));
    s.repoText.setText(String(state.repositories||0));
    s.actionsText.setText(pending?'RUN':failed?'FAIL':success?'PASS':'—').setColor(pending?'#ffd66b':failed?'#ff4058':success?'#70f58f':'#b7c3e7');
    s.levelText.setText('NÍVEL '+level+' · EXPLORADOR');
    s.world.bonesGroup.setVisible(failed>0);
    s.world.failureLabel.setVisible(failed>0);
    s.world.failureMark.setVisible(failed>0);
    s.world.grass.forEach((g,i)=>g.setAlpha(success?Math.min(1,.25+success*.12):.05));
    s.world.foliage.forEach((g,i)=>g.setAlpha(success?Math.min(1,.2+success*.1):.08));
    s.world.crystals.forEach((c,i)=>{});
    s.message.setText(failed?'TESTES FALHARAM · MARCAS VERMELHAS':pending?'TESTES EM EXECUÇÃO · A CAVERNA AGUARDA':success?'TESTES VERDES · A CAVERNA FLORESCE':'CADA COMMIT DEIXA UMA PEGADA');
    s.message.setColor(failed?'#ff6a7d':pending?'#ffd66b':success?'#73ff9a':'#d3c7e8');
    s.hero.hungry=days>=3;
    s.heroAura.setFillStyle(s.hero.hungry?COLORS.red:success?COLORS.green:COLORS.orange);
    s.heroAura.setAlpha(s.hero.hungry?.65:.2);
    s.heroParts.setAlpha(s.hero.hungry?.8:1);
  }

  function layout(_w,_h){
    if(!gameScene || !gameScene.world) return;
    // Phaser Scale.FIT scales the canvas to its parent; keep world coordinates stable.
    gameScene.cameras.main.setZoom(1);
    gameScene.cameras.main.setScroll(0,0);
  }

  function update(_time,delta){
    this.elapsed+=delta/1000;
    const t=this.elapsed, h=this.scale.height;
    this.world.bats.forEach((b,i)=>{
      b.sprite.x=b.baseX+Math.sin(t*.42+b.seed)*22;
      b.sprite.y=b.baseY+Math.sin(t*(.65+(i%4)*.13)+b.seed)*11;
      b.sprite.setScale((b.ageDays<3?1.05:b.ageDays<30?.9:.72), (b.ageDays<3?1.05:b.ageDays<30?.9:.72)*(0.72+Math.abs(Math.sin(t*10+b.seed))*.45));
    });
    this.world.water.forEach((p,i)=>{p.y+=Math.sin(t*4+i)*.06;p.setAlpha(.55+.4*Math.abs(Math.sin(t*3+i)));});
    this.world.grass.forEach((g,i)=>{g.angle=Math.sin(t*2+i)*8;});
    this.world.foliage.forEach((g,i)=>{g.angle=Math.sin(t*2.3+i)*12;});
    this.world.torches.forEach((f,i)=>{
      const flicker=Math.sin(t*14+i*2);
      f.flame.y=f.y-6-(flicker>0?3:0);
      f.flame.setFillStyle(flicker>0?0xffe18a:0xff762e);
      f.flameCore.y=f.y+1+(flicker<0?2:0);
      f.flameCore.setAlpha(.7+Math.abs(flicker)*.3);
    });
    if(this.hero.mode==='walk' && this.hero.targetX!==undefined){
      const distance=this.hero.targetX-this.hero.x;
      this.hero.x+=Math.sign(distance)*Math.min(Math.abs(distance),delta*.085);
      if(Math.abs(distance)<2 || t>this.hero.modeUntil){this.hero.mode='idle';this.hero.targetX=undefined;}
    }
    if(this.hero.mode==='idle' && !this.hero.hungry && Math.sin(t*.07)>.998){this.hero.mode='sleep';this.hero.modeUntil=t+4;}
    if(this.hero.mode==='sleep' && t>this.hero.modeUntil)this.hero.mode='idle';
    this.heroParts.x=this.hero.x+Math.sin(t*2)*1.5;
    this.heroParts.y=this.hero.y+(this.hero.hungry?Math.sin(t*4)*2:this.hero.mode==='sleep'?4+Math.sin(t*3)*1.5:Math.sin(t*2)*1);
    this.heroParts.setAngle(this.hero.mode==='walk'?Math.sin(t*12)*5:this.hero.mode==='sleep'?-5:0);
    if(this.hero.cheer>0){this.hero.cheer-=delta/1000;this.heroParts.y-=Math.abs(Math.sin(t*13))*8;}
    this.heroShadow.x=this.heroParts.x;this.heroAura.x=this.heroParts.x;
    this.heroShadow.y=this.hero.y+47;this.heroAura.y=this.hero.y-58;
    this.world.bonesGroup.angle=Math.sin(t*2)*3;
  }
})();