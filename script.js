document.addEventListener('DOMContentLoaded', function() {
    const testButton = document.getElementById('test-btn');
    const headerFavoriteBtn = document.getElementById('header-favorite-btn');
    const movieModal = document.getElementById('movie-modal');
    const closeMovieModal = document.getElementById('close-movie-modal');
    const backToGenres = document.getElementById('back-to-genres');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const backToHomeBtn = document.getElementById('back-to-home');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = {
        home: document.getElementById('home-section'),
        genres: document.getElementById('genres-section'),
        genre: document.getElementById('genre-section'),
        test: document.getElementById('test-section'),
        favorites: document.getElementById('favorites-section'),
        search: document.getElementById('search-results')
    };
    let currentQuestion = 1;
    const totalQuestions = 4;
    let currentGenre = null;
    let currentGenrePage = 1;
    const filmsPerPage = 20;
    let userFavorites = safeGetFavorites();

    const API_KEY = 'c82dafc2-df29-4dcc-b256-092dcff03bd1';

    const genreMap = {
        comedy: { id: 13, name: 'КОМЕДИЯ' },
        action: { id: 1, name: 'БОЕВИК' },
        drama: { id: 8, name: 'ДРАМА' },
        'sci-fi': { id: 17, name: 'ФАНТАСТИКА' },
        fantasy: { id: 6, name: 'ФЭНТЕЗИ' },
        horror: { id: 19, name: 'УЖАСЫ' }
    };

    const movieDatabase = [
        { id: 1, title: "МАЛЬЧИШНИК В ВЕГАСЕ", genre: "КОМЕДИЯ", rating: "7.7", description: "Идеальная комедия для веселого вечера! Безумные приключения друзей перед свадьбой.", mood: "funny", duration: "medium", period: "modern", tension: "low" },
        { id: 2, title: "ОДНОКЛАССНИКИ", genre: "КОМЕДИЯ", rating: "7.1", description: "Смешная и трогательная история о встрече выпускников через 10 лет.", mood: "funny", duration: "medium", period: "modern", tension: "medium" },
        { id: 3, title: "ПОБЕГ ИЗ ШОУШЕНКА", genre: "ДРАМА", rating: "9.3", description: "Шедевр кинематографа о надежде, дружбе и силе человеческого духа.", mood: "thoughtful", duration: "long", period: "historical", tension: "medium" },
        { id: 4, title: "БЕЗУМНЫЙ МАКС", genre: "БОЕВИК", rating: "8.1", description: "Захватывающий постапокалиптический экшен с невероятными трюками.", mood: "adventurous", duration: "long", period: "future", tension: "high" },
        { id: 5, title: "ДНЕВНИК ПАМЯТИ", genre: "МЕЛОДРАМА", rating: "7.8", description: "Трогательная история вечной любви, которая преодолевает все препятствия.", mood: "romantic", duration: "medium", period: "modern", tension: "low" },
        { id: 6, title: "ИНТЕРСТЕЛЛАР", genre: "ФАНТАСТИКА", rating: "8.6", description: "Эпическое путешествие через пространство и время в поисках нового дома для человечества.", mood: "thoughtful", duration: "long", period: "future", tension: "medium" },
        { id: 7, title: "ВЛАСТЕЛИН КОЛЕЦ", genre: "ФЭНТЕЗИ", rating: "8.8", description: "Эпическая сага о борьбе добра и зла в мире Средиземья.", mood: "adventurous", duration: "long", period: "fantasy", tension: "high" },
        { id: 8, title: "СИЯНИЕ", genre: "УЖАСЫ", rating: "8.4", description: "Психологический хоррор о писателе, сходящем с ума в отдаленном отеле.", mood: "thoughtful", duration: "long", period: "modern", tension: "high" }
    ];

    init();

    function init() {
        setupEventListeners();
        setupTestLogic();
        setupGenreCards();
        loadFavorites();
        showSection('home');
        const restartBtn = document.querySelector('.restart-test-btn');
        if (restartBtn) restartBtn.addEventListener('click', resetTest);
    }

    function setupEventListeners() {
        if (testButton) testButton.addEventListener('click', () => { showSection('test'); setActiveNav(document.querySelector('[data-section="test"]')); });
        if (headerFavoriteBtn) headerFavoriteBtn.addEventListener('click', () => { showSection('favorites'); setActiveNav(document.querySelector('[data-section="favorites"]')); });
        navLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); const s = link.getAttribute('data-section'); showSection(s); setActiveNav(link); }));
        if (closeMovieModal) closeMovieModal.addEventListener('click', () => { movieModal.style.display = 'none'; document.body.style.overflow = 'auto'; });
        movieModal.addEventListener('click', e => { if (e.target === movieModal) { movieModal.style.display = 'none'; document.body.style.overflow = 'auto'; } });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') { movieModal.style.display = 'none'; document.body.style.overflow = 'auto'; } });
        if (backToGenres) backToGenres.addEventListener('click', () => { showSection('genres'); setActiveNav(document.querySelector('[data-section="genres"]')); });
        if (backToHomeBtn) backToHomeBtn.addEventListener('click', () => { showSection('home'); setActiveNav(document.querySelector('[data-section="home"]')); searchInput.value = ''; });
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => { if (currentGenrePage > 1) { currentGenrePage--; loadGenreFilms(currentGenre); } });
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => { currentGenrePage++; loadGenreFilms(currentGenre); });
        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        if (searchInput) searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
    }

    function setupTestLogic() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        if (prevBtn) prevBtn.addEventListener('click', prevQuestion);
        if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
        if (submitBtn) submitBtn.addEventListener('click', handleTestSubmit);
        updateTestProgress();
    }

    function setupGenreCards() {
        const genreCards = document.querySelectorAll('.genre-main-card');
        genreCards.forEach(card => {
            card.addEventListener('click', async () => {
                const genre = card.getAttribute('data-genre');
                currentGenre = genre;
                currentGenrePage = 1;
                if (genreMap[genre]) await loadGenreFilms(genre);
                else showError('Жанр не найден');
            });
        });
    }

    function showSection(name) {
        Object.keys(sections).forEach(k => { if (sections[k]) sections[k].style.display = 'none'; });
        if (sections[name]) {
            sections[name].style.display = 'block';
            if (name === 'home') { animateHomeSection(); loadPopularFilms(); }
            else if (name === 'favorites') loadFavorites();
            else if (name === 'test') resetTest();
        }
    }

    function setActiveNav(link) {
        navLinks.forEach(l => l.classList.remove('active'));
        if (link) link.classList.add('active');
    }

    function safeGetFavorites() {
        try { const d = localStorage.getItem('userFavorites'); return d ? JSON.parse(d) : []; }
        catch { console.error('Ошибка чтения избранного'); return []; }
    }

    function safeSetFavorites(favs) {
        try { localStorage.setItem('userFavorites', JSON.stringify(favs)); }
        catch { console.error('Ошибка сохранения избранного'); showError('Не удалось сохранить избранное'); }
    }

    function addMovieToFavorites(movie) {
        const exists = userFavorites.some(f => f.id === movie.id);
        if (!exists) {
            userFavorites.push({ id: movie.id, title: movie.title, genre: movie.genre, rating: movie.rating, poster: movie.poster || null, addedAt: new Date().toLocaleDateString('ru-RU') });
            safeSetFavorites(userFavorites);
            showSuccessMessage(`Фильм "${movie.title}" добавлен в избранное!`);
            loadFavorites();
        } else showInfo('Этот фильм уже в избранном');
    }

    function loadFavorites() {
        const grid = document.getElementById('favorites-grid');
        if (!grid) return;
        grid.innerHTML = '';
        if (userFavorites.length === 0) {
            grid.innerHTML = `<div class="empty-favorites">В избранном пока пусто<br><small>Добавляйте фильмы из рекомендаций или теста</small></div>`;
            return;
        }
        userFavorites.forEach(m => {
            const el = document.createElement('div');
            el.className = 'favorite-item';
            el.innerHTML = `<h4>${m.title}</h4><span class="movie-genre">${m.genre}</span><div>Рейтинг: ${m.rating}/10</div><small>Добавлено: ${m.addedAt}</small><button class="remove-favorite" data-id="${m.id}">Удалить</button>`;
            grid.appendChild(el);
        });
        document.querySelectorAll('.remove-favorite').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const id = parseInt(b.getAttribute('data-id')); removeFromFavorites(id); }));
    }

    function removeFromFavorites(id) {
        userFavorites = userFavorites.filter(m => m.id !== id);
        safeSetFavorites(userFavorites);
        showSuccessMessage('Фильм удален из избранного');
        loadFavorites();
    }

    function nextQuestion() {
        const cur = document.getElementById(`question${currentQuestion}`);
        if (!cur.querySelector('input:checked')) { showError('Выберите вариант ответа!'); return; }
        cur.classList.remove('active');
        currentQuestion++;
        showQuestion(currentQuestion);
        updateTestProgress();
    }

    function prevQuestion() {
        document.getElementById(`question${currentQuestion}`).classList.remove('active');
        currentQuestion--;
        showQuestion(currentQuestion);
        updateTestProgress();
    }

    function showQuestion(num) {
        const q = document.getElementById(`question${num}`);
        if (q) q.classList.add('active');
        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        const prev = document.getElementById('prev-btn');
        const next = document.getElementById('next-btn');
        const submit = document.getElementById('submit-btn');
        prev.disabled = currentQuestion === 1;
        if (currentQuestion === totalQuestions) { next.style.display = 'none'; submit.style.display = 'block'; }
        else { next.style.display = 'block'; submit.style.display = 'none'; }
    }

    function updateTestProgress() {
        const fill = document.getElementById('progress-fill');
        const txt = document.getElementById('progress-text');
        const p = (currentQuestion / totalQuestions) * 100;
        fill.style.width = `${p}%`;
        txt.textContent = `Вопрос ${currentQuestion} из ${totalQuestions}`;
    }

    function resetTest() {
        currentQuestion = 1;
        const form = document.getElementById('test-form');
        form.reset();
        showQuestion(1);
        updateTestProgress();
        updateNavigationButtons();
        const res = document.getElementById('test-result');
        res.style.display = 'none';
        form.style.display = 'block';
    }

    function handleTestSubmit(e) {
        e.preventDefault();
        const fd = new FormData(document.getElementById('test-form'));
        const ans = { mood: fd.get('mood'), duration: fd.get('duration'), period: fd.get('period'), tension: fd.get('tension') };
        if (!ans.mood || !ans.duration || !ans.period || !ans.tension) { showError('Ответьте на все вопросы!'); return; }
        const rec = findMovieRecommendation(ans);
        showTestResult(rec);
    }

    function findMovieRecommendation(ans) {
        const full = movieDatabase.filter(m => m.mood === ans.mood && m.duration === ans.duration && m.period === ans.period && m.tension === ans.tension);
        if (full.length) return full[Math.floor(Math.random() * full.length)];
        const part = movieDatabase.filter(m => (m.mood === ans.mood && m.duration === ans.duration) || (m.period === ans.period && m.tension === ans.tension));
        if (part.length) return part[Math.floor(Math.random() * part.length)];
        return movieDatabase[Math.floor(Math.random() * movieDatabase.length)];
    }

    function showTestResult(rec) {
        const form = document.getElementById('test-form');
        const res = document.getElementById('test-result');
        const mov = document.getElementById('recommended-movie');
        form.style.display = 'none';
        mov.innerHTML = `<h4>${rec.title}</h4><p>${rec.genre}</p><p>Рейтинг: ${rec.rating}/10</p><p style="margin-top:15px;font-style:italic;">${rec.description}</p><button class="add-to-favorites-btn" data-movie='${JSON.stringify(rec)}'>Добавить в избранное</button>`;
        mov.querySelector('.add-to-favorites-btn').addEventListener('click', e => { const d = JSON.parse(e.target.getAttribute('data-movie')); addMovieToFavorites(d); });
        res.style.display = 'block';
    }

    function animateHomeSection() {
        const cards = document.querySelectorAll('.movie-card');
        cards.forEach((c, i) => { c.style.animation = 'none'; setTimeout(() => c.style.animation = `slideUp 0.6s ease ${i*0.1}s forwards`, 10); });
    }

    function showSuccessMessage(msg) { showNotification(msg, 'success'); }
    function showError(msg) { showNotification(msg, 'error'); }
    function showInfo(msg) { showNotification(msg, 'info'); }

    function showNotification(msg, type) {
        const n = document.createElement('div');
        n.className = `notification notification-${type}`;
        n.textContent = msg;
        document.body.appendChild(n);
        setTimeout(() => { n.style.animation = 'slideOutRight 0.3s ease'; setTimeout(() => n.remove(), 300); }, 3000);
    }

    async function fetchKinopoisk(endpoint, version = 'v2.2') {
        try {
            const r = await axios.get(`https://kinopoiskapiunofficial.tech/api/${version}/${endpoint}`, {
                headers: { 'X-API-KEY': API_KEY, 'Content-Type': 'application/json' }
            });
            return r.data;
        } catch (e) { console.error(e); showError('Ошибка загрузки данных из Кинопоиска'); return null; }
    }

    async function loadPopularFilms() {
        const grid = document.getElementById('recommendations-grid');
        grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;">Загрузка...</div>';
        const data = await fetchKinopoisk('films/top?type=TOP_100_POPULAR_FILMS&page=1');
        if (!data || !data.films) { grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;">Ошибка загрузки</div>'; return; }
        grid.innerHTML = '';
        data.films.slice(0, 4).forEach(f => grid.appendChild(createMovieCard(f)));
        animateHomeSection();
    }

    async function loadGenreFilms(genre) {
        const gId = genreMap[genre].id;
        const gName = genreMap[genre].name;
        document.getElementById('genre-title').textContent = `Фильмы в жанре: ${gName}`;
        const grid = document.getElementById('genre-films-grid');
        grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;">Загрузка...</div>';
        const data = await fetchKinopoisk(`films?genres=${gId}&order=RATING&type=FILM&page=${currentGenrePage}`);
        if (!data || !data.items) { grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;">Ошибка загрузки</div>'; return; }
        grid.innerHTML = '';
        data.items.slice(0, filmsPerPage).forEach(f => grid.appendChild(createMovieCard(f, true)));
        prevPageBtn.disabled = currentGenrePage === 1;
        nextPageBtn.disabled = data.pagesCount <= currentGenrePage;
        showSection('genre');
        setActiveNav(null);
    }

    async function performSearch() {
        const q = searchInput.value.trim();
        if (!q) { showError('Введите название фильма!'); return; }
        const grid = document.getElementById('search-results-grid');
        grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;">Поиск...</div>';
        try {
            const data = await fetchKinopoisk(`films/search-by-keyword?keyword=${encodeURIComponent(q)}&page=1`);
            grid.innerHTML = '';
            if (!data || !data.films || data.films.length === 0) { grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;">Ничего не найдено</div>'; showSection('search'); return; }
            data.films.slice(0, 20).forEach(f => grid.appendChild(createMovieCard(f, true)));
            showSection('search');
        } catch { grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;">Ошибка поиска</div>'; }
    }

    function createMovieCard(film, useKinopoiskId = false) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.dataset.filmId = useKinopoiskId ? film.kinopoiskId : film.filmId;
        const poster = film.posterUrlPreview || film.posterUrl;
        const title = film.nameRu || film.nameEn;
        const genres = film.genres ? film.genres.map(g => g.genre).join(' / ') : 'Жанр не указан';
        const rating = film.ratingKinopoisk || film.rating || 'N/A';
        card.innerHTML = `
            ${poster ? `<img src="${poster}" alt="${title}" class="movie-poster">` : `<div class="movie-poster" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-size:48px;">К</div>`}
            <div class="movie-info">
                <h3>${title}</h3>
                <p>${genres}</p>
                <div class="movie-rating">Рейтинг: ${rating}/10</div>
                <button class="add-to-favorites-kp" data-movie='${JSON.stringify({id: useKinopoiskId ? film.kinopoiskId : film.filmId, title, genre: genres, rating, poster})}'>В избранное</button>
            </div>`;
        const btn = card.querySelector('.add-to-favorites-kp');
        btn.addEventListener('click', e => { e.stopPropagation(); const d = JSON.parse(e.target.getAttribute('data-movie')); addMovieToFavorites(d); });
        card.addEventListener('click', e => { if (e.target.closest('button')) return; showMovieDetails(card.dataset.filmId); });
        return card;
    }

    async function showMovieDetails(id) {
        const details = document.getElementById('movie-details');
        details.innerHTML = '<div style="text-align:center;">Загрузка...</div>';
        const [filmData, staffData] = await Promise.all([fetchKinopoisk(`films/${id}`), fetchKinopoisk(`staff?filmId=${id}`, 'v1')]);
        if (!filmData || !staffData) { details.innerHTML = '<div style="text-align:center;">Ошибка загрузки</div>'; return; }
        const actors = staffData.filter(s => s.professionKey === 'ACTOR').slice(0, 10);
        details.innerHTML = `
            <div class="poster"><img src="${filmData.posterUrl}" alt="${filmData.nameRu || filmData.nameEn}"></div>
            <div class="info">
                <h2>${filmData.nameRu || filmData.nameEn}</h2>
                <p>${filmData.description || 'Описание отсутствует'}</p>
                <h3>Актёры:</h3>
                <ul>${actors.length ? actors.map(a => `<li>${a.nameRu || a.nameEn}</li>`).join('') : '<li>Нет данных</li>'}</ul>
                <button class="add-to-favorites-modal" data-movie='${JSON.stringify({id, title: filmData.nameRu || filmData.nameEn, genre: filmData.genres ? filmData.genres.map(g=>g.genre).join(' / ') : 'Не указан', rating: filmData.ratingKinopoisk || 'N/A', poster: filmData.posterUrl})}'>Добавить в избранное</button>
            </div>`;
        details.querySelector('.add-to-favorites-modal').addEventListener('click', () => { const d = JSON.parse(details.querySelector('.add-to-favorites-modal').getAttribute('data-movie')); addMovieToFavorites(d); movieModal.style.display = 'none'; document.body.style.overflow = 'auto'; });
        movieModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});
