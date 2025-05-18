document.addEventListener('DOMContentLoaded', () => {
    const reclamacionesForm = document.getElementById('reclamacionesForm');
    //const GOCINE_EMAIL = '1gocine12@gmail.com'; // El mismo correo para la recepción

    const EMAILJS_SERVICE_ID = 'service_za53fbc';
    const EMAILJS_TEMPLATE_ID = 'template_rjvnci7';
    const EMAILJS_PUBLIC_KEY = 'hRit0g6Z5CEJfg-wY'; // Reemplaza con tu User ID de EmailJS

    if (reclamacionesForm) {
        // Inicializar EmailJS con tu Public Key
        emailjs.init(EMAILJS_PUBLIC_KEY);

        reclamacionesForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Cambia el texto del botón para indicar que se está procesando
            const submitButton = reclamacionesForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            const formData = new FormData(reclamacionesForm);

            // Crear un objeto con los parámetros para la plantilla de EmailJS
            // Los nombres de las propiedades DEBEN COINCIDIR con las variables en tu plantilla de EmailJS
            const templateParams = {
                recNombre: formData.get('recNombre'),
                recDocumento: formData.get('recDocumento'),
                recDomicilio: formData.get('recDomicilio'),
                recTelefono: formData.get('recTelefono'),
                recEmail: formData.get('recEmail'),
                recBienServicio: formData.get('recBienServicio'),
                recMonto: formData.get('recMonto') || 'No especificado',
                recDescripcionBien: formData.get('recDescripcionBien'),
                recTipo: formData.get('recTipo'),
                recDetalle: formData.get('recDetalle'),
                recPedido: formData.get('recPedido'),
                submissionTime: new Date().toLocaleString() // Asegúrate que tu plantilla use {{{submissionTime}}}
            };

            console.log('Enviando estos parámetros a EmailJS:', templateParams);

            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('¡Reclamación enviada con éxito!\nNos pondremos en contacto contigo pronto.');
                    reclamacionesForm.reset();
                }, function(error) {
                    console.log('FAILED...', error);
                    alert('Error al enviar la reclamación.\nPor favor, inténtalo de nuevo más tarde o contáctanos directamente.\nDetalle del error: ' + JSON.stringify(error));
                })
                .finally(function() {
                    // Restaurar el botón
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                });
        });
    }
});