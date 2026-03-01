(function() {
    // 1. Configuración con el nuevo Token del canal Headless
    const shopifyConfig = {
        domain: 'zidiwr-ax.myshopify.com',
        accessToken: '22259948ae8b45daf91294ada0ff44b4',
        apiVersion: '2024-01'
    };

    // 2. Función Maestra de consulta
    async function queryShopify(query) {
        try {
            const response = await fetch(`https://${shopifyConfig.domain}/api/${shopifyConfig.apiVersion}/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                },
                body: JSON.stringify({ query })
            });
            return await response.json();
        } catch (error) {
            console.error("❌ Error de red en Shopify API:", error);
        }
    }

    // 3. Carga de datos del producto
    async function cargarDetalleProducto() {
        const urlParams = new URLSearchParams(window.location.search);
        const idCodificado = urlParams.get('id');
        if (!idCodificado) return;

        try {
            const productId = atob(idCodificado);
            const query = `{
              node(id: "${productId}") {
                ... on Product {
                  title
                  descriptionHtml
                  images(first: 1) { edges { node { url } } }
                  variants(first: 1) { edges { node { id price { amount } } } }
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

                // Configurar el botón de compra
                const variantId = prod.variants.edges[0].node.id;
                const btnAddCart = document.getElementById('btn-add-cart');

                if (btnAddCart) {
                    // Limpiar eventos para evitar ejecuciones múltiples
                    const newBtn = btnAddCart.cloneNode(true);
                    btnAddCart.parentNode.replaceChild(newBtn, btnAddCart);
                    
                    newBtn.addEventListener('click', () => {
                        console.log("🟢 Iniciando compra para variante:", variantId);
                        crearCheckout(variantId);
                    });
                }
            }
        } catch (e) {
            console.error("❌ Error en la carga inicial:", e);
        }
    }

    // 4. Creación del Checkout y Redirección
    async function crearCheckout(variantId) {
        const btn = document.getElementById('btn-add-cart');
        btn.innerText = "Procesando...";
        btn.disabled = true;

        const mutation = `
        mutation {
          checkoutCreate(input: {
            lineItems: [{ variantId: "${variantId}", quantity: 1 }]
          }) {
            checkout { webUrl }
            checkoutUserErrors { message field }
          }
        }`;

        try {
            console.log("📡 Solicitando Checkout a Shopify...");
            const response = await queryShopify(mutation);
            
            // Verificación de respuesta exitosa
            if (response.data && response.data.checkoutCreate.checkout) {
                const urlCheckout = response.data.checkoutCreate.checkout.webUrl;
                console.log("🚀 Redirigiendo a Shopify Checkout:", urlCheckout);
                window.location.href = urlCheckout;
            } else {
                // Manejo de errores de Shopify
                const errors = response.data?.checkoutCreate?.checkoutUserErrors;
                console.error("❌ Error de Shopify:", errors || response.errors);
                alert("No se pudo iniciar el pago: " + (errors?.[0]?.message || "Error de permisos"));
                
                btn.innerText = "Añadir al Carro";
                btn.disabled = false;
            }
        } catch (e) {
            console.error("❌ Error crítico en el proceso de compra:", e);
            btn.innerText = "Añadir al Carro";
            btn.disabled = false;
        }
    }

    // Inicialización segura
    if (document.readyState === 'complete') {
        cargarDetalleProducto();
    } else {
        window.addEventListener('load', cargarDetalleProducto);
    }
})();
