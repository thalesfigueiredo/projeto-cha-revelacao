// ============================================
// 🔐 CONFIGURAÇÃO DA SENHA (EDITE AQUI)
// ============================================
const SENHA_SECRETA = "1234"; // Coloque a senha que você quiser aqui
// ============================================

// Elementos
const modal = document.getElementById('password-modal');
const input = document.getElementById('passInput');
const errorMsg = document.getElementById('errorMsg');

// Funções da Senha
function openPasswordModal() {
    modal.style.display = 'flex';
    input.value = '';
    errorMsg.style.display = 'none';
    input.focus();
}

function closePasswordModal() {
    modal.style.display = 'none';
}

function checkPassword() {
    if (input.value === SENHA_SECRETA) {
        // Senha correta: Redireciona para a revelação
        window.location.href = "revelacao/index.html";
    } else {
        // Senha errada: Mostra erro e treme
        errorMsg.style.display = 'block';
        input.value = '';
        input.focus();
    }
}

// Permite apertar ENTER para confirmar
input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') checkPassword();
});

// Estrelas de fundo
const bg = document.getElementById('bg');
for(let i=0; i<60; i++) {
    let s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    let size = Math.random() * 3;
    s.style.width = size + 'px'; s.style.height = size + 'px';
    s.style.animationDuration = (Math.random() * 2 + 1) + 's';
    bg.appendChild(s);
}