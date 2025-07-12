// Funcionalidad para la página de Sala 4D

let movies4D = [];
let currentUser = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    load4DMovies();
    loadUserProfile();
    initializeEffectShowcase();
    addScrollAnimations();
});

// Cargar películas disponibles en 4D
async function load4DMovies() {
    try {
        const response = await fetch('/api/movies/4d');
        if (response.ok) {
            movies4D = await response.json();
            displayMovies(movies4D);
        } else {
            // Datos de ejemplo si no hay endpoint
            movies4D = [
                {
                    id: 1,
                    title: "Avengers: Endgame",
                    genre: "Acción",
                    image: "../../assets/images/avengers-kang.jpg",
                    showtimes: ["14:00", "17:30", "21:00"],
                    price: 32.99,
                    category: "action",
                    description: "La batalla final contra Thanos en experiencia 4D completa"
                },
                {
                    id: 2,
                    title: "Spider-Man: No Way Home",
                    genre: "Acción",
                    image: "../../assets/images/spiderman.jpg",
                    showtimes: ["13:30", "16:45", "20:15"],
                    price: 32.99,
                    category: "action",
                    description: "Balancéate con Spider-Man a través del multiverso"
                },
                {
                    id: 3,
                    title: "Frozen 2",
                    genre: "Animación",
                    image: "../../assets/images/frozen2.jpg",
                    showtimes: ["12:00", "15:30", "18:00"],
                    price: 28.99,
                    category: "animation",
                    description: "Siente el frío de Arendelle con efectos de hielo y nieve"
                },
                {
                    id: 4,
                    title: "Jurassic World",
                    genre: "Aventura",
                    image: "../../assets/images/jurassic.jpg",
                    showtimes: ["14:30", "18:00", "21:30"],
                    price: 34.99,
                    category: "adventure",
                    description: "Vive la aventura prehistórica con dinosaurios que sentirás cerca"
                },
                {
                    id: 5,
                    title: "Fast & Furious 9",
                    genre: "Acción",
                    image: "../../assets/images/fast9.jpg",
                    showtimes: ["15:00", "19:30", "22:00"],
                    price: 32.99,
                    category: "action",
                    description: "Acelera con la familia en las persecuciones más intensas"
                },
                {
                    id: 6,
                    title: "Finding Dory",
                    genre: "Animación",
                    image: "../../assets/images/finding-dory.jpg",
                    showtimes: ["11:30", "14:00", "16:30"],
                    price: 26.99,
                    category: "animation",
                    description: "Sumérgete en el océano con efectos de agua y burbujas"
                }
            ];
            displayMovies(movies4D);
        }
    } catch (error) {
        console.error('Error al cargar películas 4D:', error);
        displayMovies([]); // Mostrar grid vacío
    }
}

// Cargar perfil del usuario para descuentos
async function loadUserProfile() {
    try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
            currentUser = await response.json();
            displayUserDiscounts();
        }
    } catch (error) {
        console.error('Error al cargar perfil del usuario:', error);
    }
}

// Mostrar descuentos del usuario
function displayUserDiscounts() {
    if (!currentUser || !currentUser.user_rank || currentUser.user_rank === 'Bronze') {
        return;
    }
    
    const discountsSection = document.getElementById('rankDiscounts');
    const rankBadge = document.getElementById('userRankBadge');
    const discountAmount = document.getElementById('userDiscountAmount');
    
    if (discountsSection && rankBadge && discountAmount) {
        rankBadge.textContent = currentUser.user_rank;
        rankBadge.className = `rank-badge ${currentUser.user_rank.toLowerCase()}`;
        
        const discount = currentUser.discount_percentage || 0;
        discountAmount.textContent = `${discount}% de descuento`;
        
        discountsSection.style.display = 'block';
    }
}

// Mostrar películas en el grid
function displayMovies(movies) {
    const grid = document.getElementById('movies4DGrid');
    grid.innerHTML = '';
    
    if (movies.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <h3>Próximamente más películas en 4D</h3>
                <p>Estamos trabajando para traerte más experiencias cinematográficas increíbles.</p>
            </div>
        `;
        return;
    }
    
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-4d-card';
        movieCard.setAttribute('data-category', movie.category);
        
        const discountedPrice = calculateDiscountedPrice(movie.price);
        const priceDisplay = discountedPrice < movie.price 
            ? `<span style="text-decoration: line-through; color: var(--text-secondary); font-size: 0.9rem;">$${movie.price.toFixed(2)}</span> $${discountedPrice.toFixed(2)}`
            : `$${movie.price.toFixed(2)}`;
        
        movieCard.innerHTML = `
            <div class="movie-image">
                <img src="${movie.image}" alt="${movie.title}" onerror="this.src='../../assets/images/placeholder-movie.jpg'">
                <div class="movie-4d-badge">4D Experience</div>
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-genre">${movie.genre}</div>
                <div class="movie-showtimes">
                    ${movie.showtimes.map(time => `
                        <button class="showtime-btn" onclick="selectShowtime('${movie.id}', '${time}')">
                            ${time}
                        </button>
                    `).join('')}
                </div>
                <div class="movie-price">${priceDisplay}</div>
            </div>
        `;
        
        grid.appendChild(movieCard);
    });
}

// Calcular precio con descuento
function calculateDiscountedPrice(originalPrice) {
    if (!currentUser || !currentUser.discount_percentage) {
        return originalPrice;
    }
    
    const discount = parseFloat(currentUser.discount_percentage) / 100;
    return originalPrice * (1 - discount);
}

// Filtrar películas por categoría
function filterMovies(category) {
    // Actualizar botones de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${category}"]`).classList.add('active');
    
    // Filtrar y mostrar películas
    const filteredMovies = category === 'all' 
        ? movies4D 
        : movies4D.filter(movie => movie.category === category);
    
    displayMovies(filteredMovies);
    
    // Animar la transición
    const grid = document.getElementById('movies4DGrid');
    grid.style.opacity = '0.7';
    setTimeout(() => {
        grid.style.opacity = '1';
    }, 200);
}

// Seleccionar horario de película
function selectShowtime(movieId, showtime) {
    const movie = movies4D.find(m => m.id == movieId);
    if (!movie) return;
    
    // Guardar selección en sessionStorage
    const selection = {
        movieId: movie.id,
        movieTitle: movie.title,
        showtime: showtime,
        roomType: '4d',
        price: calculateDiscountedPrice(movie.price),
        originalPrice: movie.price
    };
    
    sessionStorage.setItem('movieSelection', JSON.stringify(selection));
    
    // Redirigir a selección de asientos
    window.location.href = 'butacas.html?room=4d&movie=' + movieId + '&showtime=' + encodeURIComponent(showtime);
}

// Ir a selección de películas
function goToMovieSelection() {
    window.location.href = '#movies-4d';
    
    // Scroll suave a la sección
    document.getElementById('movies4DGrid').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Ver demo de 4D
function watchDemo() {
    document.getElementById('demoModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Reproducir video automáticamente (si el navegador lo permite)
    const video = document.getElementById('demoVideo');
    if (video) {
        video.currentTime = 0;
        video.play().catch(e => {
            console.log('Autoplay no permitido:', e);
        });
    }
}

// Cerrar modal de demo
function closeDemoModal() {
    const modal = document.getElementById('demoModal');
    const video = document.getElementById('demoVideo');
    
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Pausar video
    if (video) {
        video.pause();
    }
}

// Inicializar showcase de efectos
function initializeEffectShowcase() {
    const effectItems = document.querySelectorAll('.effect-item');
    
    effectItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const effect = this.getAttribute('data-effect');
            animateEffect(this, effect);
        });
        
        item.addEventListener('mouseleave', function() {
            resetEffectAnimation(this);
        });
    });
}

// Animar efectos
function animateEffect(element, effectType) {
    element.style.transform = 'translateY(-5px) scale(1.05)';
    
    switch(effectType) {
        case 'motion':
            element.style.animation = 'shake 0.5s infinite';
            break;
        case 'wind':
            element.style.animation = 'sway 1s infinite';
            break;
        case 'water':
            element.style.animation = 'droplet 0.8s infinite';
            break;
        case 'scent':
            element.style.animation = 'pulse 1s infinite';
            break;
    }
}

// Resetear animación de efectos
function resetEffectAnimation(element) {
    element.style.transform = '';
    element.style.animation = '';
}

// Agregar animaciones de scroll
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    const animatedElements = document.querySelectorAll('.effect-item, .movie-4d-card, .pricing-card, .recommendation-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Event listeners adicionales
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal al hacer click fuera
    window.onclick = function(event) {
        const modal = document.getElementById('demoModal');
        if (event.target === modal) {
            closeDemoModal();
        }
    };
    
    // Manejar tecla ESC para cerrar modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeDemoModal();
        }
    });
    
    // Animación de números en las estadísticas
    animateStats();
});

// Animar números en estadísticas
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = parseInt(target.textContent);
                let currentValue = 0;
                const increment = finalValue / 50;
                
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        currentValue = finalValue;
                        clearInterval(timer);
                    }
                    target.textContent = Math.floor(currentValue) + (target.textContent.includes('°') ? '°' : '');
                }, 20);
                
                observer.unobserve(target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

// Agregar estilos CSS para animaciones personalizadas
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateY(-5px) scale(1.05) translateX(0); }
        25% { transform: translateY(-5px) scale(1.05) translateX(-2px); }
        75% { transform: translateY(-5px) scale(1.05) translateX(2px); }
    }
    
    @keyframes sway {
        0%, 100% { transform: translateY(-5px) scale(1.05) rotate(0deg); }
        50% { transform: translateY(-5px) scale(1.05) rotate(3deg); }
    }
    
    @keyframes droplet {
        0% { transform: translateY(-5px) scale(1.05); }
        50% { transform: translateY(-3px) scale(1.08); }
        100% { transform: translateY(-5px) scale(1.05); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: translateY(-5px) scale(1.05); opacity: 1; }
        50% { transform: translateY(-5px) scale(1.1); opacity: 0.8; }
    }
`;
document.head.appendChild(style);
