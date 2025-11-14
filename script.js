document.addEventListener('DOMContentLoaded', function () {
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
    let userFavorites = JSON.parse(localStorage.getItem('userFavorites')) || [];

    const API_KEY = 'c82dafc2-df29-4dcc-b256-092dcff03bd1';

    const genreMap = {
        comedy: { id: 13, name: 'КОМЕДИЯ' },
        action: { id: 1, name: 'БОЕВИК' },
        drama: { id: 8, name: 'ДРАМА' },
        'sci-fi': { id: 17, name: 'ФАНТАСТИКА' },
        fantasy: { id: 6, name: 'ФЭНТЕЗИ' },
        horror: { id: 19, name: 'УЖАСЫ' }
    };
    let currentGenrePage = 1;
    const filmsPerPage = 20;
    let currentGenre = null;

    const movieDatabase = [
        {
            id: 1,
            title: "МАЛЬЧИШНИК В ВЕГАСЕ",
            genre: "КОМЕДИЯ",
            rating: "7.7",
            description: "Идеальная комедия для веселого вечера! Безумные приключения друзей перед свадьбой.",
            mood: "funny",
            duration: "medium",
            period: "modern",
            tension: "low"
        },
        {
            id: 2,
            title: "ОДНОКЛАССНИКИ",
            genre: "КОМЕДИЯ",
            rating: "7.1",
            description: "Смешная и трогательная история о встрече выпускников через 10 лет.",
            mood: "funny",
            duration: "medium",
            period: "modern",
            tension: "medium"
        },
        {
            id: 3,
            title: "ПОБЕГ ИЗ ШОУШЕНКА",
            genre: "ДРАМА",
            rating: "9.3",
            description: "Шедевр кинематографа о надежде, дружбе и силе человеческого духа.",
            mood: "thoughtful",
            duration: "long",
            period: "historical",
            tension: "medium"
        },
        {
            id: 4,
            title: "БЕЗУМНЫЙ МАКС",
            genre: "БОЕВИК",
            rating: "8.1",
            description: "Захватывающий постапокалиптический экшен с невероятными трюками.",
            mood: "adventurous",
            duration: "long",
            period: "future",
            tension: "high"
        },
        {
            id: 5,
            title: "ДНЕВНИК ПАМЯТИ",
            genre: "МЕЛОДРАМА",
            rating: "7.8",
            description: "Трогательная история вечной любви, которая преодолевает все препятствия.",
            mood: "romantic",
            duration: "medium",
            period: "modern",
            tension: "low"
        },
        {
            id: 6,
            title: "ИНТЕРСТЕЛЛАР",
            genre: "ФАНТАСТИКА",
            rating: "8.6",
            description: "Эпическое путешествие через пространство и время в поисках нового дома для человечества.",
            mood: "thoughtful",
            duration: "long",
            period: "future",
            tension: "medium"
        },
        {
            id: 7,
            title: "ВЛАСТЕЛИН КОЛЕЦ",
            genre: "ФЭНТЕЗИ",
            rating: "8.8",
            description: "Эпическая сага о борьбе добра и зла в мире Средиземья.",
            mood: "adventurous",
            duration: "long",
            period: "fantasy",
            tension: "high"
        },
        {
            id: 8,
            title: "СИЯНИЕ",
            genre: "УЖАСЫ",
            rating: "8.4",
            description: "Психологический хоррор о писателе, сходящем с ума в отдаленном отеле.",
            mood: "thoughtful",
            duration: "long",
            period: "modern",
            tension: "high"
        }
    ];

    init();

    function init() {
        setupEventListeners();
        setupTestLogic();
        setupGenreCards();
        loadFavorites();
        showSection('home');
    }

    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img.lazy');

        const lazyLoad = (img) => {
            const src = img.getAttribute('data-src');
            if (!src) return;
            img.src = src;
            img.onload = () => {
                img.classList.add('loaded');
                img.removeAttribute('data-src');
            };
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            lazyLoad(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: '100px' }
            );

            lazyImages.forEach((img) => observer.observe(img));
        } else {
            lazyImages.forEach(lazyLoad);
        }
    }

    function setupEventListeners() {
        if (testButton) {
            testButton.addEventListener('click', () => {
                showSection('test');
                setActiveNav(document.querySelector('[data-section="test"]'));
            });
        }

        if (headerFavoriteBtn) {
            headerFavoriteBtn.addEventListener('click', () => {
                showSection('favorites');
                setActiveNav(document.querySelector('[data-section="favorites"]'));
            });
        }

        navLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                showSection(section);
                setActiveNav(link);
            });
        });

        if (closeMovieModal) {
            closeMovieModal.addEventListener('click', () => {
                movieModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        movieModal.addEventListener('click', (e) => {
            if (e.target === movieModal) {
                movieModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                movieModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        if (backToGenres) {
            backToGenres.addEventListener('click', () => {
                showSection('genres');
                setActiveNav(document.querySelector('[data-section="genres"]'));
            });
        }

        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => {
                showSection('home');
                setActiveNav(document.querySelector('[data-section="home"]'));
                searchInput.value = '';
            });
        }

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentGenrePage > 1) {
                    currentGenrePage--;
                    loadGenreFilms(currentGenre);
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                currentGenrePage++;
                loadGenreFilms(currentGenre);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }
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

    function showQuestion(num) {
        document.querySelectorAll('.question').forEach(q => {
            q.classList.remove('active');
        });
        const question = document.getElementById(`question${num}`);
        if (question) question.classList.add('active');
        updateNavigationButtons();
    }

    function nextQuestion() {
        const current = document.getElementById(`question${currentQuestion}`);
        const selected = current.querySelector('input:checked');
        if (!selected) {
            showError('Выберите вариант ответа!');
            return;
        }
        currentQuestion++;
        showQuestion(currentQuestion);
        updateTestProgress();
    }

    function prevQuestion() {
        currentQuestion--;
        showQuestion(currentQuestion);
        updateTestProgress();
    }

    function updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        prevBtn.disabled = currentQuestion === 1;
        if (currentQuestion === totalQuestions) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    function updateTestProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const progress = (currentQuestion / totalQuestions) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Вопрос ${currentQuestion} из ${totalQuestions}`;
    }

    function resetTest() {
        currentQuestion = 1;
        const testForm = document.getElementById('test-form');
        testForm.reset();

        document.querySelectorAll('.question').forEach(q => {
            q.classList.remove('active');
        });
        showQuestion(1);
        updateTestProgress();
        updateNavigationButtons();

        const testResult = document.getElementById('test-result');
        testResult.style.display = 'none';
        testForm.style.display = 'block';
    }

    function handleTestSubmit(e) {
        e.preventDefault();
        const formData = new FormData(document.getElementById('test-form'));
        const answers = {
            mood: formData.get('mood'),
            duration: formData.get('duration'),
            period: formData.get('period'),
            tension: formData.get('tension')
        };

        if (!answers.mood || !answers.duration || !answers.period || !answers.tension) {
            showError('Ответьте на все вопросы!');
            return;
        }

        const recommendation = findMovieRecommendation(answers);
        showTestResult(recommendation);
    }

    function findMovieRecommendation(answers) {
        const suitableMovies = movieDatabase.filter(
            (movie) =>
                movie.mood === answers.mood &&
                movie.duration === answers.duration &&
                movie.period === answers.period &&
                movie.tension === answers.tension
        );

        if (suitableMovies.length > 0) {
            return suitableMovies[Math.floor(Math.random() * suitableMovies.length)];
        }

        const partialMatches = movieDatabase.filter(
            (movie) =>
                (movie.mood === answers.mood && movie.duration === answers.duration) ||
                (movie.period === answers.period && movie.tension === answers.tension)
        );

        if (partialMatches.length > 0) {
            return partialMatches[Math.floor(Math.random() * partialMatches.length)];
        }

        return movieDatabase[Math.floor(Math.random() * movieDatabase.length)];
    }

    function showTestResult(recommendation) {
        const testForm = document.getElementById('test-form');
        const resultElement = document.getElementById('test-result');
        const recommendedMovieElement = document.getElementById('recommended-movie');

        testForm.style.display = 'none';
        recommendedMovieElement.innerHTML = `
            <h4>${recommendation.title}</h4>
            <p>${recommendation.genre}</p>
            <p>⭐ ${recommendation.rating}/10</p>
            <p style="margin-top: 15px; font-style: italic;">${recommendation.description}</p>
            <button class="add-to-favorites-btn" data-movie='${JSON.stringify(recommendation)}'>В избранное</button>
        `;

        const addBtn = recommendedMovieElement.querySelector('.add-to-favorites-btn');
        addBtn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const movieData = JSON.parse(button.getAttribute('data-movie'));
            addMovieToFavorites(movieData, button);
        });

        if (userFavorites.some(fav => fav.id === recommendation.id)) {
            addBtn.textContent = 'В избранном';
            addBtn.classList.add('in-favorites');
            addBtn.disabled = true;
        }

        resultElement.style.display = 'block';
    }

    window.restartTest = function () {
        resetTest();
    };

    function setupGenreCards() {
        const genreCards = document.querySelectorAll('.genre-main-card');
        genreCards.forEach((card) => {
            card.addEventListener('click', async () => {
                const genre = card.getAttribute('data-genre');
                currentGenre = genre;
                currentGenrePage = 1;
                if (genreMap[genre]) {
                    await loadGenreFilms(genre);
                } else {
                    showError('Жанр не найден');
                }
            });
        });
    }

    function addMovieToFavorites(movie, button) {
        const movieId = Number(movie.id || movie.kinopoiskId || movie.filmId);
        if (!movieId) return;

        const exists = userFavorites.some(fav => Number(fav.id) === movieId);
        if (!exists) {
            userFavorites.push({
                id: movieId,
                title: movie.title || movie.nameRu || movie.nameEn,
                genre: movie.genre || (movie.genres ? movie.genres.map(g => g.genre).join(' / ') : 'Не указан'),
                rating: movie.rating || movie.ratingKinopoisk || 'N/A',
                poster: movie.poster || movie.posterUrl || movie.posterUrlPreview,
                addedAt: new Date().toLocaleDateString('ru-RU')
            });
            localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
            showSuccessMessage(`Фильм "${movie.title || movie.nameRu}" добавлен!`);
            loadFavorites();

            if (button) {
                button.textContent = 'В избранном';
                button.classList.add('in-favorites');
                button.disabled = true;
            }
        } else {
            showInfo('Уже в избранном');
        }
    }

    function loadFavorites() {
        const grid = document.getElementById('favorites-grid');
        if (!grid) return;

        grid.innerHTML = '';

        if (userFavorites.length === 0) {
            grid.innerHTML = `
                <div class="empty-favorites">
                    В избранном пока пусто<br>
                    <small>Добавляйте фильмы из рекомендаций или теста</small>
                </div>
            `;
            return;
        }

        userFavorites.forEach((movie) => {
            const item = document.createElement('div');
            item.className = 'favorite-item';
            item.innerHTML = `
                <h4>${movie.title}</h4>
                <span class="movie-genre">${movie.genre}</span>
                <div>⭐ ${movie.rating}/10</div>
                <small>Добавлено: ${movie.addedAt}</small>
                <button class="remove-favorite" data-id="${movie.id}">Удалить</button>
            `;
            grid.appendChild(item);
        });

        document.querySelectorAll('.remove-favorite').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.getAttribute('data-id'));
                removeFromFavorites(movieId);
            });
        });
    }

    function removeFromFavorites(movieId) {
        const id = Number(movieId);
        const index = userFavorites.findIndex(movie => Number(movie.id) === id);
        if (index !== -1) {
            const removedMovie = userFavorites[index];
            userFavorites.splice(index, 1);
            localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
            showSuccessMessage(`Фильм "${removedMovie.title}" удалён из избранного`);
            loadFavorites();
        }
    }

    function showSection(sectionName) {
        Object.keys(sections).forEach((key) => {
            if (sections[key]) sections[key].style.display = 'none';
        });
        if (sections[sectionName]) {
            sections[sectionName].style.display = 'block';
            if (sectionName === 'home') {
                animateHomeSection();
                loadPopularFilms();
            } else if (sectionName === 'favorites') {
                loadFavorites();
            } else if (sectionName === 'test') {
                resetTest();
            }
        }
    }

    function setActiveNav(activeLink) {
        navLinks.forEach((link) => link.classList.remove('active'));
        if (activeLink) activeLink.classList.add('active');
    }

    function animateHomeSection() {
        const cards = document.querySelectorAll('.movie-card');
        cards.forEach((card, index) => {
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = `slideUp 0.6s ease ${index * 0.1}s forwards`;
            }, 10);
        });
    }

    function showSuccessMessage(message) {
        showNotification(message, 'success');
    }

    function showError(message) {
        showNotification(message, 'error');
    }

    function showInfo(message) {
        showNotification(message, 'info');
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async function fetchKinopoisk(endpoint, version = 'v2.2') {
        try {
            const response = await axios.get(`https://kinopoiskapiunofficial.tech/api/${version}/${endpoint}`, {
                headers: {
                    'X-API-KEY': API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(error);
            showError('Ошибка загрузки данных из Кинопоиска');
            return null;
        }
    }

    async function loadPopularFilms() {
        const grid = document.getElementById('recommendations-grid');
        grid.innerHTML = '<div style="text-align:center; grid-column: 1/-1;">Загрузка...</div>';

        const data = await fetchKinopoisk('films/top?type=TOP_100_POPULAR_FILMS&page=1');
        if (!data || !data.films) {
            grid.innerHTML = '<div style="text-align:center; grid-column: 1/-1;">Ошибка загрузки</div>';
            return;
        }

        grid.innerHTML = '';
        data.films.slice(0, 4).forEach((film) => {
            const card = createMovieCard(film);
            grid.appendChild(card);
        });
        initLazyLoading();
        animateHomeSection();
    }

    async function loadGenreFilms(genre) {
        const genreId = genreMap[genre].id;
        const genreName = genreMap[genre].name;
        const title = document.getElementById('genre-title');
        title.textContent = `Фильмы в жанре: ${genreName}`;

        const grid = document.getElementById('genre-films-grid');
        grid.innerHTML = '<div style="text-align:center; grid-column: 1/-1;">Загрузка...</div>';

        const data = await fetchKinopoisk(`films?genres=${genreId}&order=RATING&type=FILM&page=${currentGenrePage}`);
        if (!data || !data.items) {
            grid.innerHTML = '<div style="text-align:center; grid-column: 1/-1;">Ошибка загрузки</div>';
            return;
        }

        grid.innerHTML = '';
        data.items.slice(0, filmsPerPage).forEach((film) => {
            const card = createMovieCard(film, true);
            grid.appendChild(card);
        });

        initLazyLoading();

        prevPageBtn.disabled = currentGenrePage === 1;
        nextPageBtn.disabled = data.items.length < filmsPerPage;

        showSection('genre');
        setActiveNav(null);
    }

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            showError('Введите название фильма!');
            return;
        }

        const grid = document.getElementById('search-results-grid');
        const title = document.getElementById('search-title');
        title.textContent = `Результаты поиска: "${query}"`;
        grid.innerHTML = '<div style="text-align:center; grid-column: 1/-1;">Поиск...</div>';

        try {
            const data = await fetchKinopoisk(`films/search-by-keyword?keyword=${encodeURIComponent(query)}&page=1`);
            grid.innerHTML = '';

            if (!data?.films?.length) {
                grid.innerHTML = '<div style="text-align:center; grid-column: 1/-1;">Ничего не найдено</div>';
                showSection('search');
                return;
            }

            data.films.slice(0, 20).forEach((film) => {
                const card = createMovieCard(film, true);
                grid.appendChild(card);
            });

            initLazyLoading();
            showSection('search');
        } catch (error) {
            console.error(error);
            grid.innerHTML = '<div style="text-align:center; grid-column: 1/-1;">Ошибка поиска</div>';
        }
    }

    function createMovieCard(film, useKinopoiskId = false) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.dataset.filmId = useKinopoiskId ? film.kinopoiskId : film.filmId;

        const posterUrl = film.posterUrlPreview || film.posterUrl;

        card.innerHTML = `
            ${posterUrl
                ? `<img data-src="${posterUrl}" alt="${film.nameRu || film.nameEn}" class="movie-poster lazy">`
                : `<div class="movie-poster" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">Poster</div>`
            }
            <div class="movie-info">
                <h3>${film.nameRu || film.nameEn}</h3>
                <p>${film.genres ? film.genres.map((g) => g.genre).join(' / ') : 'Жанр не указан'}</p>
                <div class="movie-rating">⭐ ${film.ratingKinopoisk || film.rating || 'N/A'}</div>
                <button class="add-to-favorites-kp" data-movie='${JSON.stringify({
                    id: useKinopoiskId ? film.kinopoiskId : film.filmId,
                    title: film.nameRu || film.nameEn,
                    genre: film.genres ? film.genres.map((g) => g.genre).join(' / ') : 'Не указан',
                    rating: film.ratingKinopoisk || film.rating || 'N/A',
                    poster: posterUrl
                })}'>В избранное</button>
            </div>
        `;

        const addBtn = card.querySelector('.add-to-favorites-kp');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const button = e.currentTarget;
            const movieData = JSON.parse(button.getAttribute('data-movie'));
            addMovieToFavorites(movieData, button);
        });

        const movieId = useKinopoiskId ? film.kinopoiskId : film.filmId;
        if (userFavorites.some(fav => fav.id === movieId)) {
            addBtn.textContent = 'В избранном';
            addBtn.classList.add('in-favorites');
            addBtn.disabled = true;
        }

        card.addEventListener('click', () => {
            showMovieDetails(card.dataset.filmId);
        });

        return card;
    }

    async function showMovieDetails(filmId) {
        const details = document.getElementById('movie-details');
        details.innerHTML = '<div style="text-align:center;">Загрузка...</div>';

        const [filmData, staffData] = await Promise.all([
            fetchKinopoisk(`films/${filmId}`),
            fetchKinopoisk(`staff?filmId=${filmId}`, 'v1')
        ]);

        if (!filmData || !staffData) {
            details.innerHTML = '<div style="text-align:center;">Ошибка загрузки</div>';
            return;
        }

        const actors = staffData.filter((s) => s.professionKey === 'ACTOR').slice(0, 10);

        details.innerHTML = `
            <div class="poster">
                <img data-src="${filmData.posterUrl}" alt="${filmData.nameRu || filmData.nameEn}" class="lazy">
            </div>
            <div class="info">
                <h2>${filmData.nameRu || filmData.nameEn}</h2>
                <p>${filmData.description || 'Описание отсутствует'}</p>
                <h3>Актёры:</h3>
                <ul>${actors.length ? actors.map((a) => `<li>${a.nameRu || a.nameEn}</li>`).join('') : '<li>Нет данных</li>'}</ul>
                <button class="add-to-favorites-modal" data-movie='${JSON.stringify({
                    id: filmId,
                    title: filmData.nameRu || filmData.nameEn,
                    genre: filmData.genres ? filmData.genres.map((g) => g.genre).join(' / ') : 'Не указан',
                    rating: filmData.ratingKinopoisk || filmData.rating || 'N/A',
                    poster: filmData.posterUrl
                })}'>В избранное</button>
            </div>
        `;

        const addBtn = details.querySelector('.add-to-favorites-modal');
        addBtn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const movieData = JSON.parse(button.getAttribute('data-movie'));
            addMovieToFavorites(movieData, button);
            movieModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        if (userFavorites.some(fav => fav.id === filmId)) {
            addBtn.textContent = 'В избранном';
            addBtn.classList.add('in-favorites');
            addBtn.disabled = true;
        }

        initLazyLoading();
        movieModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function createMovieCardFromDatabase(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <div class="movie-poster" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 250px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">
                Poster
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.genre}</p>
                <div class="movie-rating">⭐ ${movie.rating}/10</div>
                <button class="add-to-favorites-search" data-movie='${JSON.stringify(movie)}'>В избранное</button>
            </div>
        `;

        const addBtn = card.querySelector('.add-to-favorites-search');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const button = e.currentTarget;
            const movieData = JSON.parse(button.getAttribute('data-movie'));
            addMovieToFavorites(movieData, button);
        });

        if (userFavorites.some(fav => fav.id === movie.id)) {
            addBtn.textContent = 'В избранном';
            addBtn.classList.add('in-favorites');
            addBtn.disabled = true;
        }

        card.addEventListener('click', () => {
            showMovieDetailsFromDatabase(movie);
        });

        return card;
    }

    function showMovieDetailsFromDatabase(movie) {
        const details = document.getElementById('movie-details');
        details.innerHTML = `
            <div class="poster">
                <div style="width: 300px; height: 450px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 80px; border-radius: 10px;">
                    Poster
                </div>
            </div>
            <div class="info">
                <h2>${movie.title}</h2>
                <p><strong>Жанр:</strong> ${movie.genre}</p>
                <p><strong>Рейтинг:</strong> ⭐ ${movie.rating}/10</p>
                <p>${movie.description}</p>
                <button class="add-to-favorites-modal" data-movie='${JSON.stringify(movie)}'>В избранное</button>
            </div>
        `;

        const addBtn = details.querySelector('.add-to-favorites-modal');
        addBtn.addEventListener('click', () => {
            addMovieToFavorites(movie, addBtn);
            movieModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        if (userFavorites.some(fav => fav.id === movie.id)) {
            addBtn.textContent = 'В избранном';
            addBtn.classList.add('in-favorites');
            addBtn.disabled = true;
        }

        movieModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
});
