/* Archivo: shopify-button.js (Dinámico) */
(function () {
    var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    
    function loadScript() {
        var script = document.createElement('script');
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

    function ShopifyBuyInit() {
        const client = ShopifyBuy.buildClient({
            domain: 'zidiwr-ax.myshopify.com',
            storefrontAccessToken: '715840bf165817aa2713937962be8670',
        });

        ShopifyBuy.UI.onReady(client).then(function (ui) {
            // AQUÍ ESTÁ EL TRUCO: Buscamos todas las colecciones de tu tienda
            client.collection.fetchAllWithProducts().then((collections) => {
                
                collections.forEach((collection) => {
                    // Por cada colección en Shopify, creamos un contenedor dinámico
                    const wrapper = document.getElementById('contenedor-tienda-dinamica');
                    const div = document.createElement('div');
                    div.id = 'coll-' + collection.id;
                    wrapper.appendChild(div);

                    // Renderizamos la colección en ese nuevo div
                    ui.createComponent('collection', {
                        id: collection.id,
                        node: div,
                        moneyFormat: '%24%7B%7Bamount_no_decimals%7D%7D',
                        options: {
                            "product": {
                                "styles": { "product": { "width": "230px" } },
                                "text": { "button": "Agregar al carro" }
                            }
                        }
                    });
                });
            });
        });
    }
})();
