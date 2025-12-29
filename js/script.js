// =========================================
// 1. CONFIGURAÇÃO GERAL
// =========================================
const isBoy = true;          // TRUE = Apolo, FALSE = Selene
const dadName = "Flatelo";   
const momName = "Marcela";   
// const avos = "João, Maria, José e Ana"; 
let countdownSeconds = 10;   

// =========================================
// 2. ELEMENTOS DO DOM (Centralizados)
// =========================================
// Áudios
const audioTension = document.getElementById('audio-tension');
const audioCeleb = document.getElementById('audio-celebration');

// Intro
const stage = document.getElementById('intro-stage');
const couple = document.getElementById('couple-container');
const rocket = document.getElementById('rocket-container');
const ground = document.getElementById('ground');
const skyObj = document.getElementById('sky-object');
const laptopUI = document.getElementById('laptop-ui');

// Terminal & Logic
const output = document.getElementById('output');
const terminal = document.getElementById('terminal');
const timerScreen = document.getElementById('timer-screen');
const timerDisplay = document.getElementById('timer-display');
const mobileProxy = document.getElementById('mobile-proxy');

// Telas Finais
const launchOverlay = document.getElementById('launch-overlay');
const launchText = document.getElementById('launch-text');
const launchNumber = document.getElementById('launch-number');
const crashScreen = document.getElementById('crash-screen');
const crashCount = document.getElementById('crash-count');
const prankScreen = document.getElementById('prank-screen');
const starWarsScreen = document.getElementById('starwars-screen');
const revealScreen = document.getElementById('reveal-screen');
const babyNameElement = document.getElementById('baby-name');
const moonVisual = document.getElementById('moon-visual');
const subVisual = document.getElementById('sub-visual');

// =========================================
// 3. FUNÇÕES AUXILIARES
// =========================================
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function startExperience() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('intro-stage').style.display = 'block';
    // document.getElementById('grandparents-names').innerText = avos; 
    
    // Inicia Interestelar (Toca até o final da brincadeira)
    audioTension.volume = 0.8;
    audioTension.play();
    runIntroAnimation();
}

// =========================================
// 4. LÓGICA DE INPUT (Desktop & Mobile)
// =========================================
terminal.onclick = () => mobileProxy.focus();

mobileProxy.addEventListener('input', () => {
    const activeSpan = document.querySelector('.active-input');
    if(activeSpan) activeSpan.innerText = mobileProxy.value;
});

let resolver = null;
mobileProxy.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && resolver) {
        e.preventDefault();
        const val = mobileProxy.value; 
        mobileProxy.value = ''; 
        resolver(val.trim());
    }
});

function askInput(promptText) {
    return new Promise((resolve) => {
        document.querySelectorAll('.active-input').forEach(e => e.classList.remove('active-input'));
        
        const line = document.createElement('div');
        line.className = 'input-line';
        line.innerHTML = `
            <span class="prompt-text">${promptText}</span>
            <div class="input-wrapper">
                <span class="user-input active-input"></span><span class="cursor"></span>
            </div>`;
        output.appendChild(line);
        window.scrollTo(0, document.body.scrollHeight);
        terminal.scrollTop = terminal.scrollHeight;
        
        mobileProxy.focus();
        resolver = (res) => { 
            line.querySelector('.cursor').remove(); 
            resolve(res); 
        }
    });
}

async function log(text, type = '') {
    const div = document.createElement('div');
    if (type === 'highlight') div.className = 'highlight';
    else if (type === 'warning') div.className = 'warning';
    else if (type === 'error') div.className = 'error';
    else div.style.color = "#0f0"; 
    div.textContent = text;
    output.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
    await sleep(400); 
}

async function matrixRain(lines) {
    for(let i=0; i<lines; i++) {
        let hex = Math.random().toString(16).substr(2, 8).toUpperCase();
        const div = document.createElement('div');
        div.className = 'matrix-text'; 
        div.textContent = `Processing segment: 0x${hex}... [OK]`;
        output.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
        await sleep(120); 
    }
}

// =========================================
// 5. ANIMAÇÃO INTRODUÇÃO
// =========================================
function generateStars() {
    for(let i=0; i<100; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 3;
        s.style.width = size + 'px'; s.style.height = size + 'px';
        stage.appendChild(s);
    }
}

async function runIntroAnimation() {
    generateStars();
    // 1. Casal entra (na Lua)
    await sleep(500);
    couple.style.left = "40%"; await sleep(6000); 
    // 2. Entram no foguete
    couple.style.opacity = "0"; await sleep(1000);
    // 3. Decolagem
    rocket.classList.add('rocket-shake'); 
    await sleep(2000); 
    rocket.style.transition = "bottom 5s ease-in"; 
    rocket.style.bottom = "120vh"; 
    // 4. Espaço -> Terra
    await sleep(2500);
    stage.style.background = "#87CEEB"; 
    ground.style.transition = "background 2s, bottom 1s";
    ground.style.bottom = "-20vh"; 
    setTimeout(() => { ground.style.background = "#228B22"; }, 500);
    document.querySelectorAll('.star').forEach(s => s.style.opacity = 0);
    // Lua vira lua
    skyObj.style.opacity = 0; 
    await sleep(1000);
    skyObj.innerText = "🌑"; skyObj.style.fontSize = "15vw"; skyObj.style.color = "#fff"; skyObj.style.opacity = 0.6;
    await sleep(2000); 
    // 5. Pouso
    ground.style.bottom = "0";
    rocket.style.transition = "bottom 5s ease-out"; 
    rocket.style.bottom = "13vh"; 
    rocket.classList.remove('rocket-shake');
    await sleep(5500);
    // 6. Casal Sai
    couple.style.opacity = "1";
    couple.style.transition = "left 2s ease-out";
    couple.style.left = "15%"; 
    await sleep(2500);
    // 7. Abre Notebook
    laptopUI.style.display = "flex";
}

window.openFolder = function() {
    document.getElementById('folder-view').style.display = "none";
    document.getElementById('file-view').style.display = "block";
}

window.startHackerMode = function() {
    stage.style.transition = "opacity 1s";
    stage.style.opacity = 0;
    setTimeout(() => {
        stage.style.display = "none";
        document.getElementById('terminal-app').style.display = "block";
        startCountdown();
    }, 1000);
}

// =========================================
// 6. TERMINAL LOGIC
// =========================================
function startCountdown() {
    const int = setInterval(() => {
        const min = Math.floor(countdownSeconds/60).toString().padStart(2,'0');
        const sec = (countdownSeconds%60).toString().padStart(2,'0');
        timerDisplay.innerText = `${min}:${sec}`;
        if(countdownSeconds <= 0) {
            clearInterval(int);
            timerScreen.style.display = 'none';
            terminal.style.display = 'block';
            initSystemPrompt();
        }
        countdownSeconds--;
    }, 1000);
}

async function initSystemPrompt() {
    await log("Terminal T-OS v13.0 Security Enhanced.");
    await sleep(500);
    while (true) {
        let resp = await askInput("Iniciar sistema? [S/N]:");
        if (resp.toLowerCase() === 's') { runBootSequence(); break; }
        else { await log("Aguardando confirmação...", "warning"); }
    }
}

async function runBootSequence() {
    await sleep(500);
    await log("Carregando Kernel...", "highlight");
    await matrixRain(15);
    await log("Verificando conexão estelar... OK");
    
    await log(">>> AUTENTICAÇÃO NECESSÁRIA <<<", "warning");
    await sleep(800);
    while(true) {
        let r = await askInput("Nome do Pai (Admin 1):");
        await log(`Verificando credenciais: ${r}...`); await sleep(1500);
        if (r.toLowerCase() === dadName.toLowerCase()) { await log("Acesso Admin 1: AUTORIZADO.", "highlight"); break; }
        else { await log("ERRO: ACESSO NEGADO.", "error"); await sleep(500); }
    }
    await sleep(500);
    while(true) {
        let r = await askInput("Nome da Mãe (Admin 2):");
        await log(`Verificando credenciais: ${r}...`); await sleep(1500);
        if (r.toLowerCase() === momName.toLowerCase()) { await log("Acesso Admin 2: AUTORIZADO.", "highlight"); break; }
        else { await log("ERRO: ACESSO NEGADO.", "error"); await sleep(500); }
    }

    await sleep(800);
    await log("PERMISSÃO TOTAL CONCEDIDA.", "highlight");
    await log("---------------------------------");

    const msgs = [
        "Acessando dados da família...", "Baixando: 'Manual_de_Instrucoes_Bebe.pdf'...",
        "Calibrando bochechas...", "Sincronizando com a Lua...",
        "Otimizando fofura...", "Verificando palpites dos avós...", "Compilando DNA..."
    ];
    for (let msg of msgs) { await log(`> ${msg}`, "highlight"); await matrixRain(8); await sleep(3000); }

    await log("SISTEMA PRONTO.", "highlight");
    await sleep(1000);
    promptFinalReveal();
}

async function promptFinalReveal() {
    await log("---------------------------------");
    await log("ARQUIVO 'REVELACAO.EXE' CARREGADO.", "warning");
    while(true) {
        let resp = await askInput("Executar AGORA? [S/N]:");
        if (resp.toLowerCase() === 's') { startLaunchSequence(); break; }
        else { await log("Opção inválida. Tente novamente.", "error"); }
    }
}

async function startLaunchSequence() {
    terminal.style.display = 'none';
    launchOverlay.style.display = 'flex';
    const msgs = ["INICIANDO MOTORES...", "PRESSURIZANDO CABINE...", "NAVEGAÇÃO: OK", "DESTINO: TERRA"];
    for(let m of msgs) { launchText.innerText = m; await sleep(1200); }
    launchText.innerText = "LANÇAMENTO EM:";
    for(let i=5; i>0; i--) { launchNumber.innerText = i; await sleep(1000); }
    triggerFakeCrash(); 
}

async function triggerFakeCrash() {
    launchOverlay.style.display = 'none';
    crashScreen.style.display = 'flex';
    
    // Interestelar ainda toca...
    for(let i=5; i>=0; i--) { crashCount.innerText = i; await sleep(1000); }
    
    crashScreen.style.display = 'none';
    prankScreen.style.display = 'flex';
    await sleep(3000); 
    
    // FIM Interestelar -> INÍCIO Van Halen + Star Wars
    prankScreen.style.display = 'none';
    startStarWars();
}

// =========================================
// 7. STAR WARS & REVEAL
// =========================================
async function startStarWars() {
    audioTension.pause();
    audioCeleb.volume = 1.0;
    audioCeleb.play();

    starWarsScreen.style.display = 'block';
    await sleep(22000); // Tempo leitura
    
    starWarsScreen.style.display = 'none';
    triggerSlotMachine();
}

function triggerSlotMachine() {
    revealScreen.style.display = 'flex';
    moonVisual.innerText = isBoy ? "🌑" : "🌕"; 
    let counter = 0, maxSpins = 60;
    
    const spinInterval = () => {
        if (counter % 2 === 0) {
            babyNameElement.innerText = "APOLO";
            babyNameElement.style.color = "#00ffff"; babyNameElement.style.textShadow = "0 0 20px #00ffff";
        } else {
            babyNameElement.innerText = "SELENE";
            babyNameElement.style.color = "#ff00ff"; babyNameElement.style.textShadow = "0 0 20px #ff00ff";
        }
        counter++;
        if (counter < maxSpins) setTimeout(spinInterval, 50); 
        else finishReveal();
    };
    spinInterval();
}

function finishReveal() {
    babyNameElement.style.color = ''; babyNameElement.style.textShadow = ''; // Reset inline
    if(isBoy) {
        babyNameElement.innerText = "APOLO";
        babyNameElement.className = "big-name boy-text";
        moonVisual.style.textShadow = "0 0 60px #00ffff";
    } else {
        babyNameElement.innerText = "SELENE";
        babyNameElement.className = "big-name girl-text";
        moonVisual.style.textShadow = "0 0 60px #ff00ff";
    }
    setTimeout(() => moonVisual.style.opacity = 1, 500);
    setTimeout(() => { subVisual.style.opacity = 1; startConfetti(); }, 1000);
}

function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const particles = [];
    const colors = isBoy ? ['#00ffff', '#fff'] : ['#ff00ff', '#fff'];
    
    for(let i=0; i<200; i++) {
        particles.push({
            x: Math.random()*canvas.width, y: -10,
            size: Math.random()*5+3,
            sy: Math.random()*5+2, sx: Math.random()*4-2,
            c: colors[Math.floor(Math.random()*colors.length)]
        });
    }
    function loop() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p => {
            p.y += p.sy; p.x += p.sx;
            ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.size, p.size);
            if(p.y > canvas.height) { p.y = -10; p.x = Math.random()*canvas.width; }
        });
        requestAnimationFrame(loop);
    }
    loop();
}