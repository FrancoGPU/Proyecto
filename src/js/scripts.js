document.addEventListener("DOMContentLoaded", () => {
  console.log("scripts.js cargado correctamente");
  fetchMovies(); // Esta función vendrá de movies.js

  const searchBar = document.getElementById("search-bar");
  const searchSubmit = document.getElementById("search-submit");
  const movieList = document.getElementById("movie-list");

  if (searchSubmit && searchBar) {
    const handleSearch = () => {
      const query = searchBar.value.trim().toLowerCase();
      const movies = Array.from(movieList.children);
      movies.forEach((movie) => {
        const title = movie.querySelector(".movie-title").textContent.toLowerCase();
        movie.style.display = title.includes(query) ? "block" : "none";
      });
    };

    searchSubmit.addEventListener("click", handleSearch);
    searchBar.addEventListener("input", handleSearch);
  }

  const userButton = document.getElementById("user-button");
  if (userButton) {
    userButton.addEventListener("click", () => {
      window.location.href = "/paginas/login.html";
    });
  }

  const nowShowingButton = document.getElementById("now-showing-button");
  const upcomingButton = document.getElementById("upcoming-button");

  function activateButton(active, inactive) {
    active.classList.add("active");
    inactive.classList.remove("active");
  }

  if (nowShowingButton && upcomingButton) {
    nowShowingButton.addEventListener("click", () => {
      activateButton(nowShowingButton, upcomingButton);
      fetchMovies();
    });

    upcomingButton.addEventListener("click", () => {
      activateButton(upcomingButton, nowShowingButton);
      fetch("/api/upcoming")
        .then((response) => {
          if (!response.ok) throw new Error("Error al cargar las películas próximas");
          return response.json();
        })
        .then((data) => {
          displayMovies(data); // Esta también viene de movies.js
        })
        .catch((error) => console.error("Error fetching upcoming movies:", error));
    });
  }

  // Cargar combos
  function loadCombos() {
    fetch("/api/combos")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los combos");
        return res.json();
      })
      .then((combos) => {
        const combosList = document.getElementById("combos-list");
        if (!combosList) return;
        combosList.innerHTML = "";

        combos.forEach((combo) => {
          const comboCard = document.createElement("div");
          comboCard.classList.add("combo-card");

          const price = parseFloat(combo.price) || 0;

          comboCard.innerHTML = `
            <img src="${combo.image}" alt="${combo.name}">
            <h3>${combo.name}</h3>
            <p>${combo.description}</p>
            <p class="price">S/.${price.toFixed(2)}</p>
          `;

          combosList.appendChild(comboCard);
        });
      })
      .catch((err) => console.error("Error al cargar los combos:", err));
  }

  const promotionsButton = document.getElementById("promotions-button");
  if (promotionsButton) {
    promotionsButton.addEventListener("click", () => {
      const modal = document.getElementById("promotions-modal");
      if (modal) {
        modal.style.display = "block";
        loadCombos();
      }
    });
  }

  const closeModal = document.getElementById("close-modal");
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      const modal = document.getElementById("promotions-modal");
      if (modal) modal.style.display = "none";
    });
  }
});
