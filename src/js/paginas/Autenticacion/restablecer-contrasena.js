document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-password-form');
  const messageElement = document.getElementById('message');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  // Obtener el token de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    messageElement.textContent = 'Token de restablecimiento no encontrado o inválido.';
    messageElement.style.color = 'red';
    form.style.display = 'none'; // Ocultar formulario si no hay token
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageElement.textContent = ''; // Limpiar mensajes previos

    const nuevaPassword = newPasswordInput.value;
    const confirmarPassword = confirmPasswordInput.value;

    if (nuevaPassword.length < 6) { // Ejemplo de validación simple
        messageElement.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        messageElement.style.color = 'red';
        return;
    }

    if (nuevaPassword !== confirmarPassword) {
      messageElement.textContent = 'Las contraseñas no coinciden.';
      messageElement.style.color = 'red';
      return;
    }

    try {
      const response = await fetch('/api/restablecer-contrasena', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, nuevaPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        messageElement.textContent = result.message + ' Serás redirigido al inicio de sesión en 5 segundos.';
        messageElement.style.color = 'green';
        form.reset();
        form.style.display = 'none';
        setTimeout(() => {
            window.location.href = 'login.html'; // Redirigir a la página de login
        }, 5000);
      } else {
        messageElement.textContent = result.message || 'Error al restablecer la contraseña.';
        messageElement.style.color = 'red';
      }
    } catch (err) {
      console.error('Error en el fetch:', err);
      messageElement.textContent = 'Ocurrió un error al conectar con el servidor. Intenta nuevamente.';
      messageElement.style.color = 'red';
    }
  });
});