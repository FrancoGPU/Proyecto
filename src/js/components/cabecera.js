document.addEventListener('DOMContentLoaded', () => {
    const cabeceraElement = document.querySelector('header');
    if (cabeceraElement) {
        fetch('../components/cabecera.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el componente de cabecera');
                }
                return response.text();
            })
            .then(data => {
                cabeceraElement.innerHTML = data;
            })
            .catch(error => console.error(error));
    }
})
