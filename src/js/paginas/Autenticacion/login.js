document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // Enviar credenciales al servidor
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Guardar estado de inicio de sesión en localStorage
        localStorage.setItem("isLoggedIn", "true");
        alert(data.message); // Mensaje del servidor
        window.location.href = "/paginas/prueba.html"; // Redirigir al inicio
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al iniciar sesión.");
      }
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      alert("Error al conectar con el servidor.");
    }
  });
});
