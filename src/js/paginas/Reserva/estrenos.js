// Funcionalidad para la página de estrenos

let premiereMovies = [];
let comingSoonMovies = [];
let currentSlide = 0;
let currentView = 'grid';
let filteredMovies = [];
let carouselInterval = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    loadPremiereMovies();
    loadComingSoonMovies();
    initializeCarousel();
    initializeNewsletterForm();
    setupInfiniteScroll();
});

// Cargar películas en estreno
async function loadPremiereMovies() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/movies/premieres');
        if (response.ok) {
            premiereMovies = await response.json();
        } else {
            // Datos de ejemplo si no hay endpoint
            premiereMovies = [
                {
                    id: 1,
                    title: "The Batman",
                    genre: "Acción",
                    duration: "176 min",
                    rating: "PG-13",
                    premiere_date: "2024-03-15",
                    description: "Batman se ve obligado a investigar la corrupción de Gotham City y enfrentarse a un asesino serial conocido como el Acertijo.",
                    image: "../../assets/images/batman.jpg",
                    poster: "../../assets/images/batman-poster.jpg",
                    trailer_url: "https://youtu.be/trailer",
                    director: "Matt Reeves",
                    cast: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano"],
                    popularity: 95,
                    is_premiere: true,
                    showtimes: ["14:00", "17:30", "21:00"]
                },
                {
                    id: 2,
                    title: "Spider-Man: No Way Home",
                    genre: "Acción",
                    duration: "148 min",
                    rating: "PG-13",
                    premiere_date: "2024-03-10",
                    description: "Peter Parker busca la ayuda del Doctor Strange para hacer que el mundo olvide que él es Spider-Man.",
                    image: "../../assets/images/spiderman.jpg",
                    poster: "../../assets/images/spiderman-poster.jpg",
                    trailer_url: "https://youtu.be/trailer",
                    director: "Jon Watts",
                    cast: ["Tom Holland", "Zendaya", "Benedict Cumberbatch"],
                    popularity: 98,
                    is_premiere: true,
                    showtimes: ["13:30", "16:45", "20:15"]
                },
                {
                    id: 3,
                    title: "Dune: Part Two",
                    genre: "Ciencia Ficción",
                    duration: "166 min",
                    rating: "PG-13",
                    premiere_date: "2024-03-08",
                    description: "Paul Atreides se une a Chani y los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.",
                    image: "../../assets/images/dune2.jpg",
                    poster: "../../assets/images/dune2-poster.jpg",
                    trailer_url: "https://youtu.be/trailer",
                    director: "Denis Villeneuve",
                    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
                    popularity: 92,
                    is_premiere: true,
                    showtimes: ["15:00", "18:30", "22:00"]
                },
                {
                    id: 4,
                    title: "Oppenheimer",
                    genre: "Drama",
                    duration: "180 min",
                    rating: "R",
                    premiere_date: "2024-03-20",
                    description: "La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.",
                    image: "../../assets/images/oppenheimer.jpg",
                    poster: "../../assets/images/oppenheimer-poster.jpg",
                    trailer_url: "https://youtu.be/trailer",
                    director: "Christopher Nolan",
                    cast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
                    popularity: 90,
                    is_premiere: true,
                    showtimes: ["14:30", "18:00", "21:30"]
                },
                {
                    id: 5,
                    title: "Barbie",
                    genre: "Comedia",
                    duration: "114 min",
                    rating: "PG-13",
                    premiere_date: "2024-03-18",
                    description: "Barbie vive en Barbieland donde todo es posible. Un día, algo inesperado la lleva al mundo real.",
                    image: "../../assets/images/barbie.jpg",
                    poster: "../../assets/images/barbie-poster.jpg",
                    trailer_url: "https://youtu.be/trailer",
                    director: "Greta Gerwig",
                    cast: ["Margot Robbie", "Ryan Gosling", "Will Ferrell"],
                    popularity: 88,
                    is_premiere: true,
                    showtimes: ["12:00", "15:30", "19:00"]
                }
            ];
        }
        
        filteredMovies = [...premiereMovies];
        displayMovies();
        setupCarouselSlides();
        
    } catch (error) {
        console.error('Error al cargar películas en estreno:', error);
        displayError('Error al cargar las películas');
    } finally {
        showLoading(false);
    }
}

// Cargar próximos estrenos
async function loadComingSoonMovies() {
    try {
        const response = await fetch('/api/movies/coming-soon');
        if (response.ok) {
            comingSoonMovies = await response.json();
        } else {
            // Datos de ejemplo
            comingSoonMovies = [
                {
                    id: 101,
                    title: "Avatar 3",
                    genre: "Ciencia Ficción",
                    release_date: "2024-12-20",
                    description: "La tercera entrega de la saga de Pandora.",
                    image: "../../assets/images/Avatar3.jpg"
                },
                {
                    id: 102,
                    title: "Los Vengadores: Kang Dynasty",
                    genre: "Acción",
                    release_date: "2025-05-01",
                    description: "Los héroes más poderosos enfrentan a Kang el Conquistador.",
                    image: "../../assets/images/avengers-kang.jpg"
                },
                {
                    id: 103,
                    title: "Frozen 3",
                    genre: "Animación",
                    release_date: "2024-11-15",
                    description: "Nueva aventura de Elsa y Anna en Arendelle.",
                    image: "../../assets/images/frozen3.jpg"
                }
            ];
        }
        
        displayComingSoon();
        
    } catch (error) {
        console.error('Error al cargar próximos estrenos:', error);
    }
}

// Configurar slides del carrusel
function setupCarouselSlides() {
    const carousel = document.getElementById('premieresCarousel');
    const indicators = document.getElementById('carouselIndicators');
    
    if (!carousel || !indicators) return;
    
    carousel.innerHTML = '';
    indicators.innerHTML = '';
    
    // Tomar las primeras 5 películas para el carrusel
    const featuredMovies = premiereMovies.slice(0, 5);
    
    featuredMovies.forEach((movie, index) => {
        // Crear slide
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.style.backgroundImage = `url(${movie.image})`;
        
        slide.innerHTML = `
            <div class="slide-content">
                <div class="genre">${movie.genre}</div>
                <h1>${movie.title}</h1>
                <div class="premiere-date">Estreno: ${formatDate(movie.premiere_date)}</div>
                <div class="description">${movie.description}</div>
                <div class="slide-actions">
                    <button class="btn btn-primary" onclick="bookTickets(${movie.id})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Reservar Entradas
                    </button>
                    <button class="btn btn-secondary" onclick="watchTrailer('${movie.trailer_url}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                        </svg>
                        Ver Tráiler
                    </button>
                </div>
            </div>
        `;
        
        carousel.appendChild(slide);
        
        // Crear indicador
        const indicator = document.createElement('div');
        indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
        indicator.onclick = () => goToSlide(index);
        indicators.appendChild(indicator);
    });
}

// Inicializar carrusel
function initializeCarousel() {
    startCarouselAutoplay();
    
    // Pausar autoplay al hacer hover
    const carousel = document.querySelector('.hero-premieres');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopCarouselAutoplay);
        carousel.addEventListener('mouseleave', startCarouselAutoplay);
    }
}

// Autoplay del carrusel
function startCarouselAutoplay() {
    stopCarouselAutoplay();
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarouselAutoplay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

// Navegación del carrusel
function nextSlide() {
    const totalSlides = document.querySelectorAll('.carousel-slide').length;
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function previousSlide() {
    const totalSlides = document.querySelectorAll('.carousel-slide').length;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    stopCarouselAutoplay();
    setTimeout(startCarouselAutoplay, 3000);
}

function updateCarousel() {
    const carousel = document.getElementById('premieresCarousel');
    const indicators = document.querySelectorAll('.indicator');
    
    if (carousel) {
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

// Mostrar películas
function displayMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    const moviesList = document.getElementById('moviesList');
    
    if (currentView === 'grid') {
        moviesGrid.style.display = 'grid';
        moviesList.style.display = 'none';
        displayMoviesGrid();
    } else {
        moviesGrid.style.display = 'none';
        moviesList.style.display = 'block';
        displayMoviesList();
    }
}

// Mostrar películas en grid
function displayMoviesGrid() {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';
    
    if (filteredMovies.length === 0) {
        showNoResults(true);
        return;
    }
    
    showNoResults(false);
    
    filteredMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.onclick = () => showMovieDetails(movie.id);
        
        movieCard.innerHTML = `
            <div class="movie-poster">
                <img src="${movie.poster || movie.image}" alt="${movie.title}" 
                     onerror="this.src='../../assets/images/placeholder-movie.jpg'">
                <div class="premiere-badge">Estreno</div>
                <div class="rating-badge">${movie.rating}</div>
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-genre">${movie.genre}</div>
                <div class="movie-duration">${movie.duration}</div>
                <div class="movie-premiere-date">
                    Estreno: ${formatDate(movie.premiere_date)}
                </div>
                <div class="movie-description">${movie.description}</div>
                <div class="movie-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); bookTickets(${movie.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        Reservar
                    </button>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); watchTrailer('${movie.trailer_url}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                        </svg>
                        Tráiler
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(movieCard);
    });
}

// Mostrar películas en lista
function displayMoviesList() {
    const list = document.getElementById('moviesList');
    list.innerHTML = '';
    
    if (filteredMovies.length === 0) {
        showNoResults(true);
        return;
    }
    
    showNoResults(false);
    
    filteredMovies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'movie-list-item';
        movieItem.onclick = () => showMovieDetails(movie.id);
        
        movieItem.innerHTML = `
            <div class="movie-list-poster">
                <img src="${movie.poster || movie.image}" alt="${movie.title}"
                     onerror="this.src='../../assets/images/placeholder-movie.jpg'">
            </div>
            <div class="movie-list-info">
                <h3>${movie.title}</h3>
                <div class="movie-genre">${movie.genre} • ${movie.duration} • ${movie.rating}</div>
                <div class="movie-premiere-date">Estreno: ${formatDate(movie.premiere_date)}</div>
                <div class="movie-description">${movie.description}</div>
                <div><strong>Director:</strong> ${movie.director}</div>
                <div><strong>Reparto:</strong> ${movie.cast.join(', ')}</div>
            </div>
            <div class="movie-list-actions">
                <button class="btn btn-primary" onclick="event.stopPropagation(); bookTickets(${movie.id})">
                    Reservar Entradas
                </button>
                <button class="btn btn-secondary" onclick="event.stopPropagation(); watchTrailer('${movie.trailer_url}')">
                    Ver Tráiler
                </button>
            </div>
        `;
        
        list.appendChild(movieItem);
    });
}

// Mostrar próximos estrenos
function displayComingSoon() {
    const grid = document.getElementById('comingSoonGrid');
    grid.innerHTML = '';
    
    comingSoonMovies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'coming-soon-card';
        
        card.innerHTML = `
            <div class="coming-soon-poster">
                <img src="${movie.image}" alt="${movie.title}"
                     onerror="this.src='../../assets/images/placeholder-movie.jpg'">
            </div>
            <div class="coming-soon-info">
                <h4>${movie.title}</h4>
                <div class="coming-soon-date">${formatDate(movie.release_date)}</div>
                <p>${movie.description}</p>
                <button class="notify-btn" onclick="notifyMe(${movie.id})">
                    Notificarme
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Cambiar vista (grid/lista)
function toggleView(view) {
    currentView = view;
    
    // Actualizar botones
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Mostrar vista correspondiente
    displayMovies();
}

// Buscar películas
function searchMovies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredMovies = premiereMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.genre.toLowerCase().includes(searchTerm) ||
        movie.director.toLowerCase().includes(searchTerm) ||
        movie.cast.some(actor => actor.toLowerCase().includes(searchTerm))
    );
    
    displayMovies();
}

// Filtrar películas
function filterMovies() {
    const genreFilter = document.getElementById('genreFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredMovies = premiereMovies.filter(movie => {
        // Filtro de búsqueda
        const matchesSearch = !searchTerm || 
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.genre.toLowerCase().includes(searchTerm) ||
            movie.director.toLowerCase().includes(searchTerm) ||
            movie.cast.some(actor => actor.toLowerCase().includes(searchTerm));
        
        // Filtro de género
        const matchesGenre = !genreFilter || 
            movie.genre.toLowerCase().replace(' ', '_') === genreFilter;
        
        // Filtro de fecha
        const matchesDate = !dateFilter || filterByDate(movie.premiere_date, dateFilter);
        
        return matchesSearch && matchesGenre && matchesDate;
    });
    
    displayMovies();
}

// Ordenar películas
function sortMovies() {
    const sortBy = document.getElementById('sortFilter').value;
    
    switch (sortBy) {
        case 'estreno_desc':
            filteredMovies.sort((a, b) => new Date(b.premiere_date) - new Date(a.premiere_date));
            break;
        case 'estreno_asc':
            filteredMovies.sort((a, b) => new Date(a.premiere_date) - new Date(b.premiere_date));
            break;
        case 'titulo_asc':
            filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'titulo_desc':
            filteredMovies.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'popularidad':
            filteredMovies.sort((a, b) => b.popularity - a.popularity);
            break;
    }
    
    displayMovies();
}

// Filtrar por fecha
function filterByDate(movieDate, filter) {
    const today = new Date();
    const movieDateObj = new Date(movieDate);
    
    switch (filter) {
        case 'esta_semana':
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
            return movieDateObj >= today && movieDateObj <= endOfWeek;
        case 'proxima_semana':
            const startOfNextWeek = new Date(today);
            startOfNextWeek.setDate(today.getDate() + (7 - today.getDay()) + 1);
            const endOfNextWeek = new Date(startOfNextWeek);
            endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
            return movieDateObj >= startOfNextWeek && movieDateObj <= endOfNextWeek;
        case 'este_mes':
            return movieDateObj.getMonth() === today.getMonth() && 
                   movieDateObj.getFullYear() === today.getFullYear();
        default:
            return true;
    }
}

// Mostrar detalles de película
function showMovieDetails(movieId) {
    const movie = premiereMovies.find(m => m.id === movieId);
    if (!movie) return;
    
    const modal = document.getElementById('movieModal');
    const content = document.getElementById('movieModalContent');
    
    content.innerHTML = `
        <div class="movie-detail-hero" style="background-image: url(${movie.image})">
            <div class="movie-detail-overlay">
                <div class="movie-detail-content">
                    <div class="movie-detail-poster">
                        <img src="${movie.poster || movie.image}" alt="${movie.title}">
                    </div>
                    <div class="movie-detail-info">
                        <h1>${movie.title}</h1>
                        <div class="movie-meta">
                            <span class="genre">${movie.genre}</span>
                            <span class="duration">${movie.duration}</span>
                            <span class="rating">${movie.rating}</span>
                        </div>
                        <div class="premiere-info">
                            <strong>Estreno:</strong> ${formatDate(movie.premiere_date)}
                        </div>
                        <div class="director-info">
                            <strong>Director:</strong> ${movie.director}
                        </div>
                        <div class="cast-info">
                            <strong>Reparto:</strong> ${movie.cast.join(', ')}
                        </div>
                        <p class="description">${movie.description}</p>
                        <div class="showtimes">
                            <strong>Horarios:</strong>
                            <div class="showtimes-list">
                                ${movie.showtimes.map(time => `
                                    <button class="showtime-btn" onclick="bookSpecificShowtime(${movie.id}, '${time}')">
                                        ${time}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="detail-actions">
                            <button class="btn btn-primary" onclick="bookTickets(${movie.id})">
                                Reservar Entradas
                            </button>
                            <button class="btn btn-secondary" onclick="watchTrailer('${movie.trailer_url}')">
                                Ver Tráiler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de película
function closeMovieModal() {
    document.getElementById('movieModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Reservar entradas
function bookTickets(movieId) {
    const movie = premiereMovies.find(m => m.id === movieId);
    if (movie) {
        sessionStorage.setItem('selectedMovie', JSON.stringify(movie));
        window.location.href = 'horarios.html?movie=' + movieId;
    }
}

// Reservar horario específico
function bookSpecificShowtime(movieId, showtime) {
    const movie = premiereMovies.find(m => m.id === movieId);
    if (movie) {
        sessionStorage.setItem('selectedMovie', JSON.stringify(movie));
        sessionStorage.setItem('selectedShowtime', showtime);
        window.location.href = 'butacas.html?movie=' + movieId + '&showtime=' + encodeURIComponent(showtime);
    }
}

// Ver tráiler
function watchTrailer(trailerUrl) {
    if (trailerUrl && trailerUrl !== 'https://youtu.be/trailer') {
        window.open(trailerUrl, '_blank');
    } else {
        alert('Tráiler no disponible en este momento');
    }
}

// Notificar sobre próximo estreno
async function notifyMe(movieId) {
    try {
        const response = await fetch('/api/notify-premiere', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ movieId })
        });
        
        if (response.ok) {
            alert('Te notificaremos cuando esté disponible');
        } else {
            alert('Error al configurar notificación');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Te notificaremos cuando esté disponible');
    }
}

// Inicializar formulario de newsletter
function initializeNewsletterForm() {
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', handleNewsletterSubmit);
    }
}

// Manejar envío de newsletter
async function handleNewsletterSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('newsletterEmail').value;
    
    try {
        const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, interests: ['premieres'] })
        });
        
        if (response.ok) {
            alert('¡Suscripción exitosa! Te notificaremos sobre los últimos estrenos.');
            document.getElementById('newsletterEmail').value = '';
        } else {
            alert('Error al suscribirse. Inténtalo de nuevo.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('¡Gracias por suscribirte! Te notificaremos sobre los últimos estrenos.');
        document.getElementById('newsletterEmail').value = '';
    }
}

// Configurar scroll infinito
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            // Cargar más películas si es necesario
            loadMoreMovies();
        }
    });
}

// Cargar más películas (simulado)
function loadMoreMovies() {
    // Implementar carga paginada si es necesario
    console.log('Cargando más películas...');
}

// Utilidades
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showNoResults(show) {
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = show ? 'block' : 'none';
    }
}

function displayError(message) {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
            <h3>Error al cargar contenido</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Recargar</button>
        </div>
    `;
}

// Event listeners
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMovieModal();
    }
});

window.onclick = function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) {
        closeMovieModal();
    }
}

// Agregar estilos CSS dinámicos
const style = document.createElement('style');
style.textContent = `
    .movie-detail-hero {
        height: 400px;
        background-size: cover;
        background-position: center;
        position: relative;
        border-radius: 15px 15px 0 0;
        overflow: hidden;
    }
    
    .movie-detail-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%);
        display: flex;
        align-items: end;
        padding: 2rem;
    }
    
    .movie-detail-content {
        display: flex;
        gap: 2rem;
        width: 100%;
        color: white;
    }
    
    .movie-detail-poster img {
        width: 200px;
        height: 300px;
        object-fit: cover;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    
    .movie-detail-info h1 {
        margin: 0 0 1rem 0;
        font-size: 2.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    }
    
    .movie-meta {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }
    
    .movie-meta span {
        background: rgba(255,255,255,0.2);
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.9rem;
        backdrop-filter: blur(10px);
    }
    
    .movie-detail-info > div {
        margin-bottom: 0.8rem;
    }
    
    .description {
        line-height: 1.6;
        margin: 1rem 0 !important;
    }
    
    .showtimes-list {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
    }
    
    .showtime-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .showtime-btn:hover {
        background: var(--primary-hover);
        transform: scale(1.05);
    }
    
    .detail-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    
    @media (max-width: 768px) {
        .movie-detail-content {
            flex-direction: column;
            text-align: center;
        }
        
        .movie-detail-poster img {
            width: 150px;
            height: 225px;
            margin: 0 auto;
        }
        
        .movie-detail-info h1 {
            font-size: 2rem;
        }
        
        .detail-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);
