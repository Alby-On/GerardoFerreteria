document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const btn = this.querySelector('.submit-btn');
            const originalText = btn.innerHTML;

            // Feedback visual
            btn.disabled = true;
            btn.innerHTML = '<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>';

            // IDs de tu cuenta (El Service ID y Public Key son los mismos)
            const SERVICE_ID = 'service_skk8kaa';
            const TEMPLATE_ID = 'template_n5utbcf';
            const PUBLIC_KEY = 'h3oIE9KDa7Ujtsnw_';

            // sendForm toma el ID del formulario y envía todos los campos automáticamente
            emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this, PUBLIC_KEY)
                .then(() => {
                    alert('¡Mensaje enviado con éxito! Te contactaremos pronto.');
                    contactForm.reset();
                }, (error) => {
                    console.error('FAILED...', error);
                    alert('Error al enviar el mensaje. Intenta nuevamente o contáctanos por WhatsApp.');
                })
                .finally(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                });
        });
    }
});
