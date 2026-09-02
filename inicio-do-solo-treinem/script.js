const API_URL = "http://127.0.0";

document.addEventListener("DOMContentLoaded", () => {
    // 1. CARREGA OS DADOS DO BACKEND VIA API
    fetchUserData();

    // 2. SISTEMA DE TROCA DE ABAS (FRONT-END)
    const navItems = document.querySelectorAll(".nav-item");
    const telas = document.querySelectorAll(".tela-container");
    const headerTitle = document.getElementById("header-title");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            // Remove classe ativa de todos os botões e telas
            navItems.forEach(nav => nav.classList.remove("active"));
            telas.forEach(tela => tela.classList.remove("active"));

            // Adiciona classe ativa na aba selecionada
            item.classList.add("active");
            
            const targetTelaId = item.getAttribute("data-target");
            document.getElementById(targetTelaId).classList.add("active");

            // Atualiza o texto do Header no estilo de Persona 5
            headerTitle.innerText = item.getAttribute("data-title");
        });
    });
});

// Função para buscar dados da API do Python
async function fetchUserData() {
    try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();

        // Atualiza a tela de Status
        document.getElementById("user-lvl").innerText = data.lvl;
        document.getElementById("exp-progress").style.width = `${data.exp}%`;

        // Renderiza a lista de exercícios da aba Missões
        renderExercicios(data.exercicios);
    } catch (error) {
        console.error("Erro ao conectar com o servidor Python do Sistema:", error);
    }
}

// Injeta os exercícios dinamicamente via JS
function renderExercicios(exercicios) {
    const container = document.getElementById("lista-exercicios");
    container.innerHTML = ""; // Limpa a lista

    exercicios.forEach(ex => {
        const card = document.createElement("div");
        card.className = "quest-card";
        card.innerHTML = `
            <div class="quest-card-content">
                <span class="quest-tag">${ex.tag}</span>
                <h2 class="quest-title">${ex.nome}</h2>
                <div class="carga-selector">
                    <button class="carga-btn" onclick="alterarCarga(${ex.id}, ${ex.carga - 5})">-</button>
                    <span class="carga-value">${ex.carga} KG</span>
                    <button class="carga-btn" onclick="alterarCarga(${ex.id}, ${ex.carga + 5})">+</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Envia a nova carga calculada de volta para o back-end atualizar
async function alterarCarga(id, novaCarga) {
    if (novaCarga < 0) return; // Evita peso negativo

    try {
        const response = await fetch(`${API_URL}/update-carga`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id, carga: novaCarga })
        });
        const data = await response.json();
        
        if (data.success) {
            // Re-renderiza a lista de treinos com o valor atualizado que veio do Python
            renderExercicios(data.exercicios);
        }
    } catch (error) {
        console.error("Erro ao atualizar carga na API:", error);
    }
}
