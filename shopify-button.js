/* Archivo: shopify-button.js (Versión de Diagnóstico) */
(function () {
    const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    
    function ShopifyBuyInit() {
        const client = ShopifyBuy.buildClient({
            domain: 'zidiwr-ax.myshopify.com',
            storefrontAccessToken: '715840bf165817aa2713937962be8670',
        });

        ShopifyBuy.UI.onReady(client).then(function (ui) {
            // Intentamos renderizar solo UNA colección primero para probar estabilidad
            ui.createComponent('collection', {
                id: '482113093857', // Tu ID de colección
                node: document.getElementById('contenedor-tienda-dinamica'),
                moneyFormat: '%24%7B%7Bamount%7D%7D', // Formato estándar
                options: {
                    "product": {
                        "buttonDestination": "cart",
                        "variantId": "all",
                        "contents": {
                            "img": true,
                            "title": true,
                            "price": true,
                            "button": true
                        }
                    },
                    "cart": {
                        "startOpen": false,
                        "popup": false
                    }
                }
            });
        }).catch(err => console.error("Error en UI de Shopify:", err));
    }

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
