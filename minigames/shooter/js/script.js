const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos UI
const scoreEl = document.getElementById('score-display');
const levelEl = document.getElementById('level-display');

const bossHealthContainer = document.getElementById('boss-health-container');
const bossHealthFill = document.getElementById('boss-health-fill');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const levelUpScreen = document.getElementById('level-up-screen');
const finalScoreEl = document.getElementById('final-score');

// Configuração do Jogo
let width, height;
let isRunning = false;
let score = 0;
let level = 1;
let frames = 0;

// Progressão
let levelProgress = 0;
const PROGRESS_TO_BOSS = 100; // Pontos para chamar o boss
let isBossActive = false;

// Entidades
const player = {
    x: 0, y: 0, w: 50, h: 50,
    emoji: "🚀",
    hp: 1,
    speed: 0
};

let bullets = [];
let enemies = [];
let particles = [];
let boss = null;

// Resize
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    player.y = height - 100;
    player.x = width / 2 - player.w / 2;
}
window.addEventListener('resize', resize);
resize();

// Background Stars
function createStars() {
    const container = document.getElementById('game-container');
    for(let i=0; i<40; i++) {
        let s = document.createElement('div');
        s.className = 'star';
        s.style.left = Math.random() * 100 + '%';
        s.style.width = Math.random() * 3 + 'px';
        s.style.height = s.style.width;
        s.style.animationDuration = (Math.random() * 2 + 0.5) + 's';
        s.style.animationDelay = (Math.random() * 2) + 's';
        container.appendChild(s);
    }
}
createStars();

// --- CLASSES ---

class Bullet {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.w = 5; this.h = 15;
        this.speed = 10;
        this.active = true;
    }
    update() {
        this.y -= this.speed;
        if(this.y < 0) this.active = false;
    }
    draw() {
        ctx.fillStyle = "#0ff";
        ctx.shadowBlur = 10; ctx.shadowColor = "#0ff";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.shadowBlur = 0;
    }
}

class Enemy {
    constructor(isBossMinion = false) {
        this.w = 40; this.h = 40;
        this.x = Math.random() * (width - this.w);
        this.y = -50;
        this.speed = (Math.random() * 2 + 2) + (level * 0.5); 
        this.type = Math.random() > 0.5 ? "☄️" : "🛸";
        this.hp = 1 + Math.floor(level / 2);
        this.active = true;
        this.isBossMinion = isBossMinion; 
        if(isBossMinion) this.speed += 2;
    }
    update() {
        this.y += this.speed;
        if(this.y > height) this.active = false;
    }
    draw() {
        ctx.font = "35px Arial";
        ctx.fillText(this.type, this.x, this.y + 35);
    }
}

class Boss {
    constructor() {
        this.w = 120; this.h = 120;
        this.x = width / 2 - this.w / 2;
        this.y = -150; 
        this.targetY = 80;
        this.hp = 30 * level; // Vida aumenta com level
        this.maxHp = this.hp;
        this.emoji = "👾";
        this.dir = 1;
        this.speed = 2 + (level * 0.5);
        this.state = "entering"; 
        this.active = true;
    }
    update() {
        if (this.state === "entering") {
            this.y += 2;
            if (this.y >= this.targetY) this.state = "fighting";
        } 
        else if (this.state === "fighting") {
            this.x += this.speed * this.dir;
            if (this.x <= 0 || this.x + this.w >= width) this.dir *= -1;
            
            if (frames % 60 === 0) spawnEnemy(true);
        }
    }
    draw() {
        ctx.font = "100px Arial";
        ctx.fillText(this.emoji, this.x, this.y + 80);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0;
        this.color = color;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.life -= 0.05;
    }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// --- SISTEMA ---

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    levelUpScreen.classList.add('hidden');
    
    score = 0;
    level = 1;
    levelProgress = 0;
    isBossActive = false;
    boss = null;
    enemies = [];
    bullets = [];
    particles = [];
    
    updateHUD();
    
    player.x = width / 2 - player.w / 2;
    isRunning = true;
    loop();
}

function spawnEnemy(fromBoss = false) {
    enemies.push(new Enemy(fromBoss));
}

function createExplosion(x, y, color) {
    for(let i=0; i<10; i++) particles.push(new Particle(x, y, color));
}

function nextLevel() {
    isRunning = false;
    levelUpScreen.classList.remove('hidden');
    
    setTimeout(() => {
        level++;
        levelProgress = 0;
        isBossActive = false;
        boss = null;
        enemies = [];
        bullets = [];
        levelUpScreen.classList.add('hidden');
        isRunning = true;
        updateHUD();
        loop();
    }, 3000); 
}

function updateHUD() {
    scoreEl.innerText = score;
    levelEl.innerText = level;
    
    // Lógica da Barra: Só aparece se for Boss
    if(isBossActive && boss) {
        bossHealthContainer.style.display = 'block'; // Mostra a barra
        let pct = (boss.hp / boss.maxHp) * 100;
        bossHealthFill.style.width = pct + "%";
    } else {
        bossHealthContainer.style.display = 'none'; // Esconde a barra
    }
}

function loop() {
    if(!isRunning) return;

    ctx.clearRect(0, 0, width, height);
    frames++;

    // --- JOGADOR ---
    if(frames % 15 === 0) {
        bullets.push(new Bullet(player.x + player.w/2 - 2.5, player.y));
    }
    
    ctx.font = "50px Arial";
    ctx.fillText(player.emoji, player.x, player.y + 40);

    // --- BOSS ---
    if (isBossActive && boss) {
        boss.update();
        boss.draw();
        
        bullets.forEach(b => {
            if(b.active && 
                b.x > boss.x && b.x < boss.x + boss.w &&
                b.y > boss.y && b.y < boss.y + boss.h) {
                
                b.active = false;
                boss.hp--;
                createExplosion(b.x, b.y, "#ffff00");
                
                if(boss.hp <= 0) {
                    createExplosion(boss.x + 60, boss.y + 60, "#ff00ff");
                    createExplosion(boss.x, boss.y, "#fff");
                    score += 100;
                    nextLevel();
                }
            }
        });
    } else {
        // Inimigos Comuns
        let spawnRate = Math.max(20, 60 - (level * 5)); 
        if(frames % spawnRate === 0) spawnEnemy();

        if(levelProgress >= PROGRESS_TO_BOSS && !isBossActive) {
            isBossActive = true;
            boss = new Boss();
        }
    }

    // --- BALAS ---
    bullets.forEach((b, i) => {
        b.update();
        b.draw();
        if(!b.active) bullets.splice(i, 1);
    });

    // --- INIMIGOS ---
    enemies.forEach((e, i) => {
        e.update();
        e.draw();

        bullets.forEach(b => {
            if(b.active && e.active &&
                b.x > e.x && b.x < e.x + e.w &&
                b.y > e.y && b.y < e.y + e.h) {
                
                b.active = false;
                e.hp--;
                if(e.hp <= 0) {
                    e.active = false;
                    createExplosion(e.x + 20, e.y + 20, "#ff9900");
                    score += 10;
                    if(!isBossActive) levelProgress += 10;
                }
            }
        });

        if(e.active &&
            player.x < e.x + e.w - 10 &&
            player.x + player.w > e.x + 10 &&
            player.y < e.y + e.h - 10 &&
            player.y + player.h > e.y + 10) {
            gameOver();
        }

        if(!e.active) enemies.splice(i, 1);
    });

    // --- PARTICULAS ---
    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if(p.life <= 0) particles.splice(i, 1);
    });

    updateHUD(); // Atualiza a barra de vida
    requestAnimationFrame(loop);
}

function gameOver() {
    isRunning = false;
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

// --- CONTROLES ---
function movePlayer(clientX) {
    if(!isRunning) return;
    let newX = clientX - player.w / 2;
    if(newX < 0) newX = 0;
    if(newX > width - player.w) newX = width - player.w;
    player.x = newX;
}

window.addEventListener('touchmove', e => {
    movePlayer(e.touches[0].clientX);
}, {passive: false});

window.addEventListener('mousemove', e => {
    movePlayer(e.clientX);
});