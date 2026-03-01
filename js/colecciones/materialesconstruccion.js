
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
        id: '482436481249',
        node: document.getElementById('shopify-products-load'),
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
      },
      "title": {
        "font-size": "17px"
      },
      "button": {
        "padding-left": "25px",
        "padding-right": "25px"
      }
    },
    "contents": {
      "button": false,
      "buttonWithQuantity": true
    },
    "text": {
      "button": "Añadir al carro"
    }
  },
  "productSet": {
    "styles": {
      "products": {
        "@media (min-width: 601px)": {
          "margin-left": "-20px"
        }
      }
    }
  },
  "modalProduct": {
    "contents": {
      "img": false,
      "imgWithCarousel": true,
      "button": false,
      "buttonWithQuantity": true
    },
    "styles": {
      "product": {
        "@media (min-width: 601px)": {
          "max-width": "100%",
          "margin-left": "0px",
          "margin-bottom": "0px"
        }
      },
      "button": {
        "padding-left": "25px",
        "padding-right": "25px"
      },
      "title": {
        "font-family": "Helvetica Neue, sans-serif",
        "font-weight": "bold",
        "font-size": "26px",
        "color": "#4c4c4c"
      }
    },
    "text": {
      "button": "Add to cart"
    }
  },
  "option": {},
  "cart": {
    "styles": {
      "title": {
        "color": "#121010"
      },
      "header": {
        "color": "#121010"
      },
      "lineItems": {
        "color": "#121010"
      },
      "subtotalText": {
        "color": "#121010"
      },
      "subtotal": {
        "color": "#121010"
      },
      "notice": {
        "color": "#121010"
      },
      "currency": {
        "color": "#121010"
      },
      "close": {
        "color": "#121010",
        ":hover": {
          "color": "#121010"
        }
      },
      "empty": {
        "color": "#121010"
      },
      "noteDescription": {
        "color": "#121010"
      },
      "discountText": {
        "color": "#121010"
      },
      "discountIcon": {
        "fill": "#121010"
      },
      "discountAmount": {
        "color": "#121010"
      }
    },
    "text": {
      "title": "Carro de compras",
      "total": "Subtotal",
      "empty": "Tu carrito esta Vacio",
      "notice": "Los códigos de envío y descuento se agregan al momento del pago.",
      "button": "Finalizar Compra",
      "noteDescription": "Instrucciones especiales del pedido"
    },
    "contents": {
      "note": true
    }
  },
  "toggle": {},
  "lineItem": {
    "styles": {
      "variantTitle": {
        "color": "#121010"
      },
      "title": {
        "color": "#121010"
      },
      "price": {
        "color": "#121010"
      },
      "fullPrice": {
        "color": "#121010"
      },
      "discount": {
        "color": "#121010"
      },
      "discountIcon": {
        "fill": "#121010"
      },
      "quantity": {
        "color": "#121010"
      },
      "quantityIncrement": {
        "color": "#121010",
        "border-color": "#121010"
      },
      "quantityDecrement": {
        "color": "#121010",
        "border-color": "#121010"
      },
      "quantityInput": {
        "color": "#121010",
        "border-color": "#121010"
      }
    }
  }
},
      });
    });
  }
})();

