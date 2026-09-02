/* ---------------- navigation ---------------- */
const stepMap = { page1:1, page2:1, page3:2, pageYes:3, pageMaybe:3, pageNo:3, pageFinal:4 };

function goTo(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
  updateProgress(stepMap[id] || 1);
}

function updateProgress(step){
  document.querySelectorAll('.progress-step').forEach(el=>{
    el.classList.toggle('active', parseInt(el.dataset.step) <= step);
  });
}

function chooseAnswer(choice){
  if(choice === 'yes'){
    goTo('pageYes');
    launchBurst();
  } else if(choice === 'maybe'){
    goTo('pageMaybe');
  } else {
    goTo('pageNo');
  }
}

/* ---------------- her answer submission (Web3Forms) ---------------- */
const NOTIFY_EMAIL = 'gilmiercabil@gmail.com';
const ACCESS_KEY = '0bca9dd0-0101-42d8-b68d-38b13979eafe';

async function submitAnswer(e){
  e.preventDefault();

  const name    = document.getElementById('herName').value.trim();
  const answer  = document.getElementById('herAnswer').value.trim();
  const message = document.getElementById('herMessage').value.trim();
  const date    = document.getElementById('herDate').value;

  const form = document.getElementById('answerForm');
  const box  = document.getElementById('confirmBox');
  const btn  = form.querySelector('button[type="submit"]');

  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: '💌 New answer from the confession page',
        from_name: name || 'Anonymous',
        name:  name  || '(not provided)',
        answer: answer || '(not provided)',
        message: message || '(none)',
        date: date || '(not provided)'
      })
    });
    const data = await res.json();

    if (data.success) {
      box.style.display = 'block';
      form.reset();
    } else {
      alert('Could not send: ' + (data.message || 'please try again'));
    }
  } catch (err) {
    alert('Network error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit My Answer';
  }
}

/* ---------------- confetti / heart burst ---------------- */
function launchBurst(){
  const symbols = ['❤','💕','✨','🤍','💖'];
  for(let i=0;i<36;i++){
    const el = document.createElement('div');
    el.className = 'burst-piece';
    el.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    el.style.left = Math.random()*100 + 'vw';
    el.style.fontSize = (14 + Math.random()*18) + 'px';
    el.style.animationDuration = (2.4 + Math.random()*2.2) + 's';
    el.style.opacity = 0.75 + Math.random()*0.25;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 5000);
  }
}

/* ---------------- background music ---------------- */
let playing = false;
function toggleMusic(){
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicBtn');
  const icon = document.getElementById('musicIcon');
  if(playing){
    audio.pause();
    playing = false;
    btn.classList.remove('playing');
    icon.textContent = '♪';
  } else {
    audio.play().then(()=>{
      playing = true;
      btn.classList.add('playing');
      icon.textContent = '♫';
    }).catch(()=>{ /* no valid audio source set yet, or blocked */ });
  }
}

// Try to autoplay as soon as the page opens. Most browsers block audio
// with sound until the visitor interacts with the page at least once —
// if that happens, we quietly fall back to a tap-to-play on first touch/click.
function attemptAutoplay(){
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicBtn');
  const icon = document.getElementById('musicIcon');
  audio.play().then(()=>{
    playing = true;
    btn.classList.add('playing');
    icon.textContent = '♫';
  }).catch(()=>{
    // Autoplay was blocked — start music on her very first tap/click anywhere
    const startOnce = ()=>{
      if(!playing) toggleMusic();
      document.removeEventListener('click', startOnce);
      document.removeEventListener('touchstart', startOnce);
    };
    document.addEventListener('click', startOnce, { once:true });
    document.addEventListener('touchstart', startOnce, { once:true });
  });
}
window.addEventListener('DOMContentLoaded', attemptAutoplay);

/* ---------------- floating particles ---------------- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function makeParticle(){
  const type = Math.random() > 0.55 ? 'heart' : 'dot';
  return {
    x: Math.random()*canvas.width,
    y: canvas.height + Math.random()*100,
    size: type==='heart' ? 10 + Math.random()*10 : 2 + Math.random()*3,
    speed: 0.3 + Math.random()*0.6,
    drift: (Math.random()-0.5)*0.5,
    opacity: 0.15 + Math.random()*0.35,
    type,
    hue: Math.random() > 0.5 ? '#E8A0BF' : '#C9B6E4'
  };
}

const PARTICLE_COUNT = window.innerWidth < 600 ? 18 : 32;
for(let i=0;i<PARTICLE_COUNT;i++){
  const p = makeParticle();
  p.y = Math.random()*canvas.height;
  particles.push(p);
}

function drawHeartShape(x,y,size,color,opacity){
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x,y);
  ctx.scale(size/20, size/20);
  ctx.beginPath();
  ctx.moveTo(0,4);
  ctx.bezierCurveTo(-10,-6, -20,2, 0,16);
  ctx.bezierCurveTo(20,2, 10,-6, 0,4);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    if(p.type === 'heart'){
      drawHeartShape(p.x, p.y, p.size, p.hue, p.opacity);
    } else {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.hue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    p.y -= p.speed;
    p.x += p.drift;
    if(p.y < -30){
      Object.assign(p, makeParticle());
      p.y = canvas.height + 20;
    }
  });
  if(!reduceMotion){ requestAnimationFrame(animateParticles); }
}
animateParticles();