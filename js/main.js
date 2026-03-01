// 1. Configuración de Shopify Storefront API
const shopifyConfig = {
    domain: 'zidiwr-ax.myshopify.com',
    accessToken: '22259948ae8b45daf91294ada0ff44b4',
    apiVersion: '2024-01'
};

// Función para cargar componentes estáticos (Header/Footer)
function loadComponent(id, file) {
    return fetch(file)
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar " + file);
            return response.text();
        })
        .then(data => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = data;
        })
        .catch(error => console.error(error));
}

// 2. Función Maestra para consultas GraphQL
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
        console.error("Error en la petición API:", error);
    }
}

// 3. Plantilla de Producto mejorada para el inicio
function templateProducto(prod) {
    const precio = Math.round(prod.variants.edges[0].node.price.amount);
    const imagen = prod.images.edges[0]?.node.url || 'img/placeholder.jpg';
    const idProducto = btoa(prod.id); 

    return `
        <div class="tarjeta-oferta">
            <div class="img-container" style="height: 180px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="${imagen}" alt="${prod.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
            <h3 style="font-size: 1.1rem; margin: 10px 0;">${prod.title}</h3>
            <div style="color: #e63946; font-weight: bold; font-size: 1.4rem;">$${precio.toLocaleString('es-CL')}</div>
            <a href="detalles.html?id=${idProducto}" class="btn-detalles" style="display: block; background: #333; color: white; padding: 10px; border-radius: 6px; text-decoration: none; margin-top: 10px;">
                Ver Detalles
            </a>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    // Carga Header y Footer
    Promise.all([
        loadComponent('header-placeholder', 'components/header.html'),
        loadComponent('footer-placeholder', 'components/footer.html'),
        loadComponent('whatsapp-placeholder', 'components/whatsapp.html'),
        loadComponent('whatsapp-placeholder', 'carro_compras.html')
    ]).then(() => {
        inicializarBusquedaUniversal();
        
        // ACTIVAR CLICS EN CATEGORÍAS
        const menuCat = document.getElementById('menu-categorias');
        if (menuCat) {
            const enlaces = document.querySelectorAll('.btn-categoria');
            enlaces.forEach(enlace => {
                enlace.addEventListener('click', (e) => {
                    e.preventDefault();
                    const categoria = enlace.getAttribute('data-categoria');
                    const nombreCategoria = enlace.textContent;
                    ejecutarCargaPorCategoria(categoria, nombreCategoria);
                });
            });
        }
        // ACTIVAR CATEGORÍA DESDE URL (?cat=algo)
const urlParams = new URLSearchParams(window.location.search);
const categoriaSolicitada = urlParams.get('cat');

if (categoriaSolicitada) {
    const botones = document.querySelectorAll('.btn-categoria');

let botonFiltrar = null;

botones.forEach(boton => {
    const dataCat = boton.getAttribute('data-categoria');
    if (dataCat && dataCat.toLowerCase() === categoriaSolicitada.toLowerCase()) {
        botonFiltrar = boton;
    }
});

    if (botonFiltrar) {
        botonFiltrar.click();
        botonFiltrar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
    });

    // CARGA AUTOMÁTICA DE OFERTAS (Si estamos en el index)
    const contenedorOfertas = document.getElementById('carrusel-ofertas');
    if (contenedorOfertas) {
        ejecutarCargaOfertasInicio();
    }

    // Buscador por URL
    const contenedorProductos = document.getElementById('shopify-products-load');
    if (contenedorProductos) {
        const urlParams = new URLSearchParams(window.location.search);
        const busquedaURL = urlParams.get('q');
        if (busquedaURL) {
            ejecutarBusquedaAPI(decodeURIComponent(busquedaURL));
        }
    }
});

// 4. Carga específica para el Inicio (Tags descuento1, 2, 3)
async function ejecutarCargaOfertasInicio() {
    const contenedor = document.getElementById('carrusel-ofertas');
    if (!contenedor) return;

    // Query que busca productos con cualquiera de tus 3 tags de descuento
    const query = `
    {
      products(first: 10, query: "tag:descuento1 OR tag:descuento2 OR tag:descuento3") {
        edges {
          node {
            id
            title
            images(first: 1) { edges { node { url } } }
            variants(first: 1) { edges { node { price { amount } } } }
          }
        }
      }
    }`;

    const { data } = await queryShopify(query);
    const edges = data?.products?.edges;

    if (!edges || edges.length === 0) {
        contenedor.innerHTML = `<p>No hay ofertas disponibles en este momento.</p>`;
        return;
    }
    contenedor.innerHTML = edges.map(edge => templateProducto(edge.node)).join('');
}

// 4. Buscador Universal
function inicializarBusquedaUniversal() {
    const inputBuscar = document.getElementById('search-input');
    const btnBuscar = document.getElementById('search-btn');

    if (btnBuscar && inputBuscar) {
        const realizarBusqueda = () => {
            const termino = inputBuscar.value.toLowerCase().trim();
            if (termino === "") return;

            if (window.location.pathname.includes('productos.html')) {
                ejecutarBusquedaAPI(termino);
            } else {
                window.location.href = `productos.html?q=${encodeURIComponent(termino)}`;
            }
        };

        btnBuscar.addEventListener('click', realizarBusqueda);
        inputBuscar.addEventListener('keypress', (e) => { if (e.key === 'Enter') realizarBusqueda(); });
    }
}

// 5. Consultas con campo ID incluido
async function ejecutarBusquedaAPI(termino) {
    const contenedor = document.getElementById('shopify-products-load');
    const titulo = document.getElementById('titulo-coleccion');
    
    if (titulo) titulo.textContent = `Resultados para: "${termino}"`;
    contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Buscando productos...</p>`;

    // SE AGREGA EL CAMPO "id" EN EL QUERY
    const query = `
    {
      products(first: 50, query: "title:${termino}*") {
        edges {
          node {
            id
            title
            onlineStoreUrl
            images(first: 1) { edges { node { url } } }
            variants(first: 1) { edges { node { price { amount } } } }
          }
        }
      }
    }`;

    const { data } = await queryShopify(query);
    renderizarProductos(data?.products?.edges);
}

async function ejecutarCargaPorCategoria(tag, nombre) {
    const contenedor = document.getElementById('shopify-products-load');
    const titulo = document.getElementById('titulo-coleccion');
    
    if (titulo) titulo.textContent = nombre;
    contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Cargando ${nombre}...</p>`;

    // SE AGREGA EL CAMPO "id" EN EL QUERY
    const query = `
    {
      products(first: 50, query: "tag:${tag}") {
        edges {
          node {
            id
            title
            onlineStoreUrl
            images(first: 1) { edges { node { url } } }
            variants(first: 1) { edges { node { price { amount } } } }
          }
        }
      }
    }`;

    const { data } = await queryShopify(query);
    renderizarProductos(data?.products?.edges);
}

function renderizarProductos(edges) {
    const contenedor = document.getElementById('shopify-products-load');
    if (!edges || edges.length === 0) {
        contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No se encontraron productos.</p>`;
        return;
    }
    contenedor.innerHTML = edges.map(edge => templateProducto(edge.node)).join('');
}
// --- FUNCIONES PARA EL HEADER ---

// 1. Mostrar/Ocultar el mini carrito
window.toggleMiniCart = function() {
    const miniCart = document.getElementById('mini-cart');
    if (miniCart.style.display === 'none') {
        miniCart.style.display = 'block';
        actualizarVisualizacionCarro(); // Actualizar al abrir
    } else {
        miniCart.style.display = 'none';
    }
}

// 2. Redirigir al checkout de Shopify
window.irAPagar = function() {
    const url = localStorage.getItem('shopify_checkout_url');
    if (url) {
        window.location.href = url;
    } else {
        alert("El carrito está vacío.");
    }
}

// 3. Consultar Shopify y actualizar el HTML del header
async function actualizarVisualizacionCarro() {
    const cartId = localStorage.getItem('shopify_cart_id');
    if (!cartId) return;

    const query = `{
      cart(id: "${cartId}") {
        totalQuantity
        cost { totalAmount { amount currencyCode } }
        lines(first: 10) {
          edges {
            node {
              quantity
              merchandise {
                ... on ProductVariant {
                  product { title }
                  image { url }
                  price { amount }
                }
              }
            }
          }
        }
      }
    }`;

    const response = await queryShopify(query);
    const cart = response.data?.cart;

    if (cart) {
        // Actualizar contador del botón
        document.getElementById('cart-count').textContent = cart.totalQuantity;
        
        // Actualizar total
        document.getElementById('cart-total').textContent = `Total: $${Math.round(cart.cost.totalAmount.amount).toLocaleString('es-CL')}`;

        // Renderizar lista de productos
        const listContainer = document.getElementById('cart-items-list');
        listContainer.innerHTML = ''; // Limpiar previo

        cart.lines.edges.forEach(item => {
            const prod = item.node.merchandise;
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.marginBottom = '10px';
            div.style.alignItems = 'center';
            div.innerHTML = `
                <img src="${prod.image.url}" style="width: 50px; height: 50px; margin-right: 10px; object-fit: cover;">
                <div style="font-size: 14px;">
                    <div><strong>${prod.product.title}</strong></div>
                    <div>Cant: ${item.node.quantity} - $${Math.round(prod.price.amount).toLocaleString('es-CL')}</div>
                </div>
            `;
            listContainer.appendChild(div);
        });
    }
}

// Llamar a actualizar al cargar la página para que el contador no empiece en 0
if (localStorage.getItem('shopify_cart_id')) {
    setTimeout(actualizarVisualizacionCarro, 1000); 
}
