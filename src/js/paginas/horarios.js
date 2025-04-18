document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieTitle = urlParams.get('movie');
    const showtimesContainer = document.getElementById('showtimes-container');

    if (movieTitle) {
        document.getElementById('movie-title').textContent = movieTitle;

        // Guardar el título de la película en localStorage
        localStorage.setItem('movieTitle', movieTitle);

        // Fetch movie data
        fetch('/api/movies')
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al cargar los datos de las películas");
                }
                return response.json();
            })
            .then((movies) => {
                const movie = movies.find((m) => m.title === movieTitle);
                if (movie && movie.showtimes) {
                    movie.showtimes.forEach((time) => {
                        const button = document.createElement('button');
                        button.className = 'btn-primary';
                        button.textContent = time;

                        button.addEventListener('click', () => {
                            document.querySelectorAll('.btn-primary').forEach((btn) => btn.classList.remove('selected'));
                            button.classList.add('selected');
                            localStorage.setItem('selectedShowtime', time);
                            window.location.href = '../paginas/butacas.html';
                        });

                        showtimesContainer.appendChild(button);
                    });
                } else {
                    console.error('Película no encontrada o no tiene horarios disponibles.');
                }
            })
            .catch((error) => console.error('Error al cargar los datos de las películas:', error));
    } else {
        console.error("No se especificó una película en la URL.");
    }
});