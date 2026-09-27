const RSS_URL = 'https://gazeta.uz';
const API_URL = `https://rss2json.com{encodeURIComponent(RSS_URL)}`;

// Глобальный массив для хранения загруженных новостей
let allNews = [];

async function fetchNews() {
    const container = document.getElementById('news-container');
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.status !== 'ok') throw new Error('Ошибка сети');
        
        // Сохраняем обработанные новости
        allNews = data.items.map((item, index) => {
            let imageUrl = item.enclosure?.link || item.thumbnail;
            
            // Если у источника нет фото, используем красивые обложки про Узбекистан
            if (!imageUrl) {
                const fallbacks = [
                    'https://unsplash.com',
                    'https://unsplash.com',
                    'https://unsplash.com'
                ];
                imageUrl = fallbacks[index % fallbacks.length];
            }

            const cleanDescription = cleanText(item.description, 140);
            
            return {
                title: item.title,
                link: item.link,
                image: imageUrl,
                description: cleanDescription,
                date: new Date(item.pubDate).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })
            };
        });

        // Первичный рендеринг новостей
        renderNews(allNews);

    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="loading"><p>Не удалось подключиться к новостным серверам Узбекистана. Попробуйте позже.</p></div>';
    }
}

// Функция отображения карточек на странице
function renderNews(newsList) {
    const container = document.getElementById('news-container');
    container.innerHTML = '';

    if (newsList.length === 0) {
        container.innerHTML = '<div class="loading"><p>По вашему запросу ничего не найдено 😔</p></div>';
        return;
    }

    newsList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="image-box">
                <img src="${item.image}" alt="Фото новости" class="news-image" loading="lazy">
            </div>
            <div class="news-content">
                <h2 class="news-title">
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                </h2>
                <p class="news-snippet">${item.description}...</p>
                <div class="news-footer">
                    <span>⏱ ${item.date}</span>
                    <a href="${item.link}" target="_blank" class="read-more">Читать далее →</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Функция очистки описания от системного HTML-мусора
function cleanText(html, maxLength) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || "";
    return text.length > maxLength ? text.substring(0, maxLength) : text;
}

// Слушатель событий для поисковой строки (Срабатывает «на лету»)
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchWord = e.target.value.toLowerCase().trim();
    
    // Фильтруем массив новостей по совпадению в заголовке или описании
    const filteredNews = allNews.filter(news => {
        return news.title.toLowerCase().includes(searchWord) || 
               news.description.toLowerCase().includes(searchWord);
    });

    renderNews(filteredNews);
});

// Старт системы
document.addEventListener('DOMContentLoaded', fetchNews);
