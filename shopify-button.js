/* Archivo: shopify-button.js (Versión Robusta) */
(function () {
    const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    
    function ShopifyBuyInit() {
        // Verificamos si el cliente ya existe para no duplicar
        const client = ShopifyBuy.buildClient({
            domain: 'zidiwr-ax.myshopify.com',
            storefrontAccessToken: '715840bf165817aa2713937962be8670',
        });

        ShopifyBuy.UI.onReady(client).then(function (ui) {
            const node = document.getElementById('contenedor-tienda-dinamica');
            
            // Si el nodo no existe aún, esperamos un poco
            if (!node) {
                console.warn("Contenedor no encontrado, reintentando...");
                setTimeout(ShopifyBuyInit, 500);
                return;
            }

            // Limpiamos el mensaje de "Cargando..."
            node.innerHTML = '';

            client.collection.fetchAllWithProducts().then((collections) => {
                if (collections.length === 0) {
                    node.innerHTML = '<p>No se encontraron colecciones activas.</p>';
                    return;
                }

                collections.forEach((collection) => {
                    const div = document.createElement('div');
                    div.id = 'collection-' + collection.id;
                    div.style.marginBottom = "50px";
                    node.appendChild(div);

                    ui.createComponent('collection', {
                        id: collection.id,
                        node: div,
                        moneyFormat: '%24%7B%7Bamount_no_decimals%7D%7D',
                        options: {
                            "product": {
                                "buttonDestination": "cart",
                                "contents": { "button": true, "options": false },
                                "text": { "button": "Agregar" }
                            },
                            "cart": {
                                "text": { "title": "Carro", "button": "Pagar" },
                                "popup": false // Evita errores de popup bloqueado
                            }
                        }
                    });
                });
            }).catch(err => {
                console.error("Error al obtener colecciones:", err);
            });
        });
    }

    function loadScript() {
        const script = document.createElement('script');
        script.async = true;
        script.src = scriptURL;
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
        script.onload = ShopifyBuyInit;
    }

    if (window.ShopifyBuy && window.ShopifyBuy.UI) {
        ShopifyBuyInit();
    } else {
        loadScript();
    }
})();
