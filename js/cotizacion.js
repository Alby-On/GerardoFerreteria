document.addEventListener('DOMContentLoaded', () => {
    renderizarResumenCotizacion();
});

function renderizarResumenCotizacion() {
    // 1. Intentamos leer 'cart' (asegúrate que sea el nombre correcto)
    const rawData = localStorage.getItem('cart');
    console.log("Datos crudos del storage:", rawData); // Esto lo verás en la consola (F12)

    if (!rawData) {
        document.getElementById('lista-cotizacion-items').innerHTML = "<p>El storage está vacío</p>";
        return;
    }

    const cart = JSON.parse(rawData);
    const container = document.getElementById('lista-cotizacion-items');
    const totalLabel = document.getElementById('total-ref-cot');
    
    let html = '';
    let totalAcumulado = 0;

    if (cart.length === 0) {
        container.innerHTML = "<p>Carrito vacío (array longitud 0)</p>";
        return;
    }

    cart.forEach((item, index) => {
        // DEBUG: Si los nombres de campos son diferentes, aquí fallará.
        // Verificamos si existen los datos
        const nombre = item.title || item.name || "Producto sin nombre";
        const precio = parseFloat(item.price) || 0;
        const cantidad = parseInt(item.quantity) || 0;
        const subtotal = precio * cantidad;
        
        totalAcumulado += subtotal;

        html += `
            <div class="item-cot" style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee;">
                <span>${nombre} (x${cantidad})</span>
                <strong>$${subtotal.toLocaleString('es-CL')}</strong>
            </div>
        `;
    });

    container.innerHTML = html;
    totalLabel.innerText = `$${totalAcumulado.toLocaleString('es-CL')}`;
}
