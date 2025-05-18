document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    // const GOCINE_EMAIL = '1gocine12@gmail.com'; // Ya no se usa directamente aquí

    // Reemplaza con tus IDs de EmailJS específicos para el formulario de CONTACTO
    // Es probable que uses el mismo SERVICE_ID y PUBLIC_KEY, pero un TEMPLATE_ID diferente
    const EMAILJS_CONTACT_SERVICE_ID = 'service_za53fbc'; // El mismo Service ID que usaste para reclamaciones
    const EMAILJS_CONTACT_TEMPLATE_ID = 'template_udns759'; // Un NUEVO Template ID para el correo de contacto
    const EMAILJS_CONTACT_PUBLIC_KEY = 'hRit0g6Z5CEJfg-wY'; // El mismo Public Key

    if (contactForm) {
        // Inicializar EmailJS con tu Public Key
        emailjs.init(EMAILJS_CONTACT_PUBLIC_KEY);

        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevenir el envío tradicional del formulario

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            // Obtener los valores del formulario
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessage').value;

            // Crear un objeto con los parámetros para la plantilla de EmailJS
            // Los nombres de las propiedades deben coincidir con las variables en tu plantilla de EmailJS para contacto
            const templateParams = {
                contactName: name,
                contactEmail: email,
                contactSubject: subject,
                contactMessage: message,
                submissionTime: new Date().toLocaleString() // Para la fecha y hora
            };

            emailjs.send(EMAILJS_CONTACT_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, templateParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('¡Mensaje enviado con éxito!\nGracias por contactarnos.');
                    contactForm.reset();
                }, function(error) {
                    console.log('FAILED...', error);
                    alert('Error al enviar el mensaje.\nPor favor, inténtalo de nuevo más tarde.\nDetalle del error: ' + JSON.stringify(error));
                })
                .finally(function() {
                    // Restaurar el botón
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                });
        });
    }
});