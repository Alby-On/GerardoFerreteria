// Inicializar EmailJS con tu Public Key
(function() {
    emailjs.init("TU_PUBLIC_KEY");
})();

document.addEventListener('DOMContentLoaded', () => {
    cargarResumenCotizacion();
});

function cargarResumenCotizacion() {
    const carrito = JSON.parse(localStorage.getItem('cart')) || [];
    const contenedor = document.getElementById('lista-cotizacion-items');
    const totalLabel = document.getElementById('total-ref-cot');
    let html = '';
    let total = 0;

    if (carrito.length === 0) {
        window.location.href = 'carrito.html'; // Si no hay nada, vuelve al carrito
        return;
    }

    carrito.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <div class="item-cot">
                <span>${item.title} (x${item.quantity})</span>
                <strong>$${subtotal.toLocaleString('es-CL')}</strong>
            </div>
        `;
    });

    contenedor.innerHTML = html;
    totalLabel.innerText = `$${total.toLocaleString('es-CL')}`;
}

document.getElementById('cotizacion-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const btn = document.getElementById('btn-enviar-cot');
    const carrito = JSON.parse(localStorage.getItem('cart')) || [];
    
    btn.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    // Formatear lista para el mail
    let listaTexto = carrito.map(i => `- ${i.title} (Cant: ${i.quantity})`).join('\n');

    const params = {
        nombre_cliente: document.getElementById('cot-nombre').value,
        rut_cliente: document.getElementById('cot-rut').value,
        email_cliente: document.getElementById('cot-email').value,
        telefono_cliente: document.getElementById('cot-telefono').value,
        mensaje: document.getElementById('cot-mensaje').value,
        lista_productos: listaTexto
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', params)
        .then(() => {
            alert('✅ Solicitud enviada. En Comercializadora Makro te contactaremos pronto.');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        }, (err) => {
            alert('Fallo el envío: ' + JSON.stringify(err));
            btn.disabled = false;
            btn.innerText = 'Enviar Solicitud';
        });
});
