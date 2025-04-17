function fetchMovies() {
    fetch("/src/data/movies.json") // Ruta relativa al archivo movies.json
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar los datos de las películas");
        }
        return response.json();
      })
      .then((data) => displayMovies(data))
      .catch((error) => console.error("Error fetching movie data:", error));
  }

  function displayMovies(movies) {
    const movieContainer = document.getElementById("movie-list");
    if (!movieContainer) return;

    movieContainer.innerHTML = "";

    movies.forEach((movie) => {
      const movieCard = document.createElement("article");
      movieCard.classList.add("movie-card");
      movieCard.dataset.movieId = movie.id;

      const releaseDate = new Date(movie.release_date);
      const formattedDate = releaseDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const showtimesHTML = movie.showtimes
        .map((time) => `<span class="movie-showtime">${time}</span>`)
        .join(" ");

      movieCard.innerHTML = `
            <div class="movie-image-container">
                <img src="${movie.image}" alt="${movie.title}" class="movie-image">
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <span class="movie-genre">${movie.genre}</span>
                <p class="movie-release">Estreno: ${formattedDate}</p>
                <p class="movie-description">${movie.description}</p>
                <div class="movie-showtimes">
                    ${showtimesHTML}
                </div>
            </div>
        `;

      movieCard.addEventListener("click", () => {
        window.location.href = `../paginas/horarios.html?movie=${encodeURIComponent(
          movie.title
        )}`;
      });

      movieContainer.appendChild(movieCard);
    });
  
  // Cargar películas en cartelera por defecto
  loadMovies("../data/movies.json");
};