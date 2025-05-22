document.addEventListener("DOMContentLoaded", () => {
  console.log("scripts.js cargado correctamente (main content)");

  // --- Elements for main content sections (Cartelera, Próximamente, Promociones) ---
  const promotionsButton = document.getElementById("promotions-button");
  const nowShowingButton = document.getElementById("now-showing-button");
  const upcomingButton = document.getElementById("upcoming-button");
  const comboSection = document.getElementById("combo-section");
  const movieSection = document.getElementById("movie-section");
  const upcomingSection = document.getElementById("upcoming-section"); // Ensure this ID exists if used

  // --- Helper Functions for Main Content ---
  function activateButton(activeButton, ...inactiveButtons) {
    if (activeButton) activeButton.classList.add("active");
    inactiveButtons.forEach((button) => {
      if (button) button.classList.remove("active");
    });
  }

  function clearMovieList() {
    const movieList = document.getElementById("movie-list");
    if (movieList) movieList.innerHTML = "";
    const upcomingList = document.getElementById("upcoming-list");
    if (upcomingList) upcomingList.innerHTML = "";
  }

  function loadCombos() { // This function is used for "Promociones" tab in prueba.html
    const comboList = document.getElementById("combo-list"); 
    if (!comboList) {
        console.warn("Elemento #combo-list no encontrado para cargar promociones/combos.");
        return;
    }

    fetch("/api/combos") 
      .then((response) => {
        if (!response.ok) throw new Error("Error al cargar las promociones/combos");
        return response.json();
      })
      .then((items) => {
        comboList.innerHTML = ""; 
        if (items.length === 0) {
            comboList.innerHTML = '<p>No hay promociones disponibles en este momento.</p>';
            return;
        }
        items.forEach((item) => {
          const itemCard = document.createElement("div");
          itemCard.classList.add("movie-card"); 

          itemCard.innerHTML = `
            <div class="movie-image-container">
                <img src="${item.image}" alt="${item.name}" class="movie-image">
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${item.name}</h3>
                <p class="movie-description">${item.description}</p>
                <p class="price">S/.${parseFloat(item.price).toFixed(2)}</p>
                <!-- Removed "Añadir al Carrito" button -->
            </div>
          `;
          comboList.appendChild(itemCard);
        });

      })
      .catch((error) => {
        console.error("Error al cargar las promociones/combos:", error);
        if (comboList) {
            comboList.innerHTML = '<p>Error al cargar promociones. Intente más tarde.</p>';
        }
      });
  }
  
  
  // --- Event Listeners for Main Content Navigation ---
  if (nowShowingButton && upcomingButton && promotionsButton) {
    nowShowingButton.addEventListener("click", () => {
      activateButton(nowShowingButton, upcomingButton, promotionsButton);
      if (movieSection) movieSection.style.display = "block";
      // Correctly hide upcoming-list when now-showing is active
      if (document.getElementById("upcoming-list")) document.getElementById("upcoming-list").style.display = "none"; 
      if (document.getElementById("movie-list")) document.getElementById("movie-list").style.display = "grid"; 
      if (comboSection) comboSection.style.display = "none";
      clearMovieList();
      if (typeof fetchMovies === "function") { 
        fetchMovies(); 
      } else {
        console.warn("fetchMovies function is not defined.");
      }
    });

    upcomingButton.addEventListener("click", () => {
      activateButton(upcomingButton, nowShowingButton, promotionsButton);
      if (movieSection) movieSection.style.display = "block";
      
      const upcomingListElement = document.getElementById("upcoming-list");
      if (upcomingListElement) {
        upcomingListElement.style.display = "grid";
        console.log("Upcoming list element display set to grid:", upcomingListElement);
      } else {
        console.error("#upcoming-list element not found!");
        return; // Stop if the list element doesn't exist
      }

      if (document.getElementById("movie-list")) document.getElementById("movie-list").style.display = "none";
      if (comboSection) comboSection.style.display = "none";
      
      console.log("Clearing movie lists for upcoming section...");
      clearMovieList(); // This clears both movie-list and upcoming-list

      console.log("Fetching /api/upcoming...");
      fetch("/api/upcoming")
        .then((response) => {
          console.log("/api/upcoming response status:", response.status);
          if (!response.ok) {
            console.error('Error fetching upcoming movies:', response.status, response.statusText);
            return response.text().then(text => { // Try to get error body
              throw new Error(`Error al cargar las películas próximas (${response.status}): ${text}`);
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Data received from /api/upcoming:", JSON.stringify(data, null, 2));
          
          if (!upcomingListElement) { // Double check, though we checked above
              console.error("Cannot display upcoming movies: #upcoming-list element is null after fetch.");
              return;
          }

          if (!data || data.length === 0) {
            console.warn("No upcoming movies found or data is empty from /api/upcoming.");
            upcomingListElement.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px; color: white;">No hay películas próximas disponibles en este momento.</p>';
            console.log("Upcoming list innerHTML after 'no movies' message:", upcomingListElement.innerHTML);
          } else if (typeof displayMovies === "function") { 
            console.log("Calling displayMovies for upcoming-list with data:", data);
            displayMovies(data, 'upcoming-list'); 
            console.log("Upcoming list innerHTML after displayMovies call:", upcomingListElement.innerHTML);
            if (upcomingListElement.children.length === 0) {
                console.warn("displayMovies was called for upcoming-list, but the list is still empty. Check displayMovies function.");
                // Optionally, add a message here too if displayMovies doesn't populate
                // upcomingListElement.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px; color: white;">Hubo un problema al mostrar las películas próximas.</p>';
            }
          } else {
            console.warn("displayMovies function is not defined. Cannot display upcoming movies.");
            upcomingListElement.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px; color: white;">Error al mostrar películas próximas (función de visualización no disponible).</p>';
            console.log("Upcoming list innerHTML after 'displayMovies not defined' message:", upcomingListElement.innerHTML);
          }
        })
        .catch((error) => {
            console.error("Error al cargar o procesar las películas próximas:", error);
            if (upcomingListElement) {
                upcomingListElement.innerHTML = `<p style="text-align: center; width: 100%; padding: 20px; color: red;">Error al cargar las películas próximas. ${error.message}. Intente más tarde.</p>`;
                console.log("Upcoming list innerHTML after CATCH block:", upcomingListElement.innerHTML);
            } else {
                console.error("Cannot display error message: #upcoming-list element is null in catch block.");
            }
        });
    });

    promotionsButton.addEventListener("click", () => {
      activateButton(promotionsButton, nowShowingButton, upcomingButton);
      if (movieSection) movieSection.style.display = "none";
      if (comboSection) comboSection.style.display = "block"; // Or "grid" if it uses movie-grid
      loadCombos();
    });
  } else {
    console.warn("Botones de navegación de contenido principal (Cartelera, Próximamente, Promociones) no encontrados.");
  }

  // --- Lógica para manejar la sección activa desde la URL ---
  function handleSectionFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');

    if (section === 'upcoming' && upcomingButton) {
      upcomingButton.click();
    } else if (section === 'promotions' && promotionsButton) {
      promotionsButton.click();
    } else if (section === 'now-showing' && nowShowingButton) {
      nowShowingButton.click();
    } else {
      if (nowShowingButton) {
        nowShowingButton.click(); // Default to "Cartelera"
      } else if (typeof fetchMovies === "function") {
         if (movieSection) movieSection.style.display = "block";
         if (comboSection) comboSection.style.display = "none";
         clearMovieList();
         fetchMovies();
      }
    }
  }

  // --- Lógica del Carrusel ---
  const carouselContainer = document.querySelector('.carousel-container');
  const track = document.querySelector('.carousel-track');
  const slides = track ? Array.from(track.children) : [];
  const prevButton = document.querySelector('.carousel-control.prev');
  const nextButton = document.querySelector('.carousel-control.next');
  let currentSlide = 0;
  let slideInterval;
  let slideWidth = 0;

  function updateSlideWidthAndPosition() {
    if (slides.length > 0 && carouselContainer && track) {
      slideWidth = carouselContainer.offsetWidth;
      showSlide(currentSlide, false); 
    }
  }

  function showSlide(index, animate = true) {
    if (!track || slides.length === 0) return;
    if (!animate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.5s ease-in-out';
    }
    const offset = -index * slideWidth;
    track.style.transform = `translateX(${offset}px)`;
    if (!animate) {
        // eslint-disable-next-line no-unused-expressions
        track.offsetHeight; 
        track.style.transition = 'transform 0.5s ease-in-out';
    }
  }

  function nextSlideAuto() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlideManual() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
    resetInterval();
  }
  function nextSlideManual() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
    resetInterval();
  }


  if (slides.length > 0) {
    updateSlideWidthAndPosition();
    window.addEventListener('resize', updateSlideWidthAndPosition);

    if (prevButton && nextButton) {
      prevButton.addEventListener('click', prevSlideManual);
      nextButton.addEventListener('click', nextSlideManual);
    }

    function startInterval() {
      clearInterval(slideInterval); // Clear existing interval before starting a new one
      slideInterval = setInterval(nextSlideAuto, 5000);
    }

    function resetInterval() {
      clearInterval(slideInterval);
      startInterval();
    }
    startInterval();
  } else {
      // console.warn("Carrusel no encontrado o sin slides.");
  }

  // --- Initial calls ---
  handleSectionFromURL(); // Handle section based on URL params after everything is set up
});