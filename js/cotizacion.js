document.addEventListener('DOMContentLoaded', () => {
    renderizarResumenCotizacion();
});

function renderizarResumenCotizacion() {
    // 1. Obtener los datos del localStorage (el carrito de Shopify)
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('lista-cotizacion-items');
    const totalLabel = document.getElementById('total-ref-cot');
    
    let html = '';
    let totalAcumulado = 0;

    // 2. Verificar si hay productos
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="item-cot" style="justify-content: center; color: #999;">
                <p>No hay productos seleccionados para cotizar.</p>
            </div>`;
        totalLabel.innerText = '$0';
        
        // Opcional: Redirigir al carrito tras 3 segundos si está vacío
        setTimeout(() => { window.location.href = 'carrito.html'; }, 3000);
        return;
    }

    // 3. Recorrer el carrito y construir las filas
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        totalAcumulado += subtotal;

        html += `
            <div class="item-cot">
                <div class="item-info">
                    <span class="item-nombre"><strong>${item.title}</strong></span>
                    <br>
                    <small class="item-cantidad">Cant: ${item.quantity} x $${item.price.toLocaleString('es-CL')}</small>
                </div>
                <div class="item-subtotal">
                    <strong>$${subtotal.toLocaleString('es-CL')}</strong>
                </div>
            </div>
        `;
    });

    // 4. Inyectar el HTML y el Total
    container.innerHTML = html;
    totalLabel.innerText = `$${totalAcumulado.toLocaleString('es-CL')}`;
}
