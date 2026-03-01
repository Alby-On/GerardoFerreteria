document.addEventListener("DOMContentLoaded", () => {
    // Al ser el INDEX, llamamos directamente a la función de ofertas
    ejecutarCargaOfertasInicio();
});

async function ejecutarCargaOfertasInicio() {
    const contenedor = document.getElementById('shopify-products-load');
    
    // Query que busca específicamente los 3 niveles de descuento
    // El data-categoria se asignará dinámicamente en el renderizado
    const query = `
    {
      products(first: 20, query: "tag:descuento1 OR tag:descuento2 OR tag:descuento3") {
        edges {
          node {
            id
            title
            tags
            images(first: 1) { edges { node { url } } }
            variants(first: 1) { edges { node { price { amount } } } }
          }
        }
      }
    }`;

    try {
        const { data } = await queryShopify(query);
        const productos = data?.products?.edges;

        if (!productos || productos.length === 0) {
            contenedor.innerHTML = "<p>No hay ofertas disponibles hoy. ¡Vuelve pronto!</p>";
            return;
        }

        // Renderizamos usando el template que ya tenemos
        contenedor.innerHTML = productos.map(edge => {
            // Buscamos cuál de los tags de descuento tiene para el data-categoria
            const tagDescuento = edge.node.tags.find(t => t.includes('descuento')) || 'oferta';
            return templateProducto(edge.node, tagDescuento);
        }).join('');

    } catch (error) {
        contenedor.innerHTML = "<p>Error al conectar con la bodega.</p>";
    }
}

// Modificamos levemente el template para recibir el data-categoria dinámico
function templateProducto(prod, categoria) {
    const precio = Math.round(prod.variants.edges[0].node.price.amount);
    const imagen = prod.images.edges[0]?.node.url || 'img/placeholder.jpg';
    const idProducto = btoa(prod.id); 

    return `
        <div class="tarjeta-oferta" data-categoria="${categoria}" style="background: white; border-radius: 15px; padding: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); transition: 0.3s; border: 1px solid #eee;">
            <div style="height: 200px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <img src="${imagen}" alt="${prod.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <h3 style="font-size: 1.1rem; color: #222; height: 45px; overflow: hidden;">${prod.title}</h3>
            <p style="color: #d90429; font-weight: 800; font-size: 1.5rem; margin: 10px 0;">$${precio.toLocaleString('es-CL')}</p>
            <a href="detalles.html?id=${idProducto}" style="display: block; background: #1a1a1a; color: #fff; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 600;">Ver Detalles</a>
        </div>
    `;
}
