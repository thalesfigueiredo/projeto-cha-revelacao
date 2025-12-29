const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');
const scoreEl = document.getElementById('score-board');
const titleText = document.getElementById('title-text');
const msgText = document.getElementById('msg-text');
const finalScoreText = document.getElementById('final-score');

let width, height;
let platforms = [];
let score = 0;
let isGameOver = false;
let animationId;

// Física ajustada para não bugar
const player = {
    x: 0, y: 0, width: 40, height: 40,
    vx: 0, vy: 0,
    jumpStrength: -12, // Pulo mais forte
    gravity: 0.4,
    speed: 6 // Movimento lateral mais rápido
};

let keys = { left: false, right: false };

function resize() {
    width = canvas.width = document.getElementById('game-container').offsetWidth;
    height = canvas.height = document.getElementById('game-container').offsetHeight;
}
window.addEventListener('resize', resize);
resize();

function createPlatforms() {
    platforms = [];
    // Cria plataformas iniciais até o topo da tela
    let currentY = height - 50;
    while (currentY > 0) {
        let w = 80 + Math.random() * 30; // Largura variada
        let x = Math.random() * (width - w);
        platforms.push({ x, y: currentY, w, h: 15 });
        currentY -= 90; // Distância fixa inicial entre plataformas (evita buracos)
    }
}

// Função mágica para encontrar a plataforma mais alta
function getHighestPlatformY() {
    let minY = height;
    platforms.forEach(p => {
        if (p.y < minY) minY = p.y;
    });
    return minY;
}

function startGame() {
    uiLayer.classList.add('hidden');
    score = 0;
    scoreEl.innerText = "ALTURA: 0";
    isGameOver = false;
    
    // Reseta jogador
    player.width = 40; // Garante tamanho
    player.x = width / 2 - player.width / 2;
    player.y = height - 150;
    player.vx = 0;
    player.vy = player.jumpStrength;
    
    createPlatforms();
    
    if(animationId) cancelAnimationFrame(animationId);
    loop();
}

function loop() {
    if (isGameOver) return;

    // Fundo
    ctx.fillStyle = '#000015'; 
    ctx.fillRect(0, 0, width, height);
    
    // Estrelas
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<15; i++) {
        // Desenha estrelas aleatórias (efeito simples de velocidade)
        let sx = (Math.sin(score + i) * width + width) % width;
        let sy = (Math.cos(score + i * 20) * height + height) % height;
        ctx.fillRect(sx, sy, 2, 2);
    }

    // --- JOGADOR ---
    player.vy += player.gravity;
    player.y += player.vy;

    if (keys.left) player.vx = -player.speed;
    else if (keys.right) player.vx = player.speed;
    else player.vx *= 0.85; // Freio

    player.x += player.vx;

    // Teletransporte lateral (Pacman)
    if (player.x + player.width < 0) player.x = width;
    else if (player.x > width) player.x = -player.width;

    // --- CÂMERA E RECICLAGEM (AQUI ESTÁ A CORREÇÃO) ---
    if (player.y < height / 2.5) {
        let diff = height / 2.5 - player.y;
        player.y = height / 2.5;
        
        platforms.forEach(p => {
            p.y += diff;
        });
        
        // Pontuação baseada na subida
        score += Math.floor(diff * 0.1); 
        scoreEl.innerText = "ALTURA: " + score;
    }

    // Remove plataformas velhas e cria novas
    platforms.forEach((p, index) => {
        if (p.y > height) {
            // Remove a plataforma que caiu
            platforms.splice(index, 1);
            
            // Cria uma NOVA no topo, baseada na mais alta existente
            let highestY = getHighestPlatformY();
            // Gap seguro: entre 70 e 110 pixels acima da mais alta
            let newY = highestY - (70 + Math.random() * 40);
            
            let w = 70 + Math.random() * 40;
            let x = Math.random() * (width - w);
            
            platforms.push({ x, y: newY, w, h: 15 });
        }
    });

    // --- COLISÃO ---
    if (player.vy > 0) { // Só colide descendo
        platforms.forEach(p => {
            if (
                player.x + player.width * 0.7 > p.x && 
                player.x + player.width * 0.3 < p.x + p.w &&
                player.y + player.height > p.y &&
                player.y + player.height < p.y + p.h + player.vy + 2 // Tolerância
            ) {
                player.vy = player.jumpStrength; // PULA
            }
        });
    }

    // --- DESENHO ---
    // Plataformas
    platforms.forEach(p => {
        ctx.fillStyle = "#00ffff"; 
        ctx.shadowBlur = 15; ctx.shadowColor = "#00ffff";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.shadowBlur = 0;
    });

    // Foguete
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    let angle = player.vx * 0.05;
    ctx.rotate(angle);
    ctx.font = "40px Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🚀", 0, 0);
    ctx.restore();

    // Game Over se cair
    if (player.y > height) {
        gameOver();
        return;
    }

    animationId = requestAnimationFrame(loop);
}

function gameOver() {
    isGameOver = true;
    uiLayer.classList.remove('hidden');
    titleText.innerHTML = "FALHA NA<br>MISSÃO";
    titleText.style.color = "#ff3333";
    msgText.innerText = "O foguete caiu no vazio.";
    finalScoreText.classList.remove('hidden');
    finalScoreText.innerText = "Altura Final: " + score;
}

// --- CONTROLES ---
window.addEventListener('keydown', e => {
    if(e.key === "ArrowLeft") keys.left = true;
    if(e.key === "ArrowRight") keys.right = true;
});
window.addEventListener('keyup', e => {
    if(e.key === "ArrowLeft") keys.left = false;
    if(e.key === "ArrowRight") keys.right = false;
});

// Touch
const leftZone = document.getElementById('left-zone');
const rightZone = document.getElementById('right-zone');

leftZone.addEventListener('touchstart', (e) => { e.preventDefault(); keys.left = true; });
leftZone.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });

rightZone.addEventListener('touchstart', (e) => { e.preventDefault(); keys.right = true; });
rightZone.addEventListener('touchend', (e) => { e.preventDefault(); keys.right = false; });