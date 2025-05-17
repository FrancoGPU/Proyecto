document.addEventListener("DOMContentLoaded", () => {
  console.log("scripts.js cargado correctamente");
  fetchMovies(); // Cargar las películas iniciales (cartelera)

   const promotionsButton = document.getElementById("promotions-button");
  const nowShowingButton = document.getElementById("now-showing-button");
  const upcomingButton = document.getElementById("upcoming-button");
  const comboSection = document.getElementById("combo-section");
  const movieSection = document.getElementById("movie-section");
  // const upcomingSection = document.getElementById("upcoming-section"); // Si la tienes
  const searchBar = document.getElementById("search-bar");
  const searchSubmit = document.getElementById("search-submit");
  
  const userButton = document.getElementById("user-button");
  const userIcon = userButton ? userButton.querySelector("i.fas.fa-user") : null; // Obtener el ícono
  const userDropdownMenu = document.getElementById("user-dropdown-menu");

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

  // --- Lógica de Autenticación y Menú de Usuario ---
  async function checkLoginStatusAndUpdateUI() {
    if (!userButton || !userDropdownMenu || !userIcon) {
        console.warn("Elementos del menú de usuario no encontrados. No se actualizará el estado de login.");
        return;
    }
    try {
      // Asume que tienes un endpoint que devuelve el estado de la sesión
      // Ejemplo de respuesta esperada: { loggedIn: true, user: { email: 'user@example.com', role: 'user' } }
      // o { loggedIn: false }
      const response = await fetch('/api/session/status'); // CAMBIA ESTE ENDPOINT SI ES NECESARIO
      if (!response.ok) {
        // Si el endpoint falla pero no es un 401/403 (no logueado), podría ser un error de servidor
        console.error('Error al obtener estado de sesión:', response.status);
        updateUserMenu(false); // Asumir no logueado si hay error
        return;
      }
      const data = await response.json();
      updateUserMenu(data.loggedIn, data.user);
    } catch (error) {
      console.error('Error en checkLoginStatusAndUpdateUI:', error);
      updateUserMenu(false); // Asumir no logueado si hay error de red
    }
  }

  function updateUserMenu(isLoggedIn, userData = null) {
    if (!userDropdownMenu || !userIcon) return;

    userDropdownMenu.innerHTML = ''; // Limpiar opciones previas

    if (isLoggedIn && userData) {
      userIcon.classList.add('logged-in'); // Clase para cambiar color del icono vía CSS

      // Opcional: Mostrar email del usuario
      const userEmailDisplay = document.createElement('div');
      userEmailDisplay.classList.add('dropdown-user-email'); // Necesitarás CSS para esta clase
      userEmailDisplay.textContent = userData.email; // Asume que userData tiene 'email'
      userDropdownMenu.appendChild(userEmailDisplay);
      
      // Opción de Panel de Administrador si el rol es 'admin'
      if (userData.role === 'admin') { // Asume que userData tiene 'role'
        const adminPanelLink = document.createElement('a');
        adminPanelLink.href = '/paginas/admin.html'; // TODO: Crear esta página de admin
        adminPanelLink.textContent = 'Panel Admin';
        userDropdownMenu.appendChild(adminPanelLink);
      }

      const logoutLink = document.createElement('a');
      logoutLink.href = '#'; // Evitar navegación, manejar con JS
      logoutLink.textContent = 'Cerrar Sesión';
      logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        userDropdownMenu.style.display = 'none'; // Ocultar menú inmediatamente
        try {
          // Asume que tienes un endpoint para logout
          const logoutResponse = await fetch('/api/logout', { method: 'POST' }); // CAMBIA ESTE ENDPOINT SI ES NECESARIO
          if (logoutResponse.ok) {
            // alert('Cierre de sesión exitoso.'); // Opcional
            checkLoginStatusAndUpdateUI(); // Actualizar UI después del logout
            // Opcional: Redirigir a la página principal o de login
            // window.location.href = '/paginas/prueba.html'; 
          } else {
            const errorData = await logoutResponse.json();
            alert(`Error al cerrar sesión: ${errorData.message || 'Error desconocido'}`);
          }
        } catch (err) {
          console.error('Error en la solicitud de logout:', err);
          alert('Error al intentar cerrar sesión.');
        }
      });
      userDropdownMenu.appendChild(logoutLink);

    } else {
      userIcon.classList.remove('logged-in');

      const loginLink = document.createElement('a');
      loginLink.href = '/paginas/login.html';
      loginLink.textContent = 'Iniciar Sesión';
      userDropdownMenu.appendChild(loginLink);

      const registerLink = document.createElement('a');
      registerLink.href = '/paginas/register.html';
      registerLink.textContent = 'Registrarse';
      userDropdownMenu.appendChild(registerLink);
    }

    // Re-asignar listeners para cerrar el menú al hacer clic en los nuevos enlaces (excepto logout)
    userDropdownMenu.querySelectorAll('a').forEach(link => {
        if (link.textContent !== 'Cerrar Sesión') { // El de logout ya maneja su cierre
            link.addEventListener('click', () => {
                userDropdownMenu.style.display = 'none';
            });
        }
    });
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
  if (userButton && userDropdownMenu) {
    userButton.addEventListener("click", (event) => {
      event.stopPropagation(); 
      const isVisible = userDropdownMenu.style.display === "block";
      userDropdownMenu.style.display = isVisible ? "none" : "block";
    });

    // Cerrar el menú si se hace clic en un enlace dentro de él
    userDropdownMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            userDropdownMenu.style.display = 'none';
        });
    });

    // Opcional: Cerrar el menú si se hace clic fuera de él
    window.addEventListener("click", (event) => {
      // Asegurarse que el clic no fue en el botón ni dentro del menú
      if (userDropdownMenu.style.display === "block" && 
          !userButton.contains(event.target) && 
          !userDropdownMenu.contains(event.target)) {
        userDropdownMenu.style.display = "none";
      }
    });

    // Opcional: Cerrar el menú si se presiona la tecla Escape
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && userDropdownMenu.style.display === 'block') {
            userDropdownMenu.style.display = 'none';
        }
    });
  }

  // Función para mostrar las películas
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

  // Llamar para verificar el estado de login al cargar la página
  checkLoginStatusAndUpdateUI();
});