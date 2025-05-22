document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.register-form');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim(); // Obtener username
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username) { // Validación simple en frontend
            alert('Por favor, ingresa un nombre de usuario.');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }), // Enviar username
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                window.location.href = 'login.html'; // Redirigir al inicio de sesión
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            alert('Ocurrió un error al registrar el usuario.');
        }
    });
});