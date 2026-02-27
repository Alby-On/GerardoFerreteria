/* Archivo: shopify-button.js */
(function () {
    var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    if (window.ShopifyBuy) {
        if (window.ShopifyBuy.UI) {
            ShopifyBuyInit();
        } else {
            loadScript();
        }
    } else {
        loadScript();
    }

    function loadScript() {
        var script = document.createElement('script');
        script.async = true;
        script.src = scriptURL;
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
        script.onload = ShopifyBuyInit;
    }

    function ShopifyBuyInit() {
        var client = ShopifyBuy.buildClient({
            domain: 'zidiwr-ax.myshopify.com',
            storefrontAccessToken: '715840bf165817aa2713937962be8670',
        });
        ShopifyBuy.UI.onReady(client).then(function (ui) {
            ui.createComponent('collection', {
                id: '482113093857',
                node: document.getElementById('collection-component-1772222004797'),
                moneyFormat: '%24%7B%7Bamount_no_decimals%7D%7D',
                options: {
                    "product": {
                        "styles": {
                            "product": {
                                "@media (min-width: 601px)": {
                                    "max-width": "calc(25% - 20px)",
                                    "margin-left": "20px",
                                    "margin-bottom": "50px",
                                    "width": "calc(25% - 20px)"
                                },
                                "img": {
                                    "height": "calc(100% - 15px)",
                                    "position": "absolute",
                                    "left": "0",
                                    "right": "0",
                                    "top": "0"
                                },
                                "imgWrapper": {
                                    "padding-top": "calc(75% + 15px)",
                                    "position": "relative",
                                    "height": "0"
                                }
                            }
                        },
                        "text": { "button": "Añadir al carrito" }
                    },
                    "cart": {
                        "text": {
                            "title": "Carro de compras",
                            "total": "Subtotal",
                            "empty": "Tu carrito está vacío",
                            "notice": "Los códigos de envío y descuento se agregan al momento del pago.",
                            "button": "Finalizar Compra",
                            "noteDescription": "Instrucciones especiales del pedido"
                        },
                        "contents": { "note": true },
                        "styles": {
                            "title": { "color": "#121010" },
                            "header": { "color": "#121010" }
                            /* He resumido los estilos para mantener el archivo limpio, Shopify los aplicará */
                        }
                    }
                }
            });
        });
    }
})();
