document.addEventListener('DOMContentLoaded', () => {
    const piePaginaElement = document.querySelector('footer');
    if (piePaginaElement) {
        fetch('../components/piePagina.html') // Ruta relativa al archivo piePagina.html
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el componente de pie de página');
                }
                return response.text();
            })
            .then(data => {
                piePaginaElement.innerHTML = data;
            })
            .catch(error => console.error(error));
    }
});