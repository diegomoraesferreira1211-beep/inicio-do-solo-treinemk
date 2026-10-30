// A música é criada uma única vez. As páginas trocam o conteúdo sem recarregar o documento.
(() => {
    const audio = new Audio('./imagens-e-sons/musica_de_fundo.mp3');
    audio.loop = true;
    audio.volume = 0.25;
    audio.preload = 'auto';
    audio.autoplay = true;

    const buttonSound = new Audio('./imagens-e-sons/zelda_botw.mp3');
    buttonSound.preload = 'auto';
    buttonSound.volume = 0.5;
    buttonSound.playbackRate = 1.15;
    buttonSound.load();

    const playButtonSound = () => {
        buttonSound.currentTime = 0;
        buttonSound.play().catch(() => {});
    };

    const startMusic = () => {
        if (audio.paused) audio.play().catch(() => {});
    };

    // Tenta iniciar ao abrir; se o navegador bloquear, qualquer primeiro clique libera o áudio.
    startMusic();
    document.addEventListener('click', startMusic, { once: true });

    async function showPage(url, addHistory = true) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Não foi possível carregar a página.');
            const html = await response.text();
            const nextDocument = new DOMParser().parseFromString(html, 'text/html');
            const nextContent = nextDocument.querySelector('#app-content');
            const currentContent = document.querySelector('#app-content');
            if (!nextContent || !currentContent) throw new Error('Conteúdo da página não encontrado.');

            currentContent.innerHTML = nextContent.innerHTML;
            menuNavigationPending = false;
            document.title = nextDocument.title;
            if (addHistory) history.pushState({}, '', url);
        } catch (error) {
            // Fallback para servidor estático que não permite fetch.
            window.location.href = url;
        }
    }

    let menuNavigationPending = false;
    document.addEventListener('pointerdown', event => {
        if (event.button !== 0 || menuNavigationPending) return;
        if (event.target.closest('.menu-options .menu-btn')) playButtonSound();
    }, true);

    document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const destination = new URL(link.href, window.location.href);
        if (destination.origin !== window.location.origin || !destination.pathname.endsWith('.html')) return;
        event.preventDefault();
        startMusic();

        if (link.matches('.menu-options .menu-btn')) {
            if (menuNavigationPending) return;
            menuNavigationPending = true;
            if (event.detail === 0) playButtonSound();
            link.classList.add('zelda-fade-out');
            document.querySelectorAll('.menu-options .menu-btn').forEach(button => {
                if (button !== link) {
                    button.style.transition = 'opacity 0.3s ease';
                    button.style.opacity = '0';
                }
            });
            window.setTimeout(() => showPage(destination.href), 600);
            return;
        }

        showPage(destination.href);
    });

    window.addEventListener('popstate', () => showPage(window.location.href, false));
    document.addEventListener('submit', event => event.preventDefault());
})();






