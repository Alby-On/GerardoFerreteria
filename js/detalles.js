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
              variants(first: 1) { 
                edges { 
                  node { 
                    id 
                    price { amount } 
                    quantityAvailable 
                  } 
                } 
              }
            }
          }
        }`;

        const { data } = await queryShopify(query);
        const prod = data.node;

        if (prod) {
            const variantNode = prod.variants.edges[0].node;
            const stockReal = variantNode.quantityAvailable;
            const variantId = variantNode.id;

            // Rellenar datos básicos
            document.getElementById('prod-title').textContent = prod.title;
            
            // --- CAMBIO AQUÍ: OCULTAMOS EL PRECIO ---
            const priceDisplay = document.getElementById('prod-price');
            if (priceDisplay) {
                priceDisplay.innerHTML = `<span style="color: #666; font-size: 0.9rem;">Precio: Consultar en cotización</span>`;
                // Si quieres que desaparezca totalmente, usa: priceDisplay.style.display = 'none';
            }

            document.getElementById('prod-description').innerHTML = prod.descriptionHtml;
            document.getElementById('main-img').src = prod.images.edges[0].node.url;

            // Lógica Visual de Stock
            const stockDisplay = document.getElementById('prod-stock');
            const inputCantidad = document.getElementById('cantidad');
            const btnAddCart = document.getElementById('btn-add-cart');

            if (stockDisplay) {
                if (stockReal > 0) {
                    stockDisplay.innerHTML = `Stock disponible: <strong>${stockReal} unidades</strong>`;
                    stockDisplay.style.color = "#28a745";
                    
                    if (inputCantidad) {
                        inputCantidad.max = stockReal;
                        inputCantidad.placeholder = `Máx ${stockReal}`;
                    }
                } else {
                    stockDisplay.innerHTML = `<strong>Agotado temporalmente</strong>`;
                    stockDisplay.style.color = "#dc3545";
                    
                    if (btnAddCart) {
                        btnAddCart.disabled = true;
                        btnAddCart.innerText = "Sin Stock";
                        btnAddCart.style.backgroundColor = "#6c757d";
                    }
                }
            }

            // Configurar evento del botón
            if (btnAddCart && stockReal > 0) {
                // Cambiamos el texto del botón para que sea coherente con la cotización
                btnAddCart.innerText = "Añadir a mi Cotización"; 

                const newBtn = btnAddCart.cloneNode(true);
                btnAddCart.parentNode.replaceChild(newBtn, btnAddCart);
                
                newBtn.addEventListener('click', () => {
                    const cantSeleccionada = parseInt(inputCantidad.value);
                    if (cantSeleccionada > stockReal) {
                        alert(`Solo tenemos ${stockReal} unidades disponibles.`);
                        inputCantidad.value = stockReal;
                        return;
                    }
                    gestionarCarrito(variantId);
                });
            }
        }
    } catch (e) {
        console.error("❌ Error en la carga inicial:", e);
    }
}
    // --- LÓGICA ACUMULATIVA CORREGIDA ---

   async function gestionarCarrito(variantId) {
    const btn = document.getElementById('btn-add-cart');
    const inputCantidad = document.getElementById('cantidad');
    const cantidad = inputCantidad ? parseInt(inputCantidad.value) : 1;
    
    if (isNaN(cantidad) || cantidad < 1) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }

    btn.innerText = "Añadiendo...";
    btn.disabled = true;

    let cartId = localStorage.getItem('shopify_cart_id');

    try {
        // --- PUNTO CLAVE: Guardar lo que retornan tus funciones ---
        let resultado; 

        if (!cartId) {
            resultado = await crearCarritoNuevo(variantId, cantidad); 
        } else {
            resultado = await añadirProductoAlCarrito(cartId, variantId, cantidad); 
        }
        
        // --- LOG DE SEGURIDAD (Míralo en tu S22 Ultra) ---
        console.log("Resultado recibido en gestionarCarrito:", resultado);

        // --- VALIDACIÓN DE ERRORES ---
        if (resultado && resultado.userErrors && resultado.userErrors.length > 0) {
            const errorMsg = resultado.userErrors[0].message;
            
            // Si el mensaje dice algo de stock, lo mostramos
            if (errorMsg.toLowerCase().includes('stock') || errorMsg.toLowerCase().includes('available')) {
                alert(`📦 Gerardo Ferretería: ${errorMsg}. Solo agregamos lo disponible.`);
            } else {
                alert(`Aviso: ${errorMsg}`);
            }
        }

        // Refrescar Sidebar
        if (typeof actualizarVisualizacionCarro === "function") {
            await actualizarVisualizacionCarro(); 
        }

        btn.innerText = "¡Añadido!";
        if (inputCantidad) inputCantidad.value = 1;

        setTimeout(() => {
            btn.innerText = "Añadir al Carro";
            btn.disabled = false;
        }, 2000);

    } catch (e) {
        console.error("❌ Error técnico:", e);
        btn.innerText = "Error";
        btn.disabled = false;
    }
}

    async function crearCarritoNuevo(variantId, cantidad) {
        const mutation = `
        mutation {
          cartCreate(input: { lines: [{ merchandiseId: "${variantId}", quantity: ${cantidad} }] }) {
            cart { id checkoutUrl }
            userErrors { message }
          }
        }`;
        const response = await queryShopify(mutation);
        const cart = response.data.cartCreate.cart;
        if (cart) {
            localStorage.setItem('shopify_cart_id', cart.id);
            localStorage.setItem('shopify_checkout_url', cart.checkoutUrl);
            console.log(`🛒 Nuevo carrito creado con ${cantidad} unidades.`);
        }

        return response.data.cartCreate;
    }

    async function añadirProductoAlCarrito(cartId, variantId, cantidad) {
    const mutation = `
    mutation {
      cartLinesAdd(cartId: "${cartId}", lines: [{ merchandiseId: "${variantId}", quantity: ${cantidad} }]) {
        cart { id checkoutUrl }
        userErrors { message }
      }
    }`;
    const response = await queryShopify(mutation);
    
    // 1. Verificamos si hay errores de "Carrito no encontrado" (expirado)
    const errores = response.data?.cartLinesAdd?.userErrors || [];
    if (errores.some(e => e.message.toLowerCase().includes("not found"))) {
        console.warn("⚠️ Carrito antiguo no válido, creando uno nuevo...");
        localStorage.removeItem('shopify_cart_id');
        return crearCarritoNuevo(variantId, cantidad);
    }
    
    console.log(`➕ Se sumaron ${cantidad} productos al carrito.`);

    // 2. RETORNO CLAVE: Devolvemos el resultado para que gestionarCarrito 
    // pueda leer si hubo errores de STOCK.
    return response.data.cartLinesAdd;
}

    // Inicialización segura
    if (document.readyState === 'complete') {
        cargarDetalleProducto();
    } else {
        window.addEventListener('load', cargarDetalleProducto);
    }
})();
