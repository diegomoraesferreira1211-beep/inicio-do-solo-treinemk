const API_URL = "http://127.0.0.1:5000"; // Ajuste para a porta do seu backend Python

// Inicializa o som do clique usando o arquivo fornecido
const somClique = new Audio("wii-botton.mp3");

// Função utilitária para tocar o som de forma responsiva (reinicia se clicado rápido)
function tocarSomWii() {
    somClique.currentTime = 0;
    somClique.play().catch(error => {
        console.log("Áudio bloqueado pelo navegador. Aguardando interação do usuário.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. CARREGA OS DADOS DO BACKEND OU DADOS LOCAIS SE ESTIVER OFFLINE
    fetchUserData();

    // 2. SISTEMA DE TROCA DE ABAS COM TRANSIÇÃO ESTILO PERSONA / SOLO LEVELING (UNIFICADO)
    const navItems = document.querySelectorAll(".nav-item, .nav-item-profile-circle");
    const telas = document.querySelectorAll(".tela-container");
    const headerTitle = document.getElementById("header-title");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            // Se a aba já estiver ativa, impede cliques repetidos
            if (item.classList.contains("active")) return;

            // TOCAR SOM: Toca o som do Wii ao mudar de aba
            tocarSomWii();

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

// Função para buscar dados da API do Python (com proteção offline)
async function fetchUserData() {
    try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();

        // Atualiza os dados dinâmicos na tela de Perfil / Status vindo do Python
        const lvlEl = document.getElementById("user-lvl");
        const expEl = document.getElementById("exp-progress");
        
        if (lvlEl) lvlEl.innerText = data.lvl;
        if (expEl) expEl.style.width = `${data.exp}%`;

        // Renderiza a lista de exercícios vinda do backend
        renderExercicios(data.exercicios);
    } catch (error) {
        console.warn("Servidor Python offline. Carregando dados locais de teste para a HUD...");
        
        // DADOS LOCAIS: Impede que a tela fique preta ou vazia se o Python estiver desligado
        const dadosLocaisDeTeste = [
            {
                "id": 1,
                "tag": "QUEST 1",
                "nome": "TREINO DO DIA",
                "carga": 10
            }
        ];
        
        // Atualiza o nível estático para teste offline se necessário
        const lvlEl = document.getElementById("user-lvl");
        if (lvlEl) lvlEl.innerText = "1";
        
        renderExercicios(dadosLocaisDeTeste);
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
            <div class="quest-card-content" style="background-color: #0f121d; border: 1px solid #1e2538; padding: 15px; margin-bottom: 15px;">
                <span class="quest-tag" style="font-size: 10px; color: #64748b;">${ex.tag}</span>
                <h2 class="quest-title" style="font-size: 14px; color: #e2e8f0; margin-bottom: 10px;">${ex.nome}</h2>
                
                <!-- Estrutura interna com o ícone personalizado do seu TCC -->
                <div class="exercise-icon-container" style="display: flex; align-items: center; justify-content: center; gap: 10px; background-color: #161b29; padding: 12px; border: 1px solid #20273b; margin-bottom: 12px;">
                    <img src="icons/homem-levantando.png" alt="" class="exercise-thumb">
                    <span class="exercise-label">TREINO COM PESO PENA</span>
                </div>

                <div class="carga-selector" style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <button class="carga-btn" onclick="animarEAlterarCarga(this, ${ex.id}, ${ex.carga - 5})">-</button>
                    <span class="carga-value" style="font-size: 12px; font-weight: 600; color: #f1f5f9;">${ex.carga} KG</span>
                    <button class="carga-btn" onclick="animarEAlterarCarga(this, ${ex.id}, ${ex.carga + 5})">+</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Intermediário para rodar animação de clique no botão antes de chamar a API
function animarEAlterarCarga(botao, id, novaCarga) {
    // TOCAR SOM: Toca o som do Wii ao ajustar o peso do treino também!
    tocarSomWii();

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
        console.error("Erro ao atualizar carga na API. Atualizando localmente para teste...");
        
        // Atualização visual temporária offline caso falte o backend rodando
        const valoresCarga = botao => {
            const valorEl = botao.parentElement.querySelector('.carga-value');
            if(valorEl) valorEl.innerText = `${novaCarga} KG`;
        };
    }
}
// Intermediário para rodar animação de clique e atualizar o peso INSTANTANEAMENTE
function animarEAlterarCarga(botao, id, novaCarga) {
    if (novaCarga < 0) return;

    // TOCAR SOM: Toca o som do Wii na hora
    tocarSomWii();

    // Efeito visual opcional
    botao.classList.add("btn-pulse");
    botao.addEventListener("animationend", () => {
        botao.classList.remove("btn-pulse");
    }, { once: true });

    // 1. ATUALIZAÇÃO LOCAL IMEDIATA (Tira todo o delay da tela)
    const containerPai = botao.parentElement;
    const valorCargaEl = containerPai.querySelector(".carga-value");
    
    if (valorCargaEl) {
        valorCargaEl.innerText = `${novaCarga} KG`;
        
        // Atualiza as funções dos botões de + e - com os novos valores para o próximo clique
        const botoes = containerPai.querySelectorAll(".carga-btn");
        if (botoes.length === 2) {
            botoes[0].setAttribute("onclick", `animarEAlterarCarga(this, ${id}, ${novaCarga - 5})`);
            botoes[1].setAttribute("onclick", `animarEAlterarCarga(this, ${id}, ${novaCarga + 5})`);
        }
    }

    // 2. ENVIA PARA O PYTHON EM SEGUNDO PLANO (Sem travar o usuário)
    alterarCargaNoServidor(id, novaCarga);
}

// Envia os dados para o back-end em segundo plano, sem gerar lag na interface
async_alterarCargaNoServidor(id, novaCarga);

async function alterarCargaNoServidor(id, novaCarga) {
    try {
        await fetch(`${API_URL}/update-carga`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id, carga: novaCarga })
        });
    } catch (error) {
        // Ignora silenciosamente o erro se o Python estiver offline para não travar a HUD
        console.log("Servidor offline. Carga mantida localmente.");
    }
}
