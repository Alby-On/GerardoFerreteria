(function() {
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
                    // Limpiamos eventos previos para evitar duplicados
                    const newBtn = btnAddCart.cloneNode(true);
                    btnAddCart.parentNode.replaceChild(newBtn, btnAddCart);
                    
                    newBtn.addEventListener('click', () => {
                        console.log("🟢 Clic detectado. Variante:", variantId);
                        crearCheckout(variantId);
                    });
                }
            }
        } catch (e) {
            console.error("❌ Error carga inicial:", e);
        }
    }

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
            console.log("📡 Enviando Mutation a Shopify...");
            const response = await queryShopify(mutation);
            console.log("📥 Respuesta completa de Shopify:", response);

            if (response.data && response.data.checkoutCreate.checkout) {
                console.log("🚀 Redirigiendo a:", response.data.checkoutCreate.checkout.webUrl);
                window.location.href = response.data.checkoutCreate.checkout.webUrl;
            } else {
                const errors = response.data?.checkoutCreate?.checkoutUserErrors;
                console.error("❌ Errores de Checkout:", errors || response.errors);
                alert("Shopify dice: " + (errors?.[0]?.message || "Error desconocido"));
                btn.innerText = "Añadir al Carro";
                btn.disabled = false;
            }
        } catch (e) {
            console.error("❌ Error crítico en el proceso:", e);
            btn.innerText = "Añadir al Carro";
            btn.disabled = false;
        }
    }

    if (document.readyState === 'complete') cargarDetalleProducto();
    else window.addEventListener('load', cargarDetalleProducto);
})();
