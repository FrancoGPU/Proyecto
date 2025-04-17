document.addEventListener("DOMContentLoaded", () => {
  console.log("scripts.js cargado correctamente");
  fetchMovies();

  // Funcionalidad para el botón de búsqueda
  const searchButton = document.getElementById("search-button");
  const searchBar = document.getElementById("search-bar");

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const searchBar = document.getElementById("search-bar");
      if (searchBar) {
        searchBar.classList.toggle("visible"); // Mostrar/ocultar barra de búsqueda
      }
    });
  }

  // Funcionalidad para el botón de usuario
  const userButton = document.getElementById("user-button");
  if (userButton) {
    userButton.addEventListener("click", () => {
      window.location.href = "login.html"; // Redirige directamente a la página de inicio de sesión
    });
  }
  // Verificar si el usuario ha iniciado sesión
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const promotionsButton = document.getElementById("promotions-button");

  if (isLoggedIn && promotionsButton) {
    promotionsButton.style.display = "flex"; // Mostrar el botón de promociones

    // Agregar evento para mostrar combos de dulcería
    promotionsButton.addEventListener("click", () => {
      const modal = document.getElementById("promotions-modal");
      if (modal) {
        modal.style.display = "block";
        loadCombos(); // Cargar combos al abrir el modal
      }
    });
  }

  // Cerrar el modal
  const closeModal = document.getElementById("close-modal");
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      const modal = document.getElementById("promotions-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  }

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
  }
  const nowShowingButton = document.getElementById("now-showing-button");
  const upcomingButton = document.getElementById("upcoming-button");
  const movieList = document.getElementById("movie-list");

  function loadMovies(jsonPath, isUpcoming = false) {
    fetch(jsonPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar las películas");
        }
        return response.json();
      })
      .then((movies) => {
        movieList.innerHTML = "";
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

          // Si no es "Próximamente", permitir redirección
          if (!isUpcoming) {
            movieCard.addEventListener("click", () => {
              window.location.href = `../paginas/horarios.html?movie=${encodeURIComponent(
                movie.title
              )}`;
            });
          }

          movieList.appendChild(movieCard);
        });
      })
      .catch((error) => console.error(error));
  }

  function activateButton(activeButton, inactiveButton) {
    activeButton.classList.add("active");
    inactiveButton.classList.remove("active");
  }

  // Asignar eventos a los botones principales
  nowShowingButton.addEventListener("click", () => {
    activateButton(nowShowingButton, upcomingButton);
    loadMovies("../data/movies.json", false); // Cartelera: seleccionable
  });

  upcomingButton.addEventListener("click", () => {
    activateButton(upcomingButton, nowShowingButton);
    loadMovies("../data/upcoming.json", true); // Próximamente: no seleccionable
  });

  // Cargar películas en cartelera por defecto
  loadMovies("../data/movies.json");
});

function loadCombos() {
  fetch("../data/combos.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al cargar los combos");
      }
      return response.json();
    })
    .then((combos) => {
      const combosList = document.getElementById("combos-list");
      combosList.innerHTML = ""; // Limpiar contenido previo

      combos.forEach((combo) => {
        const comboCard = document.createElement("div");
        comboCard.classList.add("combo-card");

        comboCard.innerHTML = `
                    <img src="${combo.image}" alt="${combo.name}">
                    <h3>${combo.name}</h3>
                    <p>${combo.description}</p>
                    <p class="price">${combo.price}</p>
                `;

        combosList.appendChild(comboCard);
      });
    })
    .catch((error) => console.error("Error al cargar los combos:", error));
}
