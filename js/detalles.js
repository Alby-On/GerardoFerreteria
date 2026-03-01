const shopifyConfig = {
    domain: 'zidiwr-ax.myshopify.com',
    accessToken: '715840bf165817aa2713937962be8670',
    apiVersion: '2024-01'
};

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

async function cargarDetalleProducto() {
    const urlParams = new URLSearchParams(window.location.search);
    const idCodificado = urlParams.get('id');

    if (!idCodificado) return;

    try {
        // Decodificamos el ID
        const productId = atob(idCodificado);
        console.log("Cargando ID:", productId); // Esto aparecerá en tu consola (F12)

        const query = `
        {
          node(id: "${productId}") {
            ... on Product {
              title
              descriptionHtml
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }`;

        const { data, errors } = await queryShopify(query);

        if (errors) {
            console.error("Errores de Shopify:", errors);
            return;
        }

        const prod = data.node;

        if (prod) {
            // Llenar datos con seguridad (opcional: manejo de errores si falta imagen)
            const imgUrl = prod.images.edges[0]?.node.url || 'img/placeholder.jpg';
            const precio = Math.round(prod.variants.edges[0]?.node.price.amount || 0);

            document.getElementById('prod-title').textContent = prod.title;
            document.getElementById('prod-price').textContent = `$${precio.toLocaleString('es-CL')}`;
            document.getElementById('prod-description').innerHTML = prod.descriptionHtml;
            document.getElementById('main-img').src = imgUrl;
            document.getElementById('main-img').alt = prod.title;
            
            // Quitar clase de carga si la usas
            console.log("Producto cargado con éxito");
        } else {
            document.getElementById('prod-title').textContent = "Producto no encontrado";
        }

    } catch (e) {
        console.error("Error crítico:", e);
    }
}

// Asegurarnos de que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarDetalleProducto);
} else {
    cargarDetalleProducto();
}
