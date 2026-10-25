/* Commit Cave — Phaser 3 pixel-art layer. Visual effects are driven by published GitHub state. */
(() => {
  if (!window.Phaser) return;
  const host = document.getElementById('caveFrame');
  if (!host || document.getElementById('commitCaveGame')) return;
  const mount = document.createElement('div');
  mount.id = 'commitCaveGame';
  mount.setAttribute('aria-hidden', 'true');
  Object.assign(mount.style, { position:'absolute', inset:'0', zIndex:'8', pointerEvents:'none', overflow:'hidden' });
  host.appendChild(mount);

  const sceneData = window.commitCaveState || { successfulRuns:0, failedRuns:0, pendingRuns:0, totalCommits:0 };
  const game = new Phaser.Game({
    type: Phaser.CANVAS, parent: mount, width: 1280, height: 720,
    transparent: true, antialias: false, pixelArt: true, roundPixels: true,
    render: { pixelArt:true, antialias:false, roundPixels:true },
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: { create, update }
  });
  let hero, heroShadow, bats=[], embers=[], water=[], grass=[], time=0, statusLabel;
  function rect(scene,x,y,w,h,color,alpha=1){const r=scene.add.rectangle(x,y,w,h,color,alpha);r.setOrigin(.5);return r;}
  function pixel(scene,x,y,w,h,color){return rect(scene,x,y,w,h,color);}
  function create(){
    const s=this, w=this.scale.width, h=this.scale.height;
    // Distant castle silhouette, moonlight and rock strata use crisp block geometry.
    const moon=rect(s,w*.30,h*.39,52,52,0x6fa8ff,.13); moon.setDepth(0);
    for(let i=0;i<9;i++){
      const x=w*(.12+i*.085), base=h*.66;
      const tower=rect(s,x,base-(i%3)*20,18,100+(i%4)*19,0x07152d,.75); tower.setDepth(0);
      rect(s,x,base-68-(i%3)*20,9,26,0x07152d,.9).setDepth(0);
      rect(s,x,base-84-(i%3)*20,3,18,0x07152d,.9).setDepth(0);
    }
    // Pixel water shimmer and grass tufts react to test health.
    for(let i=0;i<20;i++){
      water.push(rect(s,w*(.07+(i%5)*.022),h*(.78+Math.floor(i/5)*.035),8+(i%3)*4,3,0x27baff,.65));
      grass.push(rect(s,w*(.03+i*.047),h*.79,3,10+(i%4)*3,0x45d75c,.8));
    }
    // Embers orbit the fire, with integer-position motion for retro rendering.
    for(let i=0;i<18;i++){
      const e=rect(s,w*.51+(Math.random()-.5)*42,h*.79-Math.random()*60,3,3,[0xffc75c,0xff6c32,0xffe6a1][i%3],.8);
      e.setData('phase',Math.random()*6.28);e.setData('rise',10+Math.random()*45);embers.push(e);
    }
    // Hero is built as a pixel sprite from chunky rectangles, not emoji or smooth vectors.
    heroShadow=rect(s,w*.30,h*.78,28,5,0x050712,.8);
    hero=s.add.container(w*.30,h*.70); hero.setDepth(20);
    const px=(x,y,ww,hh,c)=>{const q=rect(s,x,y,ww,hh,c);hero.add(q);return q;};
    px(0,-18,20,23,0x7e4a32); px(0,-29,18,14,0x9b5d3d);px(-7,-34,5,5,0x211520);px(5,-34,5,5,0x211520);
    px(0,-43,18,12,0x241825);px(-7,-42,5,8,0x241825);px(8,-42,4,7,0x241825);
    px(0,-8,23,18,0x8b5a35);px(-14,-7,6,15,0x9b5d3d);px(14,-7,6,15,0x9b5d3d);
    px(-6,9,6,15,0x28202a);px(7,9,6,15,0x28202a);px(-7,17,10,5,0x65402d);px(6,17,10,5,0x65402d);
    // Bats have angular, mirrored wings and distinct commit-age colors.
    const count=Math.min(30,Math.max(8,Math.floor(Number(sceneData.totalCommits||40)/3)));
    for(let i=0;i<count;i++){
      const x=w*(.12+((i*37)%76)/100), y=h*(.23+((i*19)%43)/100);
      const c=this.add.container(x,y).setDepth(10);
      const ageColor=i%3===0?0xff4bd6:i%3===1?0xb477ff:0x7e85b7;
      const body=rect(this,0,0,8,6,0x171126);
      const left=rect(this,-8,-1,12,5,ageColor);left.setAngle(-12);
      const right=rect(this,8,-1,12,5,ageColor);right.setAngle(12);
      const ears=rect(this,0,-5,4,5,ageColor);
      c.add([left,right,body,ears]);c.setData('left',left);c.setData('right',right);c.setData('seed',i*.7);c.setData('baseY',y);c.setData('speed',.5+(i%7)*.11);
      bats.push(c);
    }
    statusLabel=this.add.text(w*.5,h*.93,'COMMIT CAVE · MUNDO VIVO',{fontFamily:'monospace',fontSize:'10px',color:'#c8d9ff'}).setOrigin(.5).setDepth(30).setAlpha(.75);
    // Optional interaction: hover/tap the scene to make the hero celebrate; no controls are required.
    this.input.on('pointerdown', p=>{hero.setData('celebrateUntil',time+1.8);});
    this.scale.on('resize', size=>layout(size.width,size.height));
    layout(w,h);
  }
  function layout(w,h){
    if(!hero)return;
    hero.setPosition(w*.30,h*.70);heroShadow.setPosition(w*.30,h*.78);
    bats.forEach((b,i)=>{b.setPosition(w*(.12+((i*37)%76)/100),h*(.23+((i*19)%43)/100));b.setData('baseY',b.y);});
    embers.forEach(e=>e.setPosition(w*.51+(Math.random()-.5)*42,h*.79-Math.random()*60));
    statusLabel?.setPosition(w*.5,h*.93);
  }
  function update(_t,delta){
    time+=delta/1000;const w=this.scale.width,h=this.scale.height;
    bats.forEach((b,i)=>{
      const flap=Math.sin(time*9+b.getData('seed'))*20;
      b.getData('left').setAngle(-flap);b.getData('right').setAngle(flap);
      b.y=b.getData('baseY')+Math.sin(time*b.getData('speed')+b.getData('seed'))*7;
      b.x+=Math.sin(time*.55+i)*.08;
      if(b.x>w*.91)b.x=w*.12;if(b.x<w*.09)b.x=w*.88;
    });
    embers.forEach(e=>{e.y-=.18*e.getData('rise')*delta/1000;if(e.y<h*.57){e.y=h*.79;e.x=w*.51+(Math.random()-.5)*42;}e.x+=Math.sin(time*4+e.getData('phase'))*.2;e.setAlpha(.4+.5*Math.abs(Math.sin(time*3+e.getData('phase'))));});
    water.forEach((p,i)=>p.setAlpha(.35+.6*Math.abs(Math.sin(time*3+i))));
    const failed=Number(sceneData.failedRuns||0)>0, success=Number(sceneData.successfulRuns||0)>0;
    grass.forEach((g,i)=>g.setAlpha(success?(.35+.6*Math.abs(Math.sin(time*2+i))):.12));
    statusLabel.setColor(failed?'#ff6677':success?'#7dff9a':'#c8d9ff');
    hero.y=h*.70+Math.sin(time*2)*1.5;
    if(hero.getData('celebrateUntil')>time){hero.y-=Math.abs(Math.sin(time*12))*8;hero.setScale(1,1+Math.abs(Math.sin(time*12))*.08);}
    else hero.setScale(1,1);
  }
  window.addEventListener('commit-cave-state',e=>{
    Object.assign(sceneData,e.detail||{});
    bats.forEach((b,i)=>{const color=sceneData.failedRuns?0xff5267:sceneData.successfulRuns?0xff54dc:(i%2?0xb477ff:0xff4bd6);b.list[0].setFillStyle(color);b.list[1].setFillStyle(color);});
  });
})();
