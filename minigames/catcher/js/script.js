const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-board');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');

let width, height;
let score = 0;
let isRunning = false;
let animationId;
let difficultyMultiplier = 1;

// Entidades
const player = { x: 0, y: 0, width: 60, height: 60, emoji: "🚀" };
let items = [];

// Configuração dos itens que caem
const itemTypes = [
    { type: 'star', emoji: '⭐', score: 1, chance: 0.7, speed: 4 },   // Comum
    { type: 'bottle', emoji: '🍼', score: 5, chance: 0.1, speed: 6 }, // Raro e rápido
    { type: 'rock', emoji: '☄️', score: -1, chance: 0.2, speed: 5 }   // Perigo
];

// Resize
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    player.y = height - 100; // Posição fixa no chão
}
window.addEventListener('resize', resize);
resize();

// Background Stars (Visual apenas)
function createBGStars() {
    const container = document.getElementById('game-container');
    for(let i=0; i<30; i++) {
        let d = document.createElement('div');
        d.className = 'star-bg';
        d.style.left = Math.random() * 100 + 'vw';
        d.style.top = Math.random() * -100 + 'vh'; // Começa fora
        d.style.width = Math.random() * 3 + 'px';
        d.style.height = d.style.width;
        d.style.animationDuration = (Math.random() * 3 + 2) + 's';
        container.appendChild(d);
    }
}
createBGStars();

// --- Lógica do Jogo ---

function spawnItem() {
    // Escolhe o tipo baseado na chance
    let rand = Math.random();
    let type = itemTypes[0]; // Default Star
    
    if (rand > 0.8) type = itemTypes[1]; // Bottle (20% chance entre os bons)
    if (Math.random() < 0.3 + (score * 0.005)) type = itemTypes[2]; // Rock (Chance aumenta com o tempo)

    items.push({
        x: Math.random() * (width - 40),
        y: -50,
        size: 40,
        ...type,
        currentSpeed: type.speed * difficultyMultiplier
    });
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    score = 0;
    items = [];
    difficultyMultiplier = 1;
    player.x = width / 2 - player.width / 2;
    scoreEl.innerText = 0;
    
    isRunning = true;
    loop();
}

function loop() {
    if (!isRunning) return;

    // Limpa tela
    ctx.clearRect(0, 0, width, height);

    // Aumenta dificuldade gradualmente
    difficultyMultiplier = 1 + (score / 100);

    // Spawner (Cria itens aleatoriamente)
    if (Math.random() < 0.03 * difficultyMultiplier) { // Mais frequente com o tempo
        spawnItem();
    }

    // Atualiza e Desenha Itens
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.y += item.currentSpeed;

        // Desenha Item
        ctx.font = "40px Arial";
        ctx.fillText(item.emoji, item.x, item.y + item.size);

        // Colisão com Jogador
        if (
            item.x < player.x + player.width &&
            item.x + item.size > player.x &&
            item.y < player.y + player.height &&
            item.y + item.size > player.y
        ) {
            if (item.type === 'rock') {
                gameOver();
                return;
            } else {
                // Pegou item bom
                score += item.score;
                scoreEl.innerText = score;
                
                // Efeito visual de "pop" (opcional, simplificado aqui)
                items.splice(i, 1);
                i--;
                continue;
            }
        }

        // Remove se sair da tela
        if (item.y > height) {
            items.splice(i, 1);
            i--;
        }
    }

    // Desenha Jogador
    ctx.font = "60px Arial";
    ctx.fillText(player.emoji, player.x, player.y + 50);

    requestAnimationFrame(loop);
}

function gameOver() {
    isRunning = false;
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

// --- Controles (Arrastar) ---

function movePlayer(clientX) {
    if (!isRunning) return;
    // Centraliza o foguete no dedo/mouse
    let newX = clientX - player.width / 2;
    
    // Limites da tela
    if (newX < 0) newX = 0;
    if (newX > width - player.width) newX = width - player.width;
    
    player.x = newX;
}

// Touch
window.addEventListener('touchmove', (e) => {
    // e.preventDefault(); // Impede scroll da tela
    movePlayer(e.touches[0].clientX);
}, { passive: false });

// Mouse
window.addEventListener('mousemove', (e) => {
    movePlayer(e.clientX);
});

// Clique para começar se tiver na tela inicial
window.addEventListener('touchstart', (e) => {
    if(e.target.tagName !== 'BUTTON' && !isRunning && startScreen.classList.contains('hidden') && gameOverScreen.classList.contains('hidden')) {
        // Lógica extra se quiser pausar/despausar
    }
});