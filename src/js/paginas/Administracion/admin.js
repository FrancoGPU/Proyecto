document.addEventListener("DOMContentLoaded", async () => {
  const adminMessage = document.getElementById("admin-message");
  const adminMainContent = document.getElementById("admin-main-content");

  // Elementos para gestión de películas
  const moviesManagementSection = document.getElementById("movies-management");
  const moviesTableBody = document.getElementById("movies-table-body");
  const addMovieBtn = document.getElementById("add-movie-btn");
  const movieModal = document.getElementById("movie-modal");
  const movieModalTitle = document.getElementById("movie-modal-title");
  const closeMovieModalBtn = document.getElementById("close-movie-modal");
  const movieForm = document.getElementById("movie-form");
  const cancelMovieFormBtn = document.getElementById("cancel-movie-form");

  let currentEditingMovieId = null;

  // Elementos para gestión de combos
  const combosManagementSection = document.getElementById("combos-management");
  const combosTableBody = document.getElementById("combos-table-body");
  const addComboBtn = document.getElementById("add-combo-btn");
  const comboModal = document.getElementById("combo-modal");
  const comboModalTitle = document.getElementById("combo-modal-title");
  const closeComboModalBtn = document.getElementById("close-combo-modal");
  const comboForm = document.getElementById("combo-form");
  const cancelComboFormBtn = document.getElementById("cancel-combo-form");

  let currentEditingComboId = null;

  // Elementos para gestión de usuarios
  const usersManagementSection = document.getElementById("users-management");
  const usersTableBody = document.getElementById("users-table-body");
  const userRoleModal = document.getElementById("user-role-modal");
  const userRoleModalTitle = document.getElementById("user-role-modal-title"); // Aunque no se usa para cambiar título, es bueno tenerlo
  const closeUserRoleModalBtn = document.getElementById(
    "close-user-role-modal"
  );
  const userRoleForm = document.getElementById("user-role-form");
  const cancelUserRoleFormBtn = document.getElementById(
    "cancel-user-role-form"
  );
  const userRoleUsernameDisplay = document.getElementById("user-role-username");
  const userRoleSelect = document.getElementById("user-role-select");
  let currentEditingUserIdForRole = null;
  let currentSessionUserId = null; // Para evitar que el admin se quite su propio rol accidentalmente

  // Verificar si el usuario es administrador
  if (!adminMessage || !adminMainContent) {
    console.error("Elementos base de admin no encontrados.");
    return;
  }

  try {
    const response = await fetch("/api/session/status");
    if (!response.ok)
      throw new Error(`Error al verificar sesión: ${response.status}`);
    const sessionData = await response.json();

    if (
      sessionData.loggedIn &&
      sessionData.user &&
      sessionData.user.role === "admin"
    ) {
      adminMessage.style.display = "none";
      adminMainContent.style.display = "block";
      currentSessionUserId = sessionData.user.id; // Guardar el ID del admin actual
      console.log("Acceso de administrador concedido.");
      loadAdminMovies(); // Cargar películas al iniciar
      loadAdminCombos(); // Cargar combos al iniciar
      loadAdminUsers(); // Cargar usuarios al iniciar
      // loadAdminDulceria(); // Cargar dulcería al iniciar (ELIMINADO DE AQUÍ)
    } else {
      adminMessage.innerHTML =
        '<p style="color: red;">Acceso denegado. Solo los administradores pueden ver esta página. Serás redirigido.</p>';
      setTimeout(() => {
        window.location.href = "/paginas/Autenticacion/login.html";
      }, 3000);
    }
  } catch (error) {
    console.error("Error al verificar el acceso de administrador:", error);
    adminMessage.innerHTML =
      '<p style="color: red;">Error al verificar permisos. Inténtalo más tarde.</p>';
    setTimeout(() => {
      window.location.href = "/paginas/prueba.html";
    }, 3000);
  }

  // --- Gestión de Películas ---
  async function loadAdminMovies() {
    if (!moviesTableBody) {
      console.warn(
        "Elemento moviesTableBody no encontrado. Saltando carga de películas."
      );
      return;
    }
    try {
      const response = await fetch("/api/admin/movies");
      if (!response.ok) throw new Error("Error al cargar películas");
      const movies = await response.json();

      moviesTableBody.innerHTML = ""; // Limpiar tabla
      movies.forEach((movie) => {
        const row = moviesTableBody.insertRow();
        // Updated columns to display: ID, Título, Género, Estreno
        row.innerHTML = `
                    <td>${movie.id}</td>
                    <td>${movie.title || "N/A"}</td>
                    <td>${movie.genre || "N/A"}</td>
                    <td>${
                      movie.release_date
                        ? new Date(movie.release_date).toLocaleDateString()
                        : "N/A"
                    }</td>
                    <td class="actions-cell">
                        <button class="btn-edit" data-id="${
                          movie.id
                        }" data-type="movie">Editar</button>
                        <button class="btn-delete" data-id="${
                          movie.id
                        }" data-type="movie">Eliminar</button>
                    </td>
                `;
      });
    } catch (error) {
      console.error("Error cargando películas para admin:", error);
      // Asegúrate de que el colspan coincida con el nuevo número de columnas visibles (ID, Título, Género, Estreno + Acciones = 5)
      moviesTableBody.innerHTML =
        '<tr><td colspan="5">Error al cargar películas.</td></tr>';
    }
  }

  function openMovieModal(movie = null) {
    if (!movieModal || !movieForm || !movieModalTitle) return;
    movieForm.reset();
    if (movie) {
      currentEditingMovieId = movie.id;
      movieModalTitle.textContent = "Editar Película";
      document.getElementById("movie-id").value = movie.id;
      document.getElementById("movie-title").value = movie.title || "";
      document.getElementById("movie-description").value =
        movie.description || ""; // Matches schema
      document.getElementById("movie-image").value = movie.image || ""; // Changed from image_url to image, matches schema
      document.getElementById("movie-release_date").value = movie.release_date
        ? movie.release_date.split("T")[0]
        : "";
      document.getElementById("movie-genre").value = movie.genre || ""; // Matches schema
      // Populate showtimes (assuming input with id="movie-showtimes")
      // Showtimes is an array in DB, display as comma-separated string
      document.getElementById("movie-showtimes").value = movie.showtimes
        ? movie.showtimes.join(", ")
        : "";
    } else {
      currentEditingMovieId = null;
      movieModalTitle.textContent = "Añadir Nueva Película";
      // Ensure all fields, including new ones like showtimes, are cleared for a new movie
      document.getElementById("movie-description").value = "";
      document.getElementById("movie-image").value = "";
      document.getElementById("movie-genre").value = "";
      document.getElementById("movie-showtimes").value = "";
    }
    movieModal.style.display = "block";
  }

  function closeMovieModal() {
    if (movieModal) movieModal.style.display = "none";
    currentEditingMovieId = null;
  }

  if (addMovieBtn) {
    addMovieBtn.addEventListener("click", () => openMovieModal());
  }
  if (closeMovieModalBtn) {
    closeMovieModalBtn.addEventListener("click", closeMovieModal);
  }
  if (cancelMovieFormBtn) {
    cancelMovieFormBtn.addEventListener("click", closeMovieModal);
  }
  if (movieModal) {
    window.addEventListener("click", (event) => {
      if (event.target === movieModal) {
        closeMovieModal();
      }
    });
  }

  if (movieForm) {
    movieForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(movieForm);
      const movieData = Object.fromEntries(formData.entries()); // Esto ahora creará movieData.image

      if (!movieData.release_date) delete movieData.release_date;

      if (movieData.showtimes && typeof movieData.showtimes === "string") {
        movieData.showtimes = movieData.showtimes
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      } else if (!movieData.showtimes || movieData.showtimes === "") {
        // Handle empty or non-existent input
        movieData.showtimes = []; // Send empty array if no showtimes
      }

      const method = currentEditingMovieId ? "PUT" : "POST";
      const url = currentEditingMovieId
        ? `/api/admin/movies/${currentEditingMovieId}`
        : "/api/admin/movies";

      try {
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(movieData), // movieData now aligns with the new schema
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error al guardar película`);
        }
        alert(
          `Película ${
            currentEditingMovieId ? "actualizada" : "añadida"
          } exitosamente.`
        );
        closeMovieModal();
        loadAdminMovies();
      } catch (error) {
        console.error("Error guardando película:", error);
        alert(`Error al guardar película: ${error.message}`);
      }
    });
  }

  if (moviesTableBody) {
    moviesTableBody.addEventListener("click", async (event) => {
      const target = event.target;
      const movieId = target.dataset.id;
      const type = target.dataset.type;

      if (type === "movie") {
        // Asegurarse que es para películas
        if (target.classList.contains("btn-edit") && movieId) {
          try {
            const response = await fetch(`/api/admin/movies/${movieId}`);
            if (!response.ok)
              throw new Error("No se pudo obtener la película para editar.");
            const movie = await response.json();
            openMovieModal(movie);
          } catch (error) {
            console.error("Error al obtener película para editar:", error);
            alert(error.message);
          }
        } else if (target.classList.contains("btn-delete") && movieId) {
          if (confirm("¿Estás seguro de que quieres eliminar esta película?")) {
            try {
              const response = await fetch(`/api/admin/movies/${movieId}`, {
                method: "DELETE",
              });
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                  errorData.message || "Error al eliminar la película."
                );
              }
              alert("Película eliminada exitosamente.");
              loadAdminMovies();
            } catch (error) {
              console.error("Error eliminando película:", error);
              alert(`Error al eliminar película: ${error.message}`);
            }
          }
        }
      }
    });
  }

  // --- Gestión de Combos ---
  async function loadAdminCombos() {
    if (!combosTableBody) {
      console.warn(
        "Elemento combosTableBody no encontrado. Saltando carga de combos."
      );
      return;
    }
    try {
      const response = await fetch("/api/admin/combos");
      if (!response.ok) throw new Error("Error al cargar combos");
      const combos = await response.json();

      combosTableBody.innerHTML = "";
      combos.forEach((combo) => {
        const row = combosTableBody.insertRow();
        row.innerHTML = `
                    <td>${combo.id}</td>
                    <td>${combo.name}</td>
                    <td>${parseFloat(combo.price).toFixed(2)}</td>
                    <td class="actions-cell">
                        <button class="btn-edit" data-id="${
                          combo.id
                        }" data-type="combo">Editar</button>
                        <button class="btn-delete" data-id="${
                          combo.id
                        }" data-type="combo">Eliminar</button>
                    </td>
                `;
      });
    } catch (error) {
      console.error("Error cargando combos para admin:", error);
      combosTableBody.innerHTML =
        '<tr><td colspan="4">Error al cargar combos.</td></tr>';
    }
  }

  function openComboModal(combo = null) {
    if (!comboModal || !comboForm || !comboModalTitle) return;
    comboForm.reset();
    if (combo) {
      currentEditingComboId = combo.id;
      comboModalTitle.textContent = "Editar Combo";
      document.getElementById("combo-id").value = combo.id;
      document.getElementById("combo-name").value = combo.name || "";
      document.getElementById("combo-description").value =
        combo.description || "";
      document.getElementById("combo-price").value = combo.price || "";
      document.getElementById("combo-image").value = combo.image || ""; // CAMBIADO: 'combo-image' y combo.image
    } else {
      currentEditingComboId = null;
      comboModalTitle.textContent = "Añadir Nuevo Combo";
      // Asegúrate de que el campo de imagen también se limpie si no se resetea bien con form.reset() para este caso
      document.getElementById("combo-image").value = ""; // CAMBIADO: 'combo-image'
    }
    comboModal.style.display = "block";
  }

  function closeComboModal() {
    if (comboModal) comboModal.style.display = "none";
    currentEditingComboId = null;
  }

  if (addComboBtn) {
    addComboBtn.addEventListener("click", () => openComboModal());
  }
  if (closeComboModalBtn) {
    // Asegúrate que el ID del botón de cerrar sea único o usa una clase
    closeComboModalBtn.addEventListener("click", closeComboModal);
  }
  if (cancelComboFormBtn) {
    // Asegúrate que el ID del botón de cancelar sea único o usa una clase
    cancelComboFormBtn.addEventListener("click", closeComboModal);
  }
  if (comboModal) {
    window.addEventListener("click", (event) => {
      if (event.target === comboModal) {
        closeComboModal();
      }
    });
  }

  if (comboForm) {
    comboForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(comboForm);
      const comboData = Object.fromEntries(formData.entries()); // Esto ahora creará comboData.image

      if (comboData.price) comboData.price = parseFloat(comboData.price);
      else delete comboData.price;

      // Si el campo de imagen está vacío, podrías querer enviar null o un string vacío.
      // FormData lo tratará como un string vacío si el input está vacío.
      // Si tu columna 'image' en la BD permite NULL y prefieres NULL en lugar de string vacío:
      if (comboData.image === "") {
        // delete comboData.image; // Para que no se envíe y el backend lo trate como undefined, que podría ser NULL
        // O explícitamente:
        // comboData.image = null; // Si el backend está preparado para manejar null
      }

      const method = currentEditingComboId ? "PUT" : "POST";
      const url = currentEditingComboId
        ? `/api/admin/combos/${currentEditingComboId}`
        : "/api/admin/combos";

      try {
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(comboData), // comboData ahora tendrá la propiedad 'image'
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error al guardar combo`);
        }
        alert(
          `Combo ${
            currentEditingComboId ? "actualizado" : "añadido"
          } exitosamente.`
        );
        closeComboModal();
        loadAdminCombos();
      } catch (error) {
        console.error("Error guardando combo:", error);
        alert(`Error al guardar combo: ${error.message}`);
      }
    });
  }

  if (combosTableBody) {
    combosTableBody.addEventListener("click", async (event) => {
      const target = event.target;
      const comboId = target.dataset.id;
      const type = target.dataset.type;

      if (type === "combo") {
        if (target.classList.contains("btn-edit") && comboId) {
          try {
            const response = await fetch(`/api/admin/combos/${comboId}`);
            if (!response.ok)
              throw new Error("No se pudo obtener el combo para editar.");
            const combo = await response.json();
            openComboModal(combo);
          } catch (error) {
            console.error("Error al obtener combo para editar:", error);
            alert(error.message);
          }
        } else if (target.classList.contains("btn-delete") && comboId) {
          if (confirm("¿Estás seguro de que quieres eliminar este combo?")) {
            try {
              const response = await fetch(`/api/admin/combos/${comboId}`, {
                method: "DELETE",
              });
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                  errorData.message || "Error al eliminar el combo."
                );
              }
              alert("Combo eliminado exitosamente.");
              loadAdminCombos();
            } catch (error) {
              console.error("Error eliminando combo:", error);
              alert(`Error al eliminar combo: ${error.message}`);
            }
          }
        }
      }
    });
  }
  // --- Fin Gestión de Combos ---

  // --- Gestión de Dulcería ---
  const dulceriaTableBody = document.getElementById("dulceria-table-body");
  const addDulceriaBtn = document.getElementById("add-dulceria-btn");
  const dulceriaModal = document.getElementById("dulceria-modal");
  const dulceriaModalTitle = document.getElementById("dulceria-modal-title");
  const closeDulceriaModalBtn = document.getElementById("close-dulceria-modal");
  const dulceriaForm = document.getElementById("dulceria-form");
  const cancelDulceriaFormBtn = document.getElementById("cancel-dulceria-form");
  let currentEditingDulceriaId = null;

  async function loadAdminDulceria() {
    if (!dulceriaTableBody) return;
    try {
      const response = await fetch("/api/admin/dulceria");
      if (!response.ok) throw new Error("Error al cargar dulcería");
      const productos = await response.json();
      dulceriaTableBody.innerHTML = "";
      productos.forEach((prod) => {
        const row = dulceriaTableBody.insertRow();
        row.innerHTML = `
          <td>${prod.id}</td>
          <td>${prod.nombre}</td>
          <td>${prod.descripcion}</td>
          <td>${parseFloat(prod.precio).toFixed(2)}</td>
          <td><img src="${prod.imagen || ''}" alt="img" style="max-width:60px;max-height:40px;"></td>
          <td class="actions-cell">
            <button class="btn-edit" data-id="${prod.id}" data-type="dulceria">Editar</button>
            <button class="btn-delete" data-id="${prod.id}" data-type="dulceria">Eliminar</button>
          </td>
        `;
      });
    } catch (error) {
      console.error("Error cargando dulcería para admin:", error);
      dulceriaTableBody.innerHTML = '<tr><td colspan="6">Error al cargar dulcería.</td></tr>';
    }
  }

  function openDulceriaModal(prod = null) {
    if (!dulceriaModal || !dulceriaForm || !dulceriaModalTitle) return;
    dulceriaForm.reset();
    if (prod) {
      currentEditingDulceriaId = prod.id;
      dulceriaModalTitle.textContent = "Editar Producto de Dulcería";
      document.getElementById("dulceria-id").value = prod.id;
      document.getElementById("dulceria-nombre").value = prod.nombre || "";
      document.getElementById("dulceria-descripcion").value = prod.descripcion || "";
      document.getElementById("dulceria-precio").value = prod.precio || "";
      document.getElementById("dulceria-imagen").value = prod.imagen || "";
    } else {
      currentEditingDulceriaId = null;
      dulceriaModalTitle.textContent = "Añadir Producto de Dulcería";
    }
    dulceriaModal.style.display = "block";
  }

  function closeDulceriaModal() {
    if (dulceriaModal) dulceriaModal.style.display = "none";
    currentEditingDulceriaId = null;
  }

  if (addDulceriaBtn) addDulceriaBtn.addEventListener("click", () => openDulceriaModal());
  if (closeDulceriaModalBtn) closeDulceriaModalBtn.addEventListener("click", closeDulceriaModal);
  if (cancelDulceriaFormBtn) cancelDulceriaFormBtn.addEventListener("click", closeDulceriaModal);
  if (dulceriaModal) {
    window.addEventListener("click", (event) => {
      if (event.target === dulceriaModal) closeDulceriaModal();
    });
  }

  if (dulceriaForm) {
    dulceriaForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(dulceriaForm);
      const prodData = Object.fromEntries(formData.entries());
      if (prodData.precio) prodData.precio = parseFloat(prodData.precio);
      else delete prodData.precio;
      const method = currentEditingDulceriaId ? "PUT" : "POST";
      const url = currentEditingDulceriaId
        ? `/api/admin/dulceria/${currentEditingDulceriaId}`
        : "/api/admin/dulceria";
      try {
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prodData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error al guardar producto de dulcería`);
        }
        alert(`Producto de dulcería ${currentEditingDulceriaId ? "actualizado" : "añadido"} exitosamente.`);
        closeDulceriaModal();
        loadAdminDulceria();
      } catch (error) {
        console.error("Error guardando producto de dulcería:", error);
        alert(`Error al guardar producto de dulcería: ${error.message}`);
      }
    });
  }

  if (dulceriaTableBody) {
    dulceriaTableBody.addEventListener("click", async (event) => {
      const target = event.target;
      const prodId = target.dataset.id;
      const type = target.dataset.type;
      if (type === "dulceria") {
        if (target.classList.contains("btn-edit") && prodId) {
          try {
            const response = await fetch(`/api/admin/dulceria/${prodId}`);
            if (!response.ok) throw new Error("No se pudo obtener el producto de dulcería para editar.");
            const prod = await response.json();
            openDulceriaModal(prod);
          } catch (error) {
            console.error("Error al obtener producto de dulcería para editar:", error);
            alert(error.message);
          }
        } else if (target.classList.contains("btn-delete") && prodId) {
          if (confirm("¿Estás seguro de que quieres eliminar este producto de dulcería?")) {
            try {
              const response = await fetch(`/api/admin/dulceria/${prodId}`, { method: "DELETE" });
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al eliminar el producto de dulcería.");
              }
              alert("Producto de dulcería eliminado exitosamente.");
              loadAdminDulceria();
            } catch (error) {
              console.error("Error eliminando producto de dulcería:", error);
              alert(`Error al eliminar producto de dulcería: ${error.message}`);
            }
          }
        }
      }
    });
  }

  // Llamar a la carga inicial de dulcería
  loadAdminDulceria();

  // --- Gestión de Usuarios ---
  async function loadAdminUsers() {
    if (!usersTableBody) {
      console.warn(
        "Elemento usersTableBody no encontrado. Saltando carga de usuarios."
      );
      return;
    }
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Error al cargar usuarios");
      const users = await response.json();

      usersTableBody.innerHTML = "";
      users.forEach((user) => {
        const row = usersTableBody.insertRow();
        row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username || "N/A"}</td>
                    <td>${user.email || "N/A"}</td>
                    <td>${user.role || "N/A"}</td>
                    <td class="actions-cell">
                        <button class="btn-edit-role" data-id="${
                          user.id
                        }" data-username="${user.username}" data-role="${
          user.role
        }" ${
          user.id === currentSessionUserId
            ? 'disabled title="No puedes cambiar tu propio rol"'
            : ""
        }>Cambiar Rol</button>
                    </td>
                `;
      });
    } catch (error) {
      console.error("Error cargando usuarios para admin:", error);
      usersTableBody.innerHTML =
        '<tr><td colspan="5">Error al cargar usuarios.</td></tr>';
    }
  }

  function openUserRoleModal(user) {
    if (
      !userRoleModal ||
      !userRoleForm ||
      !userRoleUsernameDisplay ||
      !userRoleSelect
    )
      return;
    userRoleForm.reset();
    currentEditingUserIdForRole = user.id;
    document.getElementById("user-id-role").value = user.id;
    userRoleUsernameDisplay.textContent = user.username;
    userRoleSelect.value = user.role;
    userRoleModal.style.display = "block";
  }

  function closeUserRoleModal() {
    if (userRoleModal) userRoleModal.style.display = "none";
    currentEditingUserIdForRole = null;
  }

  if (closeUserRoleModalBtn) {
    closeUserRoleModalBtn.addEventListener("click", closeUserRoleModal);
  }
  if (cancelUserRoleFormBtn) {
    cancelUserRoleFormBtn.addEventListener("click", closeUserRoleModal);
  }
  if (userRoleModal) {
    window.addEventListener("click", (event) => {
      if (event.target === userRoleModal) {
        closeUserRoleModal();
      }
    });
  }

  if (userRoleForm) {
    userRoleForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentEditingUserIdForRole) return;

      const newRole = userRoleSelect.value;

      try {
        const response = await fetch(
          `/api/admin/users/${currentEditingUserIdForRole}/role`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Error al actualizar rol del usuario`
          );
        }
        alert(`Rol del usuario actualizado exitosamente.`);
        closeUserRoleModal();
        loadAdminUsers();
      } catch (error) {
        console.error("Error actualizando rol del usuario:", error);
        alert(`Error al actualizar rol: ${error.message}`);
      }
    });
  }

  if (usersTableBody) {
    usersTableBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("btn-edit-role")) {
        const userId = target.dataset.id;
        const username = target.dataset.username;
        const currentRole = target.dataset.role;
        if (userId && username && currentRole) {
          if (userId === String(currentSessionUserId)) {
            alert("No puedes cambiar tu propio rol desde esta interfaz.");
            return;
          }
          openUserRoleModal({
            id: userId,
            username: username,
            role: currentRole,
          });
        }
      }
    });
  }
  // --- Fin Gestión de Usuarios ---
});
