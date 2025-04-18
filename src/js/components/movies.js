function displayMovies(movies) {
  const movieList = document.getElementById("movie-list");
  movieList.innerHTML = ""; // Limpiar el contenedor de películas

  movies.forEach((movie) => {
    const movieCard = document.createElement("article");
    movieCard.classList.add("movie-card");

    const releaseDate = new Date(movie.release_date);
    const formattedDate = releaseDate.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    movieCard.innerHTML = `
      <div class="movie-image-container">
        <img src="${movie.image}" alt="${movie.title}" class="movie-image">
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <span class="movie-genre">${movie.genre}</span>
        <p class="movie-release">Estreno: ${formattedDate}</p>
        <p class="movie-description">${movie.description}</p>
      </div>
    `;

    movieCard.addEventListener("click", () => {
      window.location.href = `/paginas/horarios.html?movie=${encodeURIComponent(movie.title)}`;
    });

    movieList.appendChild(movieCard);
  });
}

function fetchMovies() {
  fetch("/api/movies")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al cargar los datos de las películas");
      }
      return response.json();
    })
    .then((movies) => {
      displayMovies(movies);
    })
    .catch((error) => console.error("Error al obtener las películas:", error));
}
