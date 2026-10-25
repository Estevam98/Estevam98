const $ = (id) => document.getElementById(id);
const DAY = 86400000;
const formatDate = (value) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value));
const ageDays = (value) => Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / DAY));
const relative = (days) => days === 0 ? 'hoje' : days === 1 ? 'há 1 dia' : 'há ' + days + ' dias';

function setHunger(lastDate) {
  const days = lastDate ? ageDays(lastDate) : null;
  const caveman = $('caveman');
  const thought = $('thought');
  const mood = $('caveMood');
  if (days === null || days >= 3) {
    caveman.classList.add('hungry');
    $('hungerLabel').textContent = days === null || days >= 7 ? 'Faminto' : 'Com fome';
    $('hungerDetail').textContent = days === null ? 'nenhuma pegada encontrada' : days + ' dias sem novos commits';
    thought.textContent = days === null ? 'Onde foram parar todos os commits?' : days >= 7 ? 'Minha fogueira está acesa... mas preciso de um commit.' : 'Estou começando a sentir falta de um novo commit...';
    mood.textContent = 'O explorador está com fome';
    thought.classList.add('show');
  } else {
    caveman.classList.remove('hungry');
    $('hungerLabel').textContent = 'Satisfeito';
    $('hungerDetail').textContent = days === 0 ? 'energia renovada hoje' : 'a chama segue firme';
    thought.textContent = days === 0 ? 'Um novo commit! A caverna está viva!' : 'A fogueira continua acesa. Seguimos!';
    mood.textContent = days === 0 ? 'A caverna ganhou vida!' : 'A chama está tranquila';
    thought.classList.toggle('show', days === 0);
  }
}

function renderBats(commits) {
  const container = $('bats');
  container.replaceChildren();
  // Show the newest 36 commits as visible sprites; the counter still includes the complete history.
  const visible = [...commits].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 36);
  visible.forEach((commit, index) => {
    const days = ageDays(commit.date);
    const bat = document.createElement('a');
    bat.className = 'bat ' + (days < 3 ? 'young' : days < 30 ? 'grown' : 'old');
    bat.href = commit.url || '#';
    bat.target = '_blank';
    bat.rel = 'noreferrer';
    bat.title = (commit.message || 'Commit') + ' — ' + formatDate(commit.date) + ' (' + relative(days) + ')';
    bat.setAttribute('aria-label', bat.title);
    bat.style.setProperty('--x', (4 + ((index * 37) % 91)) + '%');
    bat.style.setProperty('--y', (5 + ((index * 23) % 62)) + '%');
    bat.style.setProperty('--dur', (5 + (index % 7)) + 's');
    bat.style.setProperty('--delay', (-1 * (index % 9)) + 's');
    bat.style.setProperty('--scale', (0.65 + ((index * 13) % 8) / 10).toFixed(2));
    container.appendChild(bat);
  });
  if (!visible.length) {
    const placeholder = document.createElement('div');
    placeholder.className = 'bat young';
    placeholder.style.setProperty('--x','47%'); placeholder.style.setProperty('--y','24%');
    placeholder.title = 'O primeiro morcego vai aparecer quando um commit público for encontrado.';
    container.appendChild(placeholder);
  }
}

async function main() {
  try {
    const response = await fetch('./data/commits.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Dados ainda não publicados');
    const data = await response.json();
    const commits = Array.isArray(data.commits) ? data.commits : [];
    const last = data.lastCommit || commits.reduce((latest, commit) => !latest || new Date(commit.date) > new Date(latest.date) ? commit : latest, null);
    renderBats(commits);
    updateProgression(data, commits, last);
    $('totalCommits').textContent = new Intl.NumberFormat('pt-BR').format(data.totalCommits ?? commits.length);
    if (last) {
      const days = ageDays(last.date);
      $('lastCommit').textContent = relative(days);
      $('lastCommitDate').textContent = formatDate(last.date) + (last.repository ? ' · ' + last.repository : '');
      $('sceneLastCommit').textContent = 'ÚLTIMA PEGADA: ' + formatDate(last.date).toUpperCase();
      setHunger(last.date);
    } else {
      $('lastCommit').textContent = 'Ainda não';
      $('lastCommitDate').textContent = 'esperando o primeiro registro';
      $('sceneLastCommit').textContent = 'AGUARDANDO PEGADAS';
      setHunger(null);
    }
    $('updateStatus').textContent = 'Dados coletados em ' + formatDate(data.generatedAt) + ' · ' + (data.repositoriesScanned ?? 0) + ' repositórios públicos analisados.';
  } catch (error) {
    $('totalCommits').textContent = '—';
    $('lastCommit').textContent = 'Indisponível';
    $('hungerLabel').textContent = 'Aguardando';
    $('updateStatus').textContent = 'A caverna ainda está sendo preparada. Os dados aparecerão após a primeira execução do GitHub Actions.';
    setHunger(null);
  }
}
main();
// Refresh published GitHub state without reloading the whole scene.
setInterval(() => { if (!document.hidden) main(); }, 5 * 60 * 1000);

/* Parallax suave para dar sensação de profundidade, sem controles obrigatórios. */
(() => {
  const scene = document.getElementById('caveFrame');
  if (!scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf = 0;
  scene.addEventListener('pointermove', (event) => {
    const rect = scene.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const set = (selector, dx, dy) => {
        const el = scene.querySelector(selector);
        if (el) el.style.translate = (x * dx) + 'px ' + (y * dy) + 'px';
      };
      set('.depth-back', -8, -5);
      set('.depth-mid', -15, -8);
      set('.stalactites', -10, -5);
      set('.bats', 18, 10);
      set('.caveman', -5, 0);
      set('.fire-area', 4, 0);
    });
  });
  scene.addEventListener('pointerleave', () => {
    ['.depth-back','.depth-mid','.stalactites','.bats','.caveman','.fire-area'].forEach(selector => {
      const el = scene.querySelector(selector);
      if (el) el.style.translate = '';
    });
  });
})();


function updateProgression(data, commits, last) {
 const total=Number(data.totalCommits??commits.length), repos=Number(data.repositoriesScanned??0);
 const ci=data.ci||{};
 const success=Number(ci.successfulRuns||0), failed=Number(ci.failedRuns||0), pending=Number(ci.pendingRuns||0);
 window.commitCaveState={successfulRuns:success,failedRuns:failed,pendingRuns:pending,checkedRuns:Number(ci.checkedRuns||0),totalCommits:total,repositories:repos,latestConclusion:ci.latestConclusion||null};
 window.dispatchEvent(new CustomEvent('commit-cave-state',{detail:window.commitCaveState}));
 const level=Math.max(1,Math.floor(total/25)+1+Math.floor(success/5));
 const xp=((total%25)/25*70)+(success%5)/5*30;
 const days=last?ageDays(last.date):7;
 $('levelLabel').textContent='NÍVEL '+level;
 $('xpBar').style.width=Math.min(100,xp)+'%';
 $('hudCommits').textContent=new Intl.NumberFormat('pt-BR').format(total);
 $('hudRepos').textContent=repos;
 $('hudActivity').textContent=last?relative(days):'NENHUMA';
 $('waterBar').style.width=Math.max(5,100-Math.min(days,10)*8)+'%';
 $('hungerBar').style.width=Math.min(100,18+Math.max(0,days-1)*20)+'%';
 $('evolutionBar').style.width=Math.min(100,12+level*7+Math.min(success,10)*2)+'%';
 const scene=$('caveFrame');
 scene.classList.toggle('world-blooming',success>0);
 scene.classList.toggle('world-failed',failed>0);
 const grass=$('grassPatches');
 if(grass) grass.style.opacity=String(Math.min(.95,success/12));
 const water=$('waterPool');
 if(water) water.style.opacity=String(Math.max(.25,Math.min(1,1-days*.1)));
 const fallen=$('fallenBat');
 if(fallen) fallen.hidden=failed===0;
 const mood=$('caveMood');
 if(failed>0){mood.textContent='Falhas recentes: '+failed+' · morcego caído';}
 else if(pending>0){mood.textContent='Testes em execução · aguardando resultado';}
 else if(success>0){mood.textContent='Testes verdes · a caverna floresce';}
 const toast=$('rewardToast');
 if(toast && success>0){
   toast.hidden=false;
   toast.textContent='+'+success+' TESTES VERDES · EVOLUÇÃO';
 }
 const panel=document.querySelector('.ci-panel');
 if(panel){
   const small=panel.querySelector('small');
   if(small) small.textContent=ci.checkedRuns
    ? success+' execuções aprovadas · '+failed+' falhas · '+pending+' em andamento'
    : 'Nenhuma execução de teste identificada nos repositórios públicos.';
   const light=panel.querySelector('.ci-light');
   if(light){
     light.style.background=failed?'#ff4058':pending?'#ffbf49':success?'#55e67c':'#4b9bff';
     light.style.boxShadow='0 0 10px '+(failed?'#ff4058':pending?'#ffbf49':success?'#55e67c':'#4b9bff');
   }
 }
}
