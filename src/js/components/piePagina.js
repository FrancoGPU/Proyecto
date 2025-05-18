document.addEventListener('DOMContentLoaded', function() {
    const footerElement = document.querySelector('footer');
    if (footerElement) {
        footerElement.classList.add('site-footer'); // Nueva clase principal para el footer
        footerElement.innerHTML = `
            <div class="footer-top-bar">
                <div class="footer-container">
                    <div class="footer-social-links">
                        <a href="https://facebook.com" target="_blank" class="social-link">
                            <i class="fab fa-facebook-f"></i> FACEBOOK <span class="social-username">GOCINE</span>
                        </a>
                        <a href="https://twitter.com" target="_blank" class="social-link">
                            <i class="fab fa-twitter"></i> TWITTER <span class="social-username">GOCINE_SOCIAL</span>
                        </a>
                        <a href="https://instagram.com" target="_blank" class="social-link">
                            <i class="fab fa-instagram"></i> INSTAGRAM <span class="social-username">GOCINEGRAM</span>
                        </a>
                        <a href="https://wa.me/51998164722" target="_blank" class="social-link">
                            <i class="fab fa-whatsapp"></i> WHATSAPP <span class="social-username">GOCINE CHAT</span>
                        </a>
                    </div>
                </div>
            </div>

            <div class="footer-main-content">
                <div class="footer-container">
                    <div class="footer-logo-area">
                        <!-- Puedes poner tu logo aquí, similar al h1 de la cabecera -->
                        <h1 class="logo footer-logo">
                           <span class="logo-go">GO</span><span class="logo-cine">CINE</span>
                        </h1>
                    </div>
                    <nav class="footer-links-section">
                        <div class="footer-column">
                            <h4>PROGRAMACIÓN</h4>
                            <ul>
                                <li><a href="/paginas/prueba.html?section=now-showing">Cartelera</a></li>
                                <li><a href="/paginas/prueba.html?section=upcoming">Próximamente</a></li>
                                <li><a href="/paginas/prueba.html?section=promotions">Promociones</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h4>SOBRE GOCINE</h4>
                            <ul>
                                <li><a href="https://utp-prd-upload-file-storage.s3.amazonaws.com/pao/content/34e2cb18-caf3-455f-a7c8-5ac8265fef7f/TerminosYCondiciones_HOXHXP.pdf" target="_blank">Términos y condiciones</a></li>
                                <li><a href="https://utp-prd-upload-file-storage.s3.amazonaws.com/pao/content/beec857c-7765-49b6-a393-f9003dda981a/POLITICAS_DE_PRIVACIDAD_1_CMAZIK.pdf" target="_blank">Política de Protección de Datos Personales</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h4>CONTACTO</h4>
                            <ul>
                                <li><a href="/paginas/contacto.html">Escríbenos</a></li>
                                <li><a href="/paginas/libro-reclamaciones.html"><i class="fas fa-book"></i> Libro de reclamaciones</a></li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </div>

            <div class="footer-bottom-bar">
                <div class="footer-container">
                    <p>Razón Social: GOCINE DEL PERÚ S.R.L. - RUC: 20429683581</p>
                    <p>&copy; ${new Date().getFullYear()} GOCINE. Todos los derechos reservados.</p>
                </div>
            </div>
        `;
    }
});