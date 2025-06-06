document.addEventListener("DOMContentLoaded", () => {
  console.log("scripts.js cargado correctamente (main content)");

  // --- Elements for main content sections (Cartelera, Próximamente, Promociones) ---
  const promotionsButton = document.getElementById("promotions-button");
  const nowShowingButton = document.getElementById("now-showing-button");
  const upcomingButton = document.getElementById("upcoming-button");
  const comboSection = document.getElementById("combo-section");
  const movieSection = document.getElementById("movie-section");
  const upcomingSection = document.getElementById("upcoming-section"); // Ensure this ID exists if used
  const dulceriaButton = document.getElementById("dulceria-button");
  const dulceriaSection = document.getElementById("dulceria-section");

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

  function loadDulceria() {
    const dulceriaList = document.getElementById("dulceria-list");
    const combosList = document.getElementById("combos-list");
    if (!dulceriaList || !combosList) {
      console.warn("Contenedores de dulcería o combos no encontrados.");
      return;
    }
    // Cargar productos individuales
    fetch("/api/dulceria")
      .then((response) => {
        if (!response.ok) throw new Error("Error al cargar productos de dulcería");
        return response.json();
      })
      .then((items) => {
        dulceriaList.innerHTML = "";
        if (items.length === 0) {
          dulceriaList.innerHTML = '<p>No hay productos de dulcería disponibles.</p>';
          return;
        }
        items.forEach((item) => {
          const itemCard = document.createElement("div");
          itemCard.classList.add("combo-card"); // Changed from movie-card to combo-card
          itemCard.innerHTML = `
            <div class="movie-image-container">
                <img src="${item.imagen}" alt="${item.nombre}" class="movie-image">
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${item.nombre}</h3>
                <p class="movie-description">${item.descripcion}</p>
                <p class="price">S/.${parseFloat(item.precio).toFixed(2)}</p>
                <!-- Aquí puedes agregar botón de carrito si lo deseas -->
            </div>
          `;
          dulceriaList.appendChild(itemCard);
        });
      })
      .catch((error) => {
        dulceriaList.innerHTML = '<p>Error al cargar productos de dulcería.</p>';
      });
    // Cargar combos/promociones
    fetch("/api/combos")
      .then((response) => {
        if (!response.ok) throw new Error("Error al cargar combos");
        return response.json();
      })
      .then((items) => {
        combosList.innerHTML = "";
        if (items.length === 0) {
          combosList.innerHTML = '<p>No hay combos disponibles.</p>';
          return;
        }
        items.forEach((item) => {
          const itemCard = document.createElement("div");
          itemCard.classList.add("combo-card");
          itemCard.innerHTML = `
            <div class="movie-image-container">
                <img src="${item.image}" alt="${item.name}" class="movie-image">
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${item.name}</h3>
                <p class="movie-description">${item.description}</p>
                <p class="price">S/.${parseFloat(item.price).toFixed(2)}</p>
            </div>
          `;
          combosList.appendChild(itemCard);
        });
      })
      .catch((error) => {
        combosList.innerHTML = '<p>Error al cargar combos.</p>';
      });
  }

  // --- Event Listeners for Main Content Navigation ---
  if (nowShowingButton && upcomingButton && dulceriaButton) {
    nowShowingButton.addEventListener("click", () => {
      activateButton(nowShowingButton, upcomingButton, dulceriaButton);
      if (movieSection) movieSection.style.display = "block";
      if (comboSection) comboSection.style.display = "none";
      if (dulceriaSection) dulceriaSection.style.display = "none";
      if (upcomingSection) upcomingSection.style.display = "none";
      if (document.getElementById("movie-list")) document.getElementById("movie-list").style.display = "grid";
      if (document.getElementById("upcoming-list")) document.getElementById("upcoming-list").style.display = "none";
      clearMovieList();
      if (typeof fetchMovies === "function") {
        fetchMovies();
      } else {
        console.warn("fetchMovies function is not defined.");
      }
    });

    upcomingButton.addEventListener("click", () => {
      activateButton(upcomingButton, nowShowingButton, dulceriaButton);
      if (movieSection) movieSection.style.display = "block";
      if (comboSection) comboSection.style.display = "none";
      if (dulceriaSection) dulceriaSection.style.display = "none";
      if (upcomingSection) upcomingSection.style.display = "block";
      if (document.getElementById("movie-list")) document.getElementById("movie-list").style.display = "none";
      if (document.getElementById("upcoming-list")) document.getElementById("upcoming-list").style.display = "grid";
      clearMovieList();
      fetch("/api/upcoming")
        .then((response) => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(`Error al cargar las películas próximas (${response.status}): ${text}`);
            });
          }
          return response.json();
        })
        .then((data) => {
          const upcomingListElement = document.getElementById("upcoming-list");
          if (!upcomingListElement) {
            return;
          }
          if (!data || data.length === 0) {
            upcomingListElement.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px; color: white;">No hay películas próximas disponibles en este momento.</p>';
          } else if (typeof displayMovies === "function") {
            displayMovies(data, 'upcoming-list');
          } else {
            upcomingListElement.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px; color: white;">Error al mostrar películas próximas (función de visualización no disponible).</p>';
          }
        })
        .catch((error) => {
          const upcomingListElement = document.getElementById("upcoming-list");
          if (upcomingListElement) {
            upcomingListElement.innerHTML = `<p style=\"text-align: center; width: 100%; padding: 20px; color: red;\">Error al cargar las películas próximas. ${error.message}. Intente más tarde.</p>`;
          }
        });
    });

    dulceriaButton.addEventListener("click", () => {
      activateButton(dulceriaButton, nowShowingButton, upcomingButton);
      if (movieSection) movieSection.style.display = "none";
      if (comboSection) comboSection.style.display = "none";
      if (dulceriaSection) dulceriaSection.style.display = "block";
      if (upcomingSection) upcomingSection.style.display = "none";
      loadDulceria();
    });
  } else {
    console.warn("Botones de navegación de contenido principal (Cartelera, Próximamente, Dulcería) no encontrados.");
  }

  // --- Lógica para manejar la sección activa desde la URL ---
  function handleSectionFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');

    if (section === 'upcoming' && upcomingButton) {
      upcomingButton.click();
    } else if (section === 'promotions' && promotionsButton) { // Este bloque puede eliminarse si "promotions" ya no se usa
      promotionsButton.click();
    } else if (section === 'dulceria' && dulceriaButton) { // Añadido para manejar la sección dulceria
      dulceriaButton.click();
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

  // Cambiar enlaces de combos.html a dulceria.html en la navegación principal y botones
  // Actualiza el botón o enlace de combos en la navegación para que apunte a /paginas/Reserva/dulceria.html
  // Si hay referencias en scripts.js, piePagina.js, cabecera.js, etc., actualízalas también
  // Ejemplo para scripts.js:
  // document.getElementById('dulceria-button').addEventListener('click', () => {
  //   window.location.href = '/paginas/Reserva/dulceria.html';
  // });
  if (dulceriaButton && dulceriaSection) {
    dulceriaButton.addEventListener("click", () => {
      activateButton(dulceriaButton, nowShowingButton, upcomingButton);
      if (movieSection) movieSection.style.display = "none";
      if (comboSection) comboSection.style.display = "none";
      if (dulceriaSection) dulceriaSection.style.display = "block";
      loadDulceria();
    });
  }

  function displayDulceria(items) {
    const dulceriaContainer = document.getElementById('dulceria-individual');
    dulceriaContainer.innerHTML = ''; // Limpiar contenido anterior

    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.classList.add('combo-card'); // Usar la misma clase que los combos para consistencia
        itemCard.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" />
            <div class="combo-info">
                <h3>${item.nombre}</h3>
                <p>${item.descripcion}</p>
                <p class="precio">Precio: S/. ${parseFloat(item.precio).toFixed(2)}</p>
                <button class="btn btn-primary add-to-cart-btn" data-id="${item.id_producto}" data-type="producto">Agregar al Carrito</button>
            </div>
        `;
        dulceriaContainer.appendChild(itemCard);
    });

    // Añadir event listeners a los nuevos botones "Agregar al Carrito"
    document.querySelectorAll('#dulceria-individual .add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.dataset.id;
            const itemType = event.target.dataset.type; // 'producto'
            // Necesitamos obtener los detalles del item para pasarlo a addToCart
            // Asumimos que 'items' (la respuesta de la API) está accesible aquí o podemos buscarlo
            const selectedItem = items.find(i => i.id_producto.toString() === itemId);
            if (selectedItem) {
                addToCart(selectedItem); // addToCart está definido en cart.js
            } else {
                console.error('Producto no encontrado para ID:', itemId);
            }
        });
    });
}

  function displayCombos(combos) {
    const combosContainer = document.getElementById('combos-container');
    combosContainer.innerHTML = ''; // Limpiar el contenedor

    combos.forEach(combo => {
        const comboCard = document.createElement('div');
        comboCard.classList.add('combo-card');
        comboCard.innerHTML = `
            <img src="${combo.imagen}" alt="${combo.nombre}" />
            <div class="combo-info">
                <h3>${combo.nombre}</h3>
                <p>${combo.descripcion}</p>
                <p class="precio">Precio: S/. ${parseFloat(combo.precio).toFixed(2)}</p>
                <button class="btn btn-primary add-to-cart-btn" data-id="${combo.id_combo}" data-type="combo">Agregar al Carrito</button>
            </div>
        `;
        combosContainer.appendChild(comboCard);
    });

    // Añadir event listeners a los nuevos botones "Agregar al Carrito" para combos
    document.querySelectorAll('#combos-container .add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.dataset.id;
            const itemType = event.target.dataset.type; // 'combo'
            // Necesitamos obtener los detalles del combo para pasarlo a addToCart
            const selectedCombo = combos.find(c => c.id_combo.toString() === itemId);
            if (selectedCombo) {
                addToCart(selectedCombo); // addToCart está definido en cart.js
            } else {
                console.error('Combo no encontrado para ID:', itemId);
            }
        });
    });
}
});