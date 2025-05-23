document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".recover-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("recover-email").value.trim();

    try {
      const response = await fetch("/api/recuperar", {
        //Endpoint de la API para recuperar contraseña
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      alert(result.message);
      form.reset();
    } catch (err) {
      alert("Ocurrió un error. Intenta nuevamente.");
    }
  });
});
