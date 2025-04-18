document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Credenciales de usuario
        const userEmail = 'user@gocine.com';
        const userPassword = 'user';

        if (email === userEmail && password === userPassword) {
            // Guardar estado de inicio de sesión en localStorage
            localStorage.setItem('isLoggedIn', 'true');
            alert('Inicio de sesión exitoso.');
            window.location.href = '/paginas/prueba.html'; // Redirigir al inicio
        } else {
            alert('Credenciales incorrectas.');
        }
    });
});