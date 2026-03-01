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
                document.getElementById('prod-title').textContent = prod.title;
                document.getElementById('prod-price').textContent = `$${Math.round(prod.variants.edges[0].node.price.amount).toLocaleString('es-CL')}`;
                document.getElementById('prod-description').innerHTML = prod.descriptionHtml;
                document.getElementById('main-img').src = prod.images.edges[0].node.url;

                const variantId = prod.variants.edges[0].node.id;
                const btnAddCart = document.getElementById('btn-add-cart');

                if (btnAddCart) {
                    const newBtn = btnAddCart.cloneNode(true);
                    btnAddCart.parentNode.replaceChild(newBtn, btnAddCart);
                    
                    newBtn.addEventListener('click', () => {
                        console.log("🟢 Agregando al carrito acumulativo:", variantId);
                        gestionarCarrito(variantId);
                    });
                }
            }
        } catch (e) {
            console.error("❌ Error en la carga inicial:", e);
        }
    }

    // --- NUEVA LÓGICA ACUMULATIVA ---

    async function gestionarCarrito(variantId) {
        const btn = document.getElementById('btn-add-cart');
        btn.innerText = "Añadiendo...";
        btn.disabled = true;

        // Recuperar carrito guardado
        let cartId = localStorage.getItem('shopify_cart_id');

        try {
            if (!cartId) {
                // Si no hay carrito, crear uno nuevo
                await crearCarritoNuevo(variantId);
            } else {
                // Si ya existe, añadir el nuevo producto
                await añadirProductoAlCarrito(cartId, variantId);
            }
            
            btn.innerText = "¡Añadido!";
            setTimeout(() => {
                btn.innerText = "Añadir más";
                btn.disabled = false;
            }, 2000);

        } catch (e) {
            console.error("❌ Error procesando carrito:", e);
            btn.innerText = "Error";
            btn.disabled = false;
        }
    }

    async function crearCarritoNuevo(variantId) {
        const mutation = `
        mutation {
          cartCreate(input: { lines: [{ merchandiseId: "${variantId}", quantity: 1 }] }) {
            cart { id checkoutUrl }
            userErrors { message }
          }
        }`;
        const response = await queryShopify(mutation);
        const cart = response.data.cartCreate.cart;
        if (cart) {
            localStorage.setItem('shopify_cart_id', cart.id);
            localStorage.setItem('shopify_checkout_url', cart.checkoutUrl);
            console.log("🛒 Nuevo carrito creado y guardado.");
        }
    }

    async function añadirProductoAlCarrito(cartId, variantId) {
        const mutation = `
        mutation {
          cartLinesAdd(cartId: "${cartId}", lines: [{ merchandiseId: "${variantId}", quantity: 1 }]) {
            cart { id checkoutUrl }
            userErrors { message }
          }
        }`;
        const response = await queryShopify(mutation);
        
        // Si hay errores (ej. carrito expirado), limpiar y crear uno nuevo
        if (response.data.cartLinesAdd.userErrors.length > 0) {
            console.warn("⚠️ Carrito antiguo no válido, creando uno nuevo...");
            localStorage.removeItem('shopify_cart_id');
            return crearCarritoNuevo(variantId);
        }
        
        console.log("➕ Producto sumado al carrito existente.");
    }

    // Inicialización segura
    if (document.readyState === 'complete') {
        cargarDetalleProducto();
    } else {
        window.addEventListener('load', cargarDetalleProducto);
    }
})();
