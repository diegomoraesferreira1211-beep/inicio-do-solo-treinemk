const API_URL = "http://127.0.0.1:5000"; // Ajuste para a porta do seu backend Python

document.addEventListener("DOMContentLoaded", () => {
    // 1. CARREGA OS DADOS DO BACKEND VIA API
    fetchUserData();

    // 2. SISTEMA DE TROCA DE ABAS COM TRANSIÇÃO ESTILO PERSONA / SOLO LEVELING
    // Seleciona tanto as abas normais (.nav-item) quanto a redonda (.nav-item-profile-circle)
    const navItems = document.querySelectorAll(".nav-item, .nav-item-profile-circle");
    const telas = document.querySelectorAll(".tela-container");
    const headerTitle = document.getElementById("header-title");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            // Se a aba já estiver ativa, impede cliques repetidos
            if (item.classList.contains("active")) return;

            // Remove a classe ativa de todos os botões e limpa animações anteriores das telas
            navItems.forEach(nav => nav.classList.remove("active"));
            telas.forEach(tela => {
                tela.classList.remove("active", "system-fade-in");
            });

            // Ativa a aba atual selecionada pelo usuário
            item.classList.add("active");
            
            const targetTelaId = item.getAttribute("data-target");
            const targetTela = document.getElementById(targetTelaId);
            
            if (targetTela) {
                targetTela.classList.add("active");
                
                // Força o navegador a reiniciar a animação de entrada estilizada (Persona/Solo)
                void targetTela.offsetWidth; 
                targetTela.classList.add("system-fade-in");
            }

            // Atualiza o texto do Header de forma dinâmica se o elemento existir no DOM
            if (headerTitle) {
                headerTitle.innerText = item.getAttribute("data-title");
            }
        });
    });
});

// Função para buscar dados da API do Python
async function fetchUserData() {
    try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();

        // Atualiza os dados dinâmicos na tela de Perfil / Status
        const lvlEl = document.getElementById("user-lvl");
        const expEl = document.getElementById("exp-progress");
        
        if (lvlEl) lvlEl.innerText = data.lvl;
        if (expEl) expEl.style.width = `${data.exp}%`;

        // Renderiza a lista de exercícios vinda do backend
        renderExercicios(data.exercicios);
    } catch (error) {
        console.error("Erro ao conectar com o servidor Python do Sistema:", error);
    }
}

// Injeta os exercícios dinamicamente via JS contemplando sua imagem do homem levantando peso
function renderExercicios(exercicios) {
    const container = document.getElementById("lista-exercicios");
    if (!container) return;
    
    container.innerHTML = ""; 

    exercicios.forEach(ex => {
        const card = document.createElement("div");
        card.className = "quest-card system-fade-in"; // Cards surgem com a animação de transição suave
        card.innerHTML = `
            <div class="quest-card-content">
                <span class="quest-tag">${ex.tag}</span>
                <h2 class="quest-title">${ex.nome}</h2>
                
                <!-- Estrutura interna com o ícone personalizado do seu TCC -->
                <div class="exercise-icon-container" style="margin-bottom: 12px;">
                    <img src="icons/homem-levantando.png" alt="" class="exercise-thumb">
                    <span class="exercise-label">TREINO COM PESO PENA</span>
                </div>

                <div class="carga-selector">
                    <button class="carga-btn" onclick="animarEAlterarCarga(this, ${ex.id}, ${ex.carga - 5})">-</button>
                    <span class="carga-value">${ex.carga} KG</span>
                    <button class="carga-btn" onclick="animarEAlterarCarga(this, ${ex.id}, ${ex.carga + 5})">+</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Intermediário para rodar animação de clique no botão antes de chamar a API
function animarEAlterarCarga(botao, id, novaCarga) {
    botao.classList.add("btn-pulse");
    botao.addEventListener("animationend", () => {
        botao.classList.remove("btn-pulse");
    }, { once: true });

    alterarCarga(id, novaCarga);
}

// Envia a nova carga calculada de volta para o back-end atualizar
async function alterarCarga(id, novaCarga) {
    if (novaCarga < 0) return; 

    try {
        const response = await fetch(`${API_URL}/update-carga`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id, carga: novaCarga })
        });
        const data = await response.json();
        
        if (data.success) {
            renderExercicios(data.exercicios);
        }
    } catch (error) {
        console.error("Erro ao atualizar carga na API:", error);
    }
}
