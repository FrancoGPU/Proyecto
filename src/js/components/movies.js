function displayMovies(movies, listId = "movie-list") { // Add listId parameter with a default
  const targetList = document.getElementById(listId);

  if (!targetList) {
    console.error(`Element with ID "${listId}" not found. Cannot display movies.`);
    return;
  }

  targetList.innerHTML = ""; // Limpiar el contenedor de películas específico

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
        ${
          movie.showtimes && Array.isArray(movie.showtimes) && movie.showtimes.length > 0
            ? `<div class="movie-showtimes">
                 <strong>Horarios:</strong>
                 <br>
                 ${movie.showtimes
                   .map(
                     (time) =>
                       `<span class="movie-showtime">${time}</span>`
                   )
                   .join("")}
               </div>`
            : ""
        }
      </div>
    `;

    movieCard.addEventListener("click", () => {
      window.location.href = `/paginas/Reserva/horarios.html?movie=${encodeURIComponent(movie.title)}&id=${movie.id}`; // Added movie.id for better targeting
    });

    targetList.appendChild(movieCard);
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
      displayMovies(movies, "movie-list"); 
    })
    .catch((error) => console.error("Error al obtener las películas:", error));
}