const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-board');
const highScoreEl = document.getElementById('high-score-display');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const bestScoreEl = document.getElementById('best-score');

// Variáveis de Jogo
let frames = 0;
let score = 0;
let highScore = localStorage.getItem('flappyRocketHighScore') || 0; // Pega recorde salvo
let isRunning = false;
let speed = 3.5; // Velocidade um pouco maior

// Atualiza recorde visualmente
highScoreEl.innerText = "RECORDE: " + highScore;

// Resize Canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- FOGUETE ---
const rocket = {
    x: 50,
    y: 150,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.25,
    jump: -7,
    draw: function() {
        // Desenha o Emoji do Foguete rotacionado
        ctx.save();
        ctx.translate(this.x + 15, this.y + 15);
        // Calcula angulo (caindo ou subindo)
        let angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1)));
        ctx.rotate(angle);
        ctx.font = "40px Arial";
        ctx.fillText("🚀", -20, 10);
        ctx.restore();
    },
    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Colisão Chão
        if (this.y + this.height > canvas.height - 20) {
            gameOver();
        }
        // Teto (não deixa passar)
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap: function() {
        this.velocity = this.jump;
    }
};

// --- OBSTÁCULOS (Luas) ---
const obstacles = {
    list: [],
    draw: function() {
        for(let i = 0; i < this.list.length; i++) {
            let p = this.list[i];
            
            // Cor do Tubo
            ctx.fillStyle = "#444"; 
            
            // Tubo Cima
            ctx.fillRect(p.x, 0, p.w, p.top);
            // Tubo Baixo
            ctx.fillRect(p.x, canvas.height - p.bottom, p.w, p.bottom);

            // Luas decorativas nas pontas
            ctx.font = "30px Arial";
            ctx.fillText("🌑", p.x - 5, p.top - 10); 
            ctx.fillText("🌑", p.x - 5, canvas.height - p.bottom + 30);
        }
    },
    update: function() {
        // Adiciona novo obstáculo a cada X frames
        if(frames % 100 === 0) {
            let gap = 170; // Abertura para passar (ajuste se ficar difícil)
            let minHeight = 50;
            let maxTop = canvas.height - gap - minHeight;
            let topHeight = Math.random() * (maxTop - minHeight) + minHeight;
            
            this.list.push({
                x: canvas.width,
                w: 50, 
                top: topHeight,
                bottom: canvas.height - (topHeight + gap),
                passed: false
            });
        }

        for(let i = 0; i < this.list.length; i++) {
            let p = this.list[i];
            p.x -= speed;

            // Colisão Retangular
            if (rocket.x + rocket.width > p.x && rocket.x < p.x + p.w) {
                if (rocket.y < p.top || rocket.y + rocket.height > canvas.height - p.bottom) {
                    gameOver();
                }
            }

            // Pontuar
            if(p.x + p.w < rocket.x && !p.passed) {
                score++;
                scoreEl.innerText = score;
                p.passed = true;
            }

            // Remover se saiu da tela
            if(p.x + p.w < 0) {
                this.list.shift();
                i--;
            }
        }
    }
};

// --- SISTEMA DE ESTRELAS ---
for(let i=0; i<60; i++) {
    let s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + 'vw';
    s.style.top = Math.random() * 100 + 'vh';
    let size = Math.random() * 3;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.animationDuration = (Math.random() * 2 + 1) + 's';
    document.getElementById('game-container').appendChild(s);
}

// --- LOOP PRINCIPAL ---
function loop() {
    if(!isRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    rocket.update();
    rocket.draw();
    obstacles.update();
    obstacles.draw();

    frames++;
    requestAnimationFrame(loop);
}

// --- CONTROLES ---
function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Reset
    rocket.y = canvas.height / 2;
    rocket.velocity = 0;
    obstacles.list = [];
    score = 0;
    scoreEl.innerText = 0;
    frames = 0;
    isRunning = true;
    
    loop();
}

function gameOver() {
    isRunning = false;
    
    // Lógica de Recorde
    if(score > highScore) {
        highScore = score;
        localStorage.setItem('flappyRocketHighScore', highScore);
        highScoreEl.innerText = "RECORDE: " + highScore;
    }

    finalScoreEl.innerText = score;
    bestScoreEl.innerText = highScore;
    
    gameOverScreen.classList.remove('hidden');
}

function resetGame() {
    startGame();
}

// Input
function jump() {
    if(!isRunning && startScreen.classList.contains('hidden') === false && gameOverScreen.classList.contains('hidden') === false) {
        // Evita clique fantasma na tela de gameover
    } else if (!isRunning && gameOverScreen.classList.contains('hidden') === false) {
        // Clique na tela de gameover não faz nada (tem que clicar no botão)
    } else {
        rocket.flap();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') jump();
});

// Touch para celular
window.addEventListener('touchstart', (e) => {
    if(e.target.tagName !== 'BUTTON') { // Se não for botão, pula
        e.preventDefault();
        jump();
    }
}, {passive: false});

window.addEventListener('mousedown', (e) => {
    if(e.target.tagName !== 'BUTTON') jump();
});