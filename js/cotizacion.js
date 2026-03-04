document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga inicial
    setTimeout(renderizarCotizacionDesdeShopify, 500);

    // 2. ESCUCHA ACTIVA: Si el carrito cambia
    window.addEventListener('storage', (event) => {
        if (event.key === 'shopify_cart_id') {
            renderizarCotizacionDesdeShopify();
        }
    });

    // 3. POLLING: Sincronización continua cada 2 segundos
    setInterval(renderizarCotizacionDesdeShopify, 2000);
});

async function renderizarCotizacionDesdeShopify() {
    const cartId = localStorage.getItem('shopify_cart_id');
    const container = document.getElementById('lista-cotizacion-items');
    const totalLabel = document.getElementById('total-ref-cot');

    if (!cartId) {
        if (container) container.innerHTML = "<p>Tu lista de cotización está vacía.</p>";
        if (totalLabel) totalLabel.style.display = 'none'; // Ocultamos el label de total
        return;
    }

    // Simplificamos la query: Ya no pedimos 'cost' ni 'price'
    const query = `{
      cart(id: "${cartId}") {
        lines(first: 20) {
          edges {
            node {
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
            const qty = item.node.quantity;

            // Renderizamos solo Título y Cantidad
            html += `
                <div class="item-cot" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                    <div style="text-align: left;">
                        <span style="display: block; font-weight: bold; color: #1e293b; font-size: 1rem;">${prod.product.title}</span>
                        <span style="color: #64748b; font-size: 0.9rem;">Cantidad solicitada: <strong>${qty} unidades</strong></span>
                    </div>
                    <div style="color: #d9534f; font-weight: bold; font-size: 0.85rem; text-transform: uppercase;">
                        Pendiente
                    </div>
                </div>
            `;
        });

        if (container.innerHTML !== html) {
            container.innerHTML = html;
            
            // Ocultamos o cambiamos el texto del total general
            if (totalLabel) {
                totalLabel.innerHTML = "Precio final se enviará por correo";
                totalLabel.style.color = "#64748b";
                totalLabel.style.fontSize = "0.9rem";
            }
        }

    } catch (error) {
        console.error("Error en sincronización de cotización:", error);
    }
}

function validarAntesDeEnviar() {
    const cartId = localStorage.getItem('shopify_cart_id');
    if (!cartId) {
        alert("La lista está vacía. Agrega productos antes de solicitar tu cotización.");
        return false;
    }
    return true;
}
