document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            // 1. Referencias al botón y feedback visual
            const btn = this.querySelector('.submit-btn');
            const btnText = btn.querySelector('span');
            const originalText = btnText.innerText;

            btn.disabled = true;
            btnText.innerText = 'Enviando...';

            // 2. Captura de datos directamente desde los atributos 'name' del HTML
            // Asegúrate que en tu plantilla de EmailJS uses: {{nombre}}, {{email}}, {{asunto}}, {{mensaje}}
            const templateParams = {
                nombre: this.nombre.value,
                email: this.email.value,
                asunto: this.asunto.value,
                mensaje: this.mensaje.value
            };

            // 3. IDs de tu cuenta Makro SPA (Ya verificados)
            const SERVICE_ID = 'service_skk8kaa';
            const TEMPLATE_ID = 'template_n5utbcf'; // <--- REEMPLAZA ESTO
            const PUBLIC_KEY = 'h3oIE9KDa7Ujtsnw_';

            try {
                // Enviamos los datos
                const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

                if (response.status === 200) {
                    alert('¡Mensaje enviado con éxito! Te contactaremos a la brevedad.');
                    this.reset(); // Limpia el formulario
                }
            } catch (error) {
                console.error('Error detallado de EmailJS:', error);
                const errorMsg = error.text || "No se pudo conectar con el servidor.";
                alert('Hubo un error al enviar el mensaje: ' + errorMsg);
            } finally {
                // Restauramos el botón
                btn.disabled = false;
                btnText.innerText = originalText;
            }
        });
    }
});}
});
