// 1. Configuración de conexión (Igual que en main.js)
const shopifyConfig = {
    domain: 'zidiwr-ax.myshopify.com',
    accessToken: '715840bf165817aa2713937962be8670',
    apiVersion: '2024-01'
};

// 2. Función para consultar a Shopify
async function queryShopify(query) {
    const response = await fetch(`https://${shopifyConfig.domain}/api/${shopifyConfig.apiVersion}/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
        },
        body: JSON.stringify({ query })
    });
    return await response.json();
}

// 3. Capturar el ID de la URL
const urlParams = new URLSearchParams(window.location.search);
const idCodificado = urlParams.get('id');

async function cargarDetalleProducto() {
    if (!idCodificado) {
        console.error("No se encontró el ID en la URL");
        return;
    }

    try {
        // Decodificamos el ID que viene del catálogo
        const productId = atob(idCodificado); 
        
        const query = `
        {
          node(id: "${productId}") {
            ... on Product {
              title
              descriptionHtml
              images(first: 1) { edges { node { url } } }
              variants(first: 1) { edges { node { price { amount } } } }
            }
          }
        }`;

        const { data } = await queryShopify(query);
        const prod = data.node;

        if (prod) {
            // Inyectamos los datos en el HTML
            document.getElementById('prod-title').textContent = prod.title;
            document.getElementById('prod-price').textContent = `$${Math.round(prod.variants.edges[0].node.price.amount).toLocaleString('es-CL')}`;
            document.getElementById('prod-description').innerHTML = prod.descriptionHtml;
            document.getElementById('main-img').src = prod.images.edges[0].node.url;
            document.title = `${prod.title} - Albyon Digital`; // Cambia el título de la pestaña
        }
    } catch (error) {
        console.error("Error cargando el producto:", error);
        document.getElementById('prod-title').textContent = "Error al cargar el producto";
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarDetalleProducto);
