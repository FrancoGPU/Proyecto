// Cerrar el modal
const closeModal = document.getElementById("close-modal");
if (closeModal) {
  closeModal.addEventListener("click", () => {
    const modal = document.getElementById("promotions-modal");
    if (modal) {
      modal.style.display = "none";
    }
  });
}