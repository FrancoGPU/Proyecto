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