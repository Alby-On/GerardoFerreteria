document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga inicial
    setTimeout(renderizarCotizacionDesdeShopify, 500);

    // 2. ESCUCHA ACTIVA: Si el carrito cambia o el respaldo local se actualiza
    window.addEventListener('storage', (event) => {
        if (event.key === 'shopify_cart_id' || event.key === 'respaldo_cotizacion') {
            renderizarCotizacionDesdeShopify();
        }
    });

    // 3. POLLING: Sincronización continua cada 2 segundos para reflejar cambios del sidebar
    setInterval(renderizarCotizacionDesdeShopify, 2000);
});

async function renderizarCotizacionDesdeShopify() {
    const cartId = localStorage.getItem('shopify_cart_id');
    const container = document.getElementById('lista-cotizacion-items');
    const totalLabel = document.getElementById('total-ref-cot');

    const respaldo = JSON.parse(localStorage.getItem('respaldo_cotizacion') || '{}');

    if (!cartId) {
        if (container) container.innerHTML = "<p>Tu lista de cotización está vacía.</p>";
        if (totalLabel) totalLabel.style.display = 'none';
        return;
    }

    const query = `{
      cart(id: "${cartId}") {
        lines(first: 20) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  product { title }
                }
              }
            }
          }
        }
      }
    }`;

    try {
        const response = await queryShopify(query);
        const cart = response.data?.cart;

        if (!cart || cart.lines.edges.length === 0) {
            container.innerHTML = "<p>No hay productos seleccionados.</p>";
            if (totalLabel) totalLabel.style.display = 'none';
            return;
        }

        let html = '';

        cart.lines.edges.forEach(item => {
            const prod = item.node.merchandise;
            const lineId = item.node.id;
            const qtyShopify = item.node.quantity;
            const qtyFinal = respaldo[lineId] || qtyShopify;

            html += `
                <div class="item-cot" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                    <div style="text-align: left; flex-grow: 1;">
                        <span style="display: block; font-weight: bold; color: #1e293b; font-size: 1rem;">${prod.product.title}</span>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                            <span style="color: #64748b; font-size: 0.9rem;">Cantidad:</span>
                            <div style="display: flex; align-items: center; background: #f1f5f9; border-radius: 6px; overflow: hidden;">
                                <button onclick="editarCantidadCotizacion(this, '${lineId}', -1)" style="padding: 4px 10px; border: none; background: none; cursor: pointer; font-weight: bold;">-</button>
                                <span style="padding: 0 8px; font-weight: 700; min-width: 20px; text-align: center;">${qtyFinal}</span>
                                <button onclick="editarCantidadCotizacion(this, '${lineId}', 1)" style="padding: 4px 10px; border: none; background: none; cursor: pointer; font-weight: bold;">+</button>
                            </div>
                        </div>
                    </div>
                    <button onclick="eliminarDesdeCotizacion('${lineId}')" style="background: none; border: none; color: #ff4d4f; cursor: pointer; font-size: 1.1rem; padding-left: 15px;">🗑️</button>
                </div>
            `;
        });

        // Solo actualizamos si el contenido cambió para evitar que el cursor salte o la página parpadee
        if (container.dataset.lastHtml !== html) {
            container.innerHTML = html;
            container.dataset.lastHtml = html;
            
            if (totalLabel) {
                totalLabel.style.display = 'block';
                totalLabel.innerHTML = "Precio final se enviará por correo";
            }
        }

    } catch (error) {
        console.error("Error en sincronización:", error);
    }
}

// FUNCIÓN PARA EDITAR CANTIDAD DESDE LA TABLA
window.editarCantidadCotizacion = function(btn, lineId, cambio) {
    const span = btn.parentElement.querySelector('span');
    const cantidadActual = parseInt(span.innerText);
    const nuevaCantidad = cantidadActual + cambio;

    if (nuevaCantidad <= 0) {
        eliminarDesdeCotizacion(lineId);
        return;
    }

    // Actualizamos visualización local inmediata
    span.innerText = nuevaCantidad;

    // Llamamos a la función de main.js que ya maneja el respaldo y Shopify
    if (typeof window.cambiarCantidad === 'function') {
        window.cambiarCantidad(lineId, nuevaCantidad);
    }
};

// FUNCIÓN PARA ELIMINAR DESDE LA TABLA
window.eliminarDesdeCotizacion = function(lineId) {
    if (confirm("¿Quitar este producto de la cotización?")) {
        if (typeof window.quitarProducto === 'function') {
            window.quitarProducto(lineId);
            // El polling o el evento storage se encargarán de refrescar la lista
        }
    }
};

function validarAntesDeEnviar() {
    const cartId = localStorage.getItem('shopify_cart_id');
    if (!cartId) {
        alert("La lista está vacía.");
        return false;
    }
    return true;
}
