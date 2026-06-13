document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('game-grid');
    const searchInput = document.getElementById('search-input');
    
    const API_KEY = 'e9d1dd0d27f1d4d343fe9f272369d874';

    // 10 популярных игр для стартовой страницы (Steam App ID)
    // CS2, Cyberpunk, GTA V, BG3, Witcher 3, Stardew, Apex, DBD, Dota 2, Rust
    const defaultGames = [730, 1091500, 271590, 1086940, 292030, 413150, 1172470, 381210, 570, 252490];

    function createGameCard(imageUrl, title) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.style.backgroundImage = `url('${imageUrl}')`;
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';
        card.title = title; 

        card.addEventListener('click', () => {
            alert(`Имитация запуска: ${title}`);
        });

        return card;
    }

    async function fetchApi(endpoint) {
        const url = `https://corsproxy.io/?${encodeURIComponent(`https://www.steamgriddb.com/api/v2${endpoint}`)}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            }
        });
        return await response.json();
    }

    // Загрузка дефолтных игр при старте
    async function loadDefaultGames() {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Загрузка витрины...</div>';
        
        try {
            const cards = [];
            for (const steamId of defaultGames) {
                // Ищем по Steam ID
                const gridData = await fetchApi(`/grids/steam/${steamId}?dimensions=600x900`);
                
                if (gridData.success && gridData.data.length > 0) {
                    const imageUrl = gridData.data[0].url;
                    // API возвращает только картинки, название не вытащить просто так, поэтому ставим заглушку для title
                    const card = createGameCard(imageUrl, "Популярная игра");
                    cards.push(card);
                }
            }
            grid.innerHTML = ''; // Очищаем статус загрузки
            cards.forEach(card => grid.appendChild(card));
        } catch (error) {
            console.error("Ошибка загрузки дефолтных игр:", error);
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: red;">Ошибка сети.</div>';
        }
    }

    // Поиск по названию
    async function searchGames(query) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Ищем игры...</div>';
        
        try {
            const searchData = await fetchApi(`/search/autocomplete/${encodeURIComponent(query)}`);
            
            if (!searchData.success || searchData.data.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Ничего не найдено 😢</div>';
                return;
            }

            const topResults = searchData.data.slice(0, 10);
            grid.innerHTML = '';

            for (const game of topResults) {
                // Здесь ищем уже по внутреннему ID SteamGridDB
                const gridData = await fetchApi(`/grids/game/${game.id}?dimensions=600x900`);
                
                if (gridData.success && gridData.data.length > 0) {
                    const imageUrl = gridData.data[0].url;
                    const card = createGameCard(imageUrl, game.name);
                    grid.appendChild(card);
                }
            }
        } catch (error) {
            console.error("Ошибка поиска:", error);
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: red;">Ошибка сети. Попробуйте еще раз.</div>';
        }
    }

    // Слушатель для поиска (Debounce)
    let typingTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(typingTimer);
        const query = e.target.value.trim();
        
        if (query.length > 2) {
            typingTimer = setTimeout(() => {
                searchGames(query);
            }, 800);
        } else if (query.length === 0) {
            // Если строку поиска очистили, возвращаем дефолтные игры
            loadDefaultGames();
        }
    });

    // Вызываем загрузку популярных игр сразу при открытии страницы
    loadDefaultGames();
});