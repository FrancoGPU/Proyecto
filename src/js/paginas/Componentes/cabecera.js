document.addEventListener("DOMContentLoaded", () => {
  const cabeceraElement = document.querySelector("header.cine-cabecera"); // Target the specific header

  if (cabeceraElement) {
    fetch("/paginas/components/cabecera.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar el componente de cabecera");
        }
        return response.text();
      })
      .then((data) => {
        cabeceraElement.innerHTML = data;

        // --- Initialize Header Elements (after HTML is loaded) ---
        const searchToggle = cabeceraElement.querySelector("#search-toggle");
        const searchBarContainer = cabeceraElement.querySelector(
          ".search-bar-container"
        );
        const searchBar = cabeceraElement.querySelector("#search-bar");
        const searchSubmit = cabeceraElement.querySelector("#search-submit");

        const userButton = cabeceraElement.querySelector("#user-button");
        
        // Los iconos ya están definidos en el HTML como imágenes SVG
        // No necesitamos agregar iconos de Font Awesome
        
        const userDropdownMenu = cabeceraElement.querySelector(
          "#user-dropdown-menu"
        );

        const cartIcon = cabeceraElement.querySelector("#cartIcon");
        const cartItemCount = cabeceraElement.querySelector("#cartItemCount");
        const cartDropdown = cabeceraElement.querySelector("#cartDropdown");
        const checkoutButton = cabeceraElement.querySelector("#checkoutButton");
        const clearCartButton = cabeceraElement.querySelector("#clearCartButton");

        // --- Search Toggle Logic ---
        if (searchToggle && searchBarContainer) {
          searchToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            const isVisible = searchBarContainer.classList.contains("active");
            
            if (isVisible) {
              searchBarContainer.classList.remove("active");
              searchToggle.classList.remove("active");
            } else {
              searchBarContainer.classList.add("active");
              searchToggle.classList.add("active");
              if (searchBar) {
                setTimeout(() => searchBar.focus(), 100);
              }
            }
          });

          // Hide search bar when clicking outside
          window.addEventListener("click", (event) => {
            if (
              searchBarContainer.classList.contains("active") &&
              !searchBarContainer.contains(event.target) &&
              !searchToggle.contains(event.target)
            ) {
              searchBarContainer.classList.remove("active");
              searchToggle.classList.remove("active");
            }
          });

          // Hide search bar on escape key
          window.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && searchBarContainer.classList.contains("active")) {
              searchBarContainer.classList.remove("active");
              searchToggle.classList.remove("active");
            }
          });
        }

        // --- Search Bar Logic (Conditional Display) ---
        if (searchBarContainer && searchBar && searchSubmit) {
          // Show search bar only on prueba.html (or your main page)
          if (
            window.location.pathname.endsWith("/prueba.html") ||
            window.location.pathname === "/" ||
            window.location.pathname === "/index.html"
          ) {
            searchBarContainer.style.display = "flex"; // Or 'block' based on your CSS

            searchSubmit.addEventListener("click", performSearch);
            searchBar.addEventListener("keydown", (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                performSearch();
              }
            });
          }
        }

        function performSearch() {
          const query = searchBar.value.trim().toLowerCase();
          const movieList = document.getElementById("movie-list"); // Assuming this is the ID of the movie list container
          if (movieList) {
            const movies = Array.from(movieList.children);
            movies.forEach((movie) => {
              const titleElement =
                movie.querySelector("h3.movie-title") ||
                movie.querySelector("h3");
              const title = titleElement?.textContent.toLowerCase() || "";
              movie.style.display = title.includes(query) ? "flex" : "none"; // Assuming movie cards are flex items
            });
          }
        }

        // --- User Authentication and Menu Logic ---
        if (userButton && userDropdownMenu) {
          // Event listener removido - se maneja en user-menu.js
          // Solo inicializar el estado del menú
          checkLoginStatusAndUpdateUI();
        }

        async function checkLoginStatusAndUpdateUI() {
          if (!userButton || !userDropdownMenu) {
            console.warn(
              "Elementos del menú de usuario no encontrados en cabecera. No se actualizará el estado de login."
            );
            return;
          }
          try {
            const response = await fetch("/api/session/status");
            if (!response.ok) {
              console.error(
                "Error al obtener estado de sesión:",
                response.status
              );
              updateUserMenu(false);
              return;
            }
            const data = await response.json();
            updateUserMenu(data.loggedIn, data.user);
          } catch (error) {
            console.error(
              "Error en checkLoginStatusAndUpdateUI (cabecera):",
              error
            );
            updateUserMenu(false);
          }
        }

        function updateUserMenu(isLoggedIn, userData = null) {
          if (!userDropdownMenu) return;
          userDropdownMenu.innerHTML = ""; // Clear previous options

          if (isLoggedIn && userData) {
            // Agregar clase visual al botón si es necesario
            userButton.classList.add("logged-in");
            
            // Crear header del usuario con el nuevo diseño
            const userInfo = document.createElement("div");
            userInfo.classList.add("dropdown-user-info");
            
            const userName = document.createElement("div");
            userName.classList.add("user-display-name");
            userName.textContent = userData.username || userData.email;
            
            const userRole = document.createElement("div");
            userRole.classList.add("user-role");
            userRole.textContent = userData.role === "admin" ? "ADMINISTRADOR" : "USUARIO";
            
            userInfo.appendChild(userName);
            userInfo.appendChild(userRole);
            userDropdownMenu.appendChild(userInfo);

            // Enlace al perfil
            const profileLink = document.createElement("a");
            profileLink.href = "/paginas/Usuario/perfil.html";
            profileLink.innerHTML = `<i class="fas fa-user"></i><span>Mi Perfil</span>`;
            userDropdownMenu.appendChild(profileLink);

            // Enlace al historial de compras
            const historyLink = document.createElement("a");
            historyLink.href = "/paginas/Usuario/historial-compras.html";
            historyLink.innerHTML = `<i class="fas fa-history"></i><span>Mi Historial de Compras</span>`;
            userDropdownMenu.appendChild(historyLink);

            if (userData.role === "admin") {
              const adminPanelLink = document.createElement("a");
              adminPanelLink.href = "/paginas/Administracion/admin.html";
              adminPanelLink.innerHTML = `<i class="fas fa-crown"></i><span>Panel Admin</span>`;
              userDropdownMenu.appendChild(adminPanelLink);
            }

            const logoutLink = document.createElement("a");
            logoutLink.href = "#";
            logoutLink.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>Cerrar Sesión</span>`;
            logoutLink.addEventListener("click", async (e) => {
              e.preventDefault();
              userDropdownMenu.classList.remove("active");
              try {
                const logoutResponse = await fetch("/api/logout", {
                  method: "POST",
                });
                if (logoutResponse.ok) {
                  checkLoginStatusAndUpdateUI();
                } else {
                  const errorData = await logoutResponse.json();
                  alert(
                    `Error al cerrar sesión: ${
                      errorData.message || "Error desconocido"
                    }`
                  );
                }
              } catch (err) {
                console.error(
                  "Error en la solicitud de logout (cabecera):",
                  err
                );
                alert("Error al intentar cerrar sesión.");
              }
            });
            userDropdownMenu.appendChild(logoutLink);
          } else {
            // Remover clase visual del botón si es necesario
            userButton.classList.remove("logged-in");
            const loginLink = document.createElement("a");
            loginLink.href = "/paginas/Autenticacion/login.html";
            loginLink.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Iniciar Sesión</span>`;
            userDropdownMenu.appendChild(loginLink);

            const registerLink = document.createElement("a");
            registerLink.href = "/paginas/Autenticacion/registro.html";
            registerLink.innerHTML = `<i class="fas fa-user-plus"></i><span>Registrarse</span>`;
            userDropdownMenu.appendChild(registerLink);
          }

          // Re-assign listeners for closing menu on link click
          userDropdownMenu.querySelectorAll("a").forEach((link) => {
            if (!link.textContent.includes("Cerrar Sesión")) {
              link.addEventListener("click", () => {
                userDropdownMenu.classList.remove("active");
              });
            }
          });
        }

        // --- Cart Logic (Mejorado para desplegar recuadro flotante) ---
        if (cartIcon && cartItemCount && cartDropdown) {
          // Cart icon click handled by cart.js instead
          // if (userDropdownMenu && userDropdownMenu.style.display === "block") {
          //   userDropdownMenu.style.display = "none";
          // }

          // Cerrar el dropdown al hacer clic fuera
          window.addEventListener("click", (event) => {
            if (
              cartDropdown.classList.contains("active") &&
              !cartIcon.contains(event.target) &&
              !cartDropdown.contains(event.target)
            ) {
              cartDropdown.classList.remove("active");
            }
          });

          // Cerrar con Escape
          window.addEventListener("keydown", (event) => {
            if (
              event.key === "Escape" &&
              cartDropdown.classList.contains("active")
            ) {
              cartDropdown.classList.remove("active");
            }
          });

          // Renderizar el carrito al cargar la cabecera (forzar tras carga de cart.js)
          setTimeout(() => {
            if (typeof window.renderCartItems === 'function') {
              window.renderCartItems();
            }
            // Escuchar clicks en botones de agregar combo/dulcería para actualizar el carrito en tiempo real
            document.body.addEventListener('click', (e) => {
              if (
                e.target.matches('.select-combo, .add-dulceria') ||
                (e.target.closest && (e.target.closest('.select-combo') || e.target.closest('.add-dulceria')))
              ) {
                if (typeof window.renderCartItems === 'function') {
                  setTimeout(() => window.renderCartItems(), 50);
                }
              }
            });
          }, 100);
        }
      })
      .catch((error) =>
        console.error("Error al procesar componente de cabecera:", error)
      );
  } else {
    console.warn(
      "Elemento <header class='cine-cabecera'> no encontrado. El script de cabecera dinámica no se ejecutará."
    );
  }
});
