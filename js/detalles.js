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

  async function crearCheckout(variantId) {
    const btn = document.getElementById('btn-add-cart');
    btn.innerText = "Procesando...";
    btn.disabled = true;

    // Usamos cartCreate en lugar de checkoutCreate (Es el estándar actual de Headless)
    const mutation = `
    mutation {
      cartCreate(input: {
        lines: [{ merchandiseId: "${variantId}", quantity: 1 }]
      }) {
        cart {
          checkoutUrl
        }
        userErrors {
          message
        }
      }
    }`;

    try {
        console.log("📡 Intentando crear carrito con ID:", variantId);
        const response = await queryShopify(mutation);
        console.log("📥 Respuesta de Shopify:", response);

        const cartData = response.data?.cartCreate;

        if (cartData && cartData.cart) {
            console.log("🚀 Éxito, redirigiendo al checkout...");
            window.location.href = cartData.cart.checkoutUrl;
        } else {
            // Si aquí sale error, es que faltan permisos de "Cart" en el panel
            const errorMsg = cartData?.userErrors?.[0]?.message || "Faltan permisos de Carrito en Shopify";
            console.error("❌ Error de permisos:", errorMsg);
            alert("Atención: " + errorMsg);
            btn.innerText = "Añadir al Carro";
            btn.disabled = false;
        }
    } catch (e) {
        console.error("❌ Error en la petición:", e);
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
