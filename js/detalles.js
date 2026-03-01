/* ==========================================================================
   ALBYON DIGITAL - MOTOR DE DETALLE Y COMPRA (STOREFRONT API)
   ========================================================================== */

(function() {
    const shopifyConfig = {
        domain: 'zidiwr-ax.myshopify.com',
        accessToken: '715840bf165817aa2713937962be8670',
        apiVersion: '2024-01'
    };

    // 1. Función Maestra de Consulta
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

    // 2. Lógica de Carga de Producto
    async function cargarDetalleProducto() {
        const urlParams = new URLSearchParams(window.location.search);
        const idCodificado = urlParams.get('id');

        if (!idCodificado) return;

        try {
            const productId = atob(idCodificado);
            
            // Pedimos el ID de la variante además de los datos visuales
            const query = `
            {
              node(id: "${productId}") {
                ... on Product {
                  title
                  descriptionHtml
                  images(first: 1) { edges { node { url } } }
                  variants(first: 1) { 
                    edges { 
                      node { 
                        id 
                        price { amount } 
                      } 
                    } 
                  }
                }
              }
            }`;

            const { data } = await queryShopify(query);
            const prod = data.node;

            if (prod) {
                // Inyectar datos en el HTML
                document.getElementById('prod-title').textContent = prod.title;
                document.getElementById('prod-price').textContent = `$${Math.round(prod.variants.edges[0].node.price.amount).toLocaleString('es-CL')}`;
                document.getElementById('prod-description').innerHTML = prod.descriptionHtml;
                document.getElementById('main-img').src = prod.images.edges[0].node.url;

                // CONFIGURAR BOTÓN DE COMPRA
                const variantId = prod.variants.edges[0].node.id;
                const btnAddCart = document.getElementById('btn-add-cart');

                if (btnAddCart) {
                    btnAddCart.addEventListener('click', () => {
                        crearCheckout(variantId);
                    });
                }
            }
        } catch (e) {
            console.error("Error cargando producto:", e);
        }
    }

    // 3. Función para Crear el Checkout y Redirigir
    async function crearCheckout(variantId) {
        const btn = document.getElementById('btn-add-cart');
        btn.innerText = "Procesando...";
        btn.disabled = true;

        const mutation = `
        mutation {
          checkoutCreate(input: {
            lineItems: [{ variantId: "${variantId}", quantity: 1 }]
          }) {
            checkout {
              webUrl
            }
            checkoutUserErrors {
              message
            }
          }
        }`;

        try {
            const { data } = await queryShopify(mutation);
            const checkout = data.checkoutCreate.checkout;

            if (checkout) {
                // Redirigir a la pantalla de pago de Shopify
                window.location.href = checkout.webUrl;
            } else {
                const error = data.checkoutCreate.checkoutUserErrors[0].message;
                alert("Error: " + error);
                btn.innerText = "Añadir al Carro";
                btn.disabled = false;
            }
        } catch (e) {
            console.error("Error en checkout:", e);
            btn.innerText = "Añadir al Carro";
            btn.disabled = false;
        }
    }

    // Ejecución inicial
    if (document.readyState === 'complete') {
        cargarDetalleProducto();
    } else {
        window.addEventListener('load', cargarDetalleProducto);
    }
})();
