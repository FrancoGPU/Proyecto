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
