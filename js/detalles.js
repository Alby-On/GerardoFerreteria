/* ==========================================================================
   ALBYON DIGITAL - MOTOR DE DETALLE DINÁMICO
   ========================================================================== */

(function() {
    // 1. Configuración de Shopify Storefront API
    const shopifyConfig = {
        domain: 'zidiwr-ax.myshopify.com',
        accessToken: '715840bf165817aa2713937962be8670',
        apiVersion: '2024-01'
    };

    console.log("🚀 Motor de detalles iniciado...");

    // 2. Función interna de consulta
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

    // 3. Lógica principal de carga
    async function cargarDetalleProducto() {
        const urlParams = new URLSearchParams(window.location.search);
        const idCodificado = urlParams.get('id');

        if (!idCodificado) {
            console.error("❌ Error: No hay ID en la URL.");
            return;
        }

        try {
            // Decodificamos el ID de Base64
            const productId = atob(idCodificado);
            console.log("🔍 Buscando datos para el producto:", productId);

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
                        }
                      }
                    }
                  }
                }
              }
            }`;

            const { data, errors } = await queryShopify(query);

            if (errors) {
                console.error("❌ Errores de Shopify API:", errors);
                return;
            }

            const prod = data.node;

            if (prod) {
                // Inyectamos los datos en el HTML de detalles.html
                const imgUrl = prod.images.edges[0]?.node.url || 'img/placeholder.jpg';
                const precio = Math.round(prod.variants.edges[0]?.node.price.amount || 0);

                // Aseguramos que los elementos existan antes de escribir
                const elTitle = document.getElementById('prod-title');
                const elPrice = document.getElementById('prod-price');
                const elDesc = document.getElementById('prod-description');
                const elImg = document.getElementById('main-img');

                if (elTitle) elTitle.textContent = prod.title;
                if (elPrice) elPrice.textContent = `$${precio.toLocaleString('es-CL')}`;
                if (elDesc) elDesc.innerHTML = prod.descriptionHtml;
                if (elImg) {
                    elImg.src = imgUrl;
                    elImg.alt = prod.title;
                }
                
                console.log("✅ Producto inyectado correctamente: " + prod.title);
                document.title = `${prod.title} - Albyon Digital`;
            } else {
                console.warn("⚠️ Shopify no encontró el producto para este ID.");
                if (document.getElementById('prod-title')) {
                    document.getElementById('prod-title').textContent = "Producto no encontrado";
                }
            }

        } catch (e) {
            console.error("❌ Error crítico en detalles.js:", e);
        }
    }

    // 4. Ejecución segura
    if (document.readyState === 'complete') {
        cargarDetalleProducto();
    } else {
        window.addEventListener('load', cargarDetalleProducto);
    }
})();
