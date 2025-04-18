// Verificar si el usuario ha iniciado sesión
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const promotionsButton = document.getElementById("promotions-button");

if (isLoggedIn && promotionsButton) {
    promotionsButton.style.display = "flex"; // Mostrar el botón de promociones
}
