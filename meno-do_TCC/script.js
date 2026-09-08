function animarEBotao(botao, acao) {
    // Adiciona a classe que executa a animação CSS
    botao.classList.add('zelda-fade-out');

    // Faz o outro botão sumir suavemente junto
    const botoes = document.querySelectorAll('.menu-btn');
    botoes.forEach(btn => {
        if (btn !== botao) {
            btn.style.transition = 'opacity 0.3s ease';
            btn.style.opacity = '0';
        }
    });

    // Espera o tempo exato da animação (0.6 segundos) para mudar de tela
    setTimeout(() => {
        if (acao === 'login') {
            // Redireciona para a página de Login
            window.location.href = './login.html';
        } else if (acao === 'cadastro') {
            // Redireciona para a página de Cadastro
            window.location.href = './cadastro.html';
        }
    }, 600); 
}
