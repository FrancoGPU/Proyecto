document.addEventListener('DOMContentLoaded', async () => {
    const adminMessage = document.getElementById('admin-message');
    const adminMainContent = document.getElementById('admin-main-content');
    
    // Elementos para gestión de películas
    const moviesManagementSection = document.getElementById('movies-management');
    const moviesTableBody = document.getElementById('movies-table-body');
    const addMovieBtn = document.getElementById('add-movie-btn');
    const movieModal = document.getElementById('movie-modal');
    const movieModalTitle = document.getElementById('movie-modal-title');
    const closeMovieModalBtn = document.getElementById('close-movie-modal');
    const movieForm = document.getElementById('movie-form');
    const cancelMovieFormBtn = document.getElementById('cancel-movie-form');

    let currentEditingMovieId = null;

    // Elementos para gestión de combos
    const combosManagementSection = document.getElementById('combos-management');
    const combosTableBody = document.getElementById('combos-table-body');
    const addComboBtn = document.getElementById('add-combo-btn');
    const comboModal = document.getElementById('combo-modal');
    const comboModalTitle = document.getElementById('combo-modal-title');
    const closeComboModalBtn = document.getElementById('close-combo-modal');
    const comboForm = document.getElementById('combo-form');
    const cancelComboFormBtn = document.getElementById('cancel-combo-form');

    let currentEditingComboId = null;

    // Verificar si el usuario es administrador
    if (!adminMessage || !adminMainContent) {
        console.error("Elementos base de admin no encontrados.");
        return;
    }

    try {
        const response = await fetch('/api/session/status');
        if (!response.ok) throw new Error(`Error al verificar sesión: ${response.status}`);
        const sessionData = await response.json();

        if (sessionData.loggedIn && sessionData.user && sessionData.user.role === 'admin') {
            adminMessage.style.display = 'none';
            adminMainContent.style.display = 'block';
            console.log('Acceso de administrador concedido.');
            loadAdminMovies(); // Cargar películas al iniciar
            loadAdminCombos(); // Cargar combos al iniciar
        } else {
            adminMessage.innerHTML = '<p style="color: red;">Acceso denegado. Solo los administradores pueden ver esta página. Serás redirigido.</p>';
            setTimeout(() => { window.location.href = '/paginas/login.html'; }, 3000);
        }
    } catch (error) {
        console.error('Error al verificar el acceso de administrador:', error);
        adminMessage.innerHTML = '<p style="color: red;">Error al verificar permisos. Inténtalo más tarde.</p>';
        setTimeout(() => { window.location.href = '/paginas/prueba.html'; }, 3000);
    }

    // --- Gestión de Películas ---
    async function loadAdminMovies() {
        if (!moviesTableBody) {
            console.warn("Elemento moviesTableBody no encontrado. Saltando carga de películas.");
            return;
        }
        try {
            const response = await fetch('/api/admin/movies');
            if (!response.ok) throw new Error('Error al cargar películas');
            const movies = await response.json();
            
            moviesTableBody.innerHTML = ''; // Limpiar tabla
            movies.forEach(movie => {
                const row = moviesTableBody.insertRow();
                row.innerHTML = `
                    <td>${movie.id}</td>
                    <td>${movie.title}</td>
                    <td>${movie.director || 'N/A'}</td>
                    <td>${movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</td>
                    <td class="actions-cell">
                        <button class="btn-edit" data-id="${movie.id}" data-type="movie">Editar</button>
                        <button class="btn-delete" data-id="${movie.id}" data-type="movie">Eliminar</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error cargando películas para admin:', error);
            moviesTableBody.innerHTML = '<tr><td colspan="5">Error al cargar películas.</td></tr>';
        }
    }

    function openMovieModal(movie = null) {
        if (!movieModal || !movieForm || !movieModalTitle) return;
        movieForm.reset(); 
        if (movie) {
            currentEditingMovieId = movie.id;
            movieModalTitle.textContent = 'Editar Película';
            document.getElementById('movie-id').value = movie.id; // Asegúrate que este campo exista en el form si lo usas
            document.getElementById('movie-title').value = movie.title || '';
            document.getElementById('movie-description').value = movie.description || '';
            document.getElementById('movie-image_url').value = movie.image_url || '';
            document.getElementById('movie-release_date').value = movie.release_date ? movie.release_date.split('T')[0] : '';
            document.getElementById('movie-director').value = movie.director || '';
            document.getElementById('movie-duration_minutes').value = movie.duration_minutes || '';
            document.getElementById('movie-genre').value = movie.genre || '';
            document.getElementById('movie-trailer_url').value = movie.trailer_url || '';
            document.getElementById('movie-rating').value = movie.rating || '';
        } else {
            currentEditingMovieId = null;
            movieModalTitle.textContent = 'Añadir Nueva Película';
        }
        movieModal.style.display = 'block';
    }

    function closeMovieModal() {
        if (movieModal) movieModal.style.display = 'none';
        currentEditingMovieId = null;
    }

    if (addMovieBtn) {
        addMovieBtn.addEventListener('click', () => openMovieModal());
    }
    if (closeMovieModalBtn) {
        closeMovieModalBtn.addEventListener('click', closeMovieModal);
    }
    if (cancelMovieFormBtn) {
        cancelMovieFormBtn.addEventListener('click', closeMovieModal);
    }
    if (movieModal) {
        window.addEventListener('click', (event) => {
            if (event.target === movieModal) {
                closeMovieModal();
            }
        });
    }

    if (movieForm) {
        movieForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(movieForm);
            const movieData = Object.fromEntries(formData.entries());

            if (movieData.duration_minutes) movieData.duration_minutes = parseInt(movieData.duration_minutes, 10);
            else delete movieData.duration_minutes; 

            if (!movieData.release_date) delete movieData.release_date;

            const method = currentEditingMovieId ? 'PUT' : 'POST';
            const url = currentEditingMovieId ? `/api/admin/movies/${currentEditingMovieId}` : '/api/admin/movies';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movieData)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error al guardar película`);
                }
                alert(`Película ${currentEditingMovieId ? 'actualizada' : 'añadida'} exitosamente.`);
                closeMovieModal();
                loadAdminMovies(); 
            } catch (error) {
                console.error('Error guardando película:', error);
                alert(`Error al guardar película: ${error.message}`);
            }
        });
    }

    if (moviesTableBody) {
        moviesTableBody.addEventListener('click', async (event) => {
            const target = event.target;
            const movieId = target.dataset.id;
            const type = target.dataset.type;

            if (type === 'movie') { // Asegurarse que es para películas
                if (target.classList.contains('btn-edit') && movieId) {
                    try {
                        const response = await fetch(`/api/admin/movies/${movieId}`);
                        if (!response.ok) throw new Error('No se pudo obtener la película para editar.');
                        const movie = await response.json();
                        openMovieModal(movie);
                    } catch (error) {
                        console.error('Error al obtener película para editar:', error);
                        alert(error.message);
                    }
                } else if (target.classList.contains('btn-delete') && movieId) {
                    if (confirm('¿Estás seguro de que quieres eliminar esta película?')) {
                        try {
                            const response = await fetch(`/api/admin/movies/${movieId}`, { method: 'DELETE' });
                            if (!response.ok) {
                                 const errorData = await response.json();
                                 throw new Error(errorData.message || 'Error al eliminar la película.');
                            }
                            alert('Película eliminada exitosamente.');
                            loadAdminMovies(); 
                        } catch (error) {
                            console.error('Error eliminando película:', error);
                            alert(`Error al eliminar película: ${error.message}`);
                        }
                    }
                }
            }
        });
    }
    // --- Fin Gestión de Películas ---

    // --- Gestión de Combos ---
    async function loadAdminCombos() {
        if (!combosTableBody) {
            console.warn("Elemento combosTableBody no encontrado. Saltando carga de combos.");
            return;
        }
        try {
            const response = await fetch('/api/admin/combos'); 
            if (!response.ok) throw new Error('Error al cargar combos');
            const combos = await response.json();
            
            combosTableBody.innerHTML = ''; 
            combos.forEach(combo => {
                const row = combosTableBody.insertRow();
                row.innerHTML = `
                    <td>${combo.id}</td>
                    <td>${combo.name}</td>
                    <td>${parseFloat(combo.price).toFixed(2)}</td>
                    <td class="actions-cell">
                        <button class="btn-edit" data-id="${combo.id}" data-type="combo">Editar</button>
                        <button class="btn-delete" data-id="${combo.id}" data-type="combo">Eliminar</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error cargando combos para admin:', error);
            combosTableBody.innerHTML = '<tr><td colspan="4">Error al cargar combos.</td></tr>';
        }
    }

    function openComboModal(combo = null) {
        if (!comboModal || !comboForm || !comboModalTitle) return;
        comboForm.reset(); 
        if (combo) {
            currentEditingComboId = combo.id;
            comboModalTitle.textContent = 'Editar Combo';
            document.getElementById('combo-id').value = combo.id; // Asegúrate que este campo exista en el form si lo usas
            document.getElementById('combo-name').value = combo.name || '';
            document.getElementById('combo-description').value = combo.description || '';
            document.getElementById('combo-price').value = combo.price || '';
            document.getElementById('combo-image_url').value = combo.image_url || '';
        } else {
            currentEditingComboId = null;
            comboModalTitle.textContent = 'Añadir Nuevo Combo';
        }
        comboModal.style.display = 'block';
    }

    function closeComboModal() {
        if (comboModal) comboModal.style.display = 'none';
        currentEditingComboId = null;
    }

    if (addComboBtn) {
        addComboBtn.addEventListener('click', () => openComboModal());
    }
    if (closeComboModalBtn) { // Asegúrate que el ID del botón de cerrar sea único o usa una clase
        closeComboModalBtn.addEventListener('click', closeComboModal);
    }
    if (cancelComboFormBtn) { // Asegúrate que el ID del botón de cancelar sea único o usa una clase
        cancelComboFormBtn.addEventListener('click', closeComboModal);
    }
    if (comboModal) {
        window.addEventListener('click', (event) => {
            if (event.target === comboModal) {
                closeComboModal();
            }
        });
    }

    if (comboForm) {
        comboForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(comboForm);
            const comboData = Object.fromEntries(formData.entries());

            if (comboData.price) comboData.price = parseFloat(comboData.price);
            else delete comboData.price;

            const method = currentEditingComboId ? 'PUT' : 'POST';
            const url = currentEditingComboId ? `/api/admin/combos/${currentEditingComboId}` : '/api/admin/combos';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(comboData)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error al guardar combo`);
                }
                alert(`Combo ${currentEditingComboId ? 'actualizado' : 'añadido'} exitosamente.`);
                closeComboModal();
                loadAdminCombos(); 
            } catch (error) {
                console.error('Error guardando combo:', error);
                alert(`Error al guardar combo: ${error.message}`);
            }
        });
    }

    if (combosTableBody) {
        combosTableBody.addEventListener('click', async (event) => {
            const target = event.target;
            const comboId = target.dataset.id;
            const type = target.dataset.type; 

            if (type === 'combo') {
                if (target.classList.contains('btn-edit') && comboId) {
                    try {
                        const response = await fetch(`/api/admin/combos/${comboId}`); 
                        if (!response.ok) throw new Error('No se pudo obtener el combo para editar.');
                        const combo = await response.json();
                        openComboModal(combo);
                    } catch (error) {
                        console.error('Error al obtener combo para editar:', error);
                        alert(error.message);
                    }
                } else if (target.classList.contains('btn-delete') && comboId) {
                    if (confirm('¿Estás seguro de que quieres eliminar este combo?')) {
                        try {
                            const response = await fetch(`/api/admin/combos/${comboId}`, { method: 'DELETE' }); 
                            if (!response.ok) {
                                 const errorData = await response.json();
                                 throw new Error(errorData.message || 'Error al eliminar el combo.');
                            }
                            alert('Combo eliminado exitosamente.');
                            loadAdminCombos(); 
                        } catch (error) {
                            console.error('Error eliminando combo:', error);
                            alert(`Error al eliminar combo: ${error.message}`);
                        }
                    }
                }
            }
        });
    }
    // --- Fin Gestión de Combos ---
});