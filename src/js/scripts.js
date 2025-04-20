document.addEventListener("DOMContentLoaded", () => {
  console.log("scripts.js cargado correctamente");
  fetchMovies(); // Cargar las películas iniciales (cartelera)

  const promotionsButton = document.getElementById("promotions-button");
  const nowShowingButton = document.getElementById("now-showing-button");
  const upcomingButton = document.getElementById("upcoming-button");
  const comboSection = document.getElementById("combo-section");
  const movieSection = document.getElementById("movie-section");
  const searchBar = document.getElementById("search-bar");
  const searchSubmit = document.getElementById("search-submit");
  const userButton = document.getElementById("user-button");

  function activateButton(activeButton, ...inactiveButtons) {
    activeButton.classList.add("active");
    inactiveButtons.forEach((button) => button.classList.remove("active"));
  }

  function clearMovieList() {
    const movieList = document.getElementById("movie-list");
    if (movieList) movieList.innerHTML = ""; // Limpiar la lista de películas
  }

  function loadCombos() {
    const comboList = document.getElementById("combo-list");
    if (!comboList) return;

    fetch("/api/combos")
      .then((response) => {
        if (!response.ok) throw new Error("Error al cargar los combos");
        return response.json();
      })
      .then((combos) => {
        comboList.innerHTML = ""; // Limpiar la lista de combos
        combos.forEach((combo) => {
          const comboCard = document.createElement("div");
          comboCard.classList.add("combo-card");

          comboCard.innerHTML = `
            <img src="${combo.image}" alt="${combo.name}">
            <h3>${combo.name}</h3>
            <p>${combo.description}</p>
            <p class="price">S/.${parseFloat(combo.price).toFixed(2)}</p>
          `;

          comboList.appendChild(comboCard);
        });
      })
      .catch((error) => console.error("Error al cargar los combos:", error));
  }

  // Función para realizar la búsqueda
  function performSearch() {
    const query = searchBar.value.trim().toLowerCase();
    const movieList = document.getElementById("movie-list");
    if (movieList) {
      const movies = Array.from(movieList.children);
      movies.forEach((movie) => {
        const title = movie.querySelector("h3")?.textContent.toLowerCase() || "";
        movie.style.display = title.includes(query) ? "block" : "none";
      });
    }
  }

  // Funcionalidad de la barra de búsqueda
  if (searchBar && searchSubmit) {
    // Buscar al hacer clic en el botón de búsqueda
    searchSubmit.addEventListener("click", performSearch);

    // Buscar al presionar Enter en el campo de búsqueda
    searchBar.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Evitar el envío del formulario si está dentro de uno
        performSearch();
      }
    });
  }

  // Funcionalidad del botón de usuario
  if (userButton) {
    userButton.addEventListener("click", () => {
      window.location.href = "/paginas/login.html"; // Redirigir a la página de inicio de sesión
    });
  }

  if (nowShowingButton && upcomingButton && promotionsButton) {
    nowShowingButton.addEventListener("click", () => {
      activateButton(nowShowingButton, upcomingButton, promotionsButton);
      if (movieSection) movieSection.style.display = "block";
      if (comboSection) comboSection.style.display = "none";
      clearMovieList();
      fetchMovies(); // Volver a cargar las películas de cartelera
    });

    upcomingButton.addEventListener("click", () => {
      activateButton(upcomingButton, nowShowingButton, promotionsButton);
      if (movieSection) movieSection.style.display = "block";
      if (comboSection) comboSection.style.display = "none";
      clearMovieList();
      fetch("/api/upcoming")
        .then((response) => {
          if (!response.ok) throw new Error("Error al cargar las películas próximas");
          return response.json();
        })
        .then((data) => {
          displayMovies(data); // Mostrar las películas próximas
        })
        .catch((error) => console.error("Error al cargar las películas próximas:", error));
    });

    promotionsButton.addEventListener("click", () => {
      activateButton(promotionsButton, nowShowingButton, upcomingButton);
      if (movieSection) movieSection.style.display = "none";
      if (comboSection) comboSection.style.display = "block";
      loadCombos(); // Cargar los combos dinámicamente
    });
  }

  // Asegurarse de que ambas secciones estén visibles al cargar la página
  if (comboSection) comboSection.style.display = "none";
});