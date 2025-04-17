document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieTitle = urlParams.get('movie');
    const showtimesContainer = document.getElementById('showtimes-container');

    if (movieTitle) {
        document.getElementById('movie-title').textContent = movieTitle;

        // Guardar el título de la película en localStorage
        localStorage.setItem('movieTitle', movieTitle);

        // Fetch movie data
        fetch('../data/movies.json')
            .then(response => response.json())
            .then(movies => {
                const movie = movies.find(m => m.title === movieTitle);
                if (movie) {
                    movie.showtimes.forEach(time => {
                        const button = document.createElement('button');
                        button.className = 'btn-primary';
                        button.textContent = time;

                        button.addEventListener('click', () => {
                            // Quitar la clase 'selected' de otros botones
                            document.querySelectorAll('.btn-primary').forEach(btn => btn.classList.remove('selected'));
                            // Añadir la clase 'selected' al botón actual
                            button.classList.add('selected');

                            // Guardar el horario seleccionado y redirigir
                            localStorage.setItem('selectedShowtime', time);

                            // Redirigir a la página de butacas
                            window.location.href = '../paginas/butacas.html';
                        });

                        showtimesContainer.appendChild(button);
                    });
                } else {
                    console.error('Película no encontrada en los datos.');
                }
            })
            .catch(error => console.error('Error al cargar los datos de las películas:', error));
    } else {
        console.error('No se encontró el parámetro "movie" en la URL.');
    }
    
});