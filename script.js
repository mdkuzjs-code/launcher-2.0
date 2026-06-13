document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('game-grid');
    const placeholdersCount = 12; // Количество заглушек для отображения

    // Функция для создания одной карточки-заглушки
    function createPlaceholderCard(index) {
        const card = document.createElement('div');
        card.className = 'game-card';

        card.innerHTML = `
            <div class="placeholder-icon">🖼️</div>
            <div class="placeholder-text">Игра ${index}<br>Постер не загружен</div>
        `;

        // Добавим простую анимацию клика для интерактива
        card.addEventListener('click', () => {
            console.log(`Клик по игре ${index}`);
        });

        return card;
    }

    // Заполняем сетку
    for (let i = 1; i <= placeholdersCount; i++) {
        const cardElement = createPlaceholderCard(i);
        grid.appendChild(cardElement);
    }
});