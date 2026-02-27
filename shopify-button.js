/* Archivo: shopify-button.js (Versión Estabilizada) */
(function () {
    const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    
    function ShopifyBuyInit() {
        const client = ShopifyBuy.buildClient({
            domain: 'zidiwr-ax.myshopify.com',
            storefrontAccessToken: '715840bf165817aa2713937962be8670',
        });

        ShopifyBuy.UI.onReady(client).then(function (ui) {
            const node = document.getElementById('contenedor-tienda-dinamica');
            if (!node) return;

            node.innerHTML = ''; // Limpiar cargando

            client.collection.fetchAllWithProducts().then((collections) => {
                collections.forEach((collection) => {
                    const div = document.createElement('div');
                    div.id = 'collection-' + collection.id;
                    node.appendChild(div);

                    ui.createComponent('collection', {
                        id: collection.id,
                        node: div,
                        options: {
                            "product": {
                                "buttonDestination": "cart",
                                "contents": {
                                    "img": true,
                                    "title": true,
                                    "price": true,
                                    "button": true
                                },
                                "text": { "button": "Agregar" }
                            },
                            "cart": {
                                "startOpen": false,
                                "popup": false,
                                "text": {
                                    "title": "Carrito",
                                    "total": "Subtotal",
                                    "button": "Pagar"
                                }
                            },
                            // Agregamos esto para evitar el error de indexOf en el modal
                            "modalProduct": {
                                "contents": {
                                    "img": true,
                                    "imgWithCarousel": true,
                                    "button": true,
                                    "buttonWithQuantity": true
                                }
                            }
                        }
                    });
                });
            }).catch(err => console.error("Error en API Shopify:", err));
        });
    }

    // Carga del script
    if (window.ShopifyBuy) {
        ShopifyBuyInit();
    } else {
        const script = document.createElement('script');
        script.async = true;
        script.src = scriptURL;
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
        script.onload = ShopifyBuyInit;
    }
})();
