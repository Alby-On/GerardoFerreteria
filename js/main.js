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

// 3. Plantilla de Producto (Usa el ID codificado para detalles.html)
function templateProducto(prod) {
    const precio = Math.round(prod.variants.edges[0].node.price.amount);
    const imagen = prod.images.edges[0]?.node.url || 'img/placeholder.jpg';
    
    // btoa convierte el ID de Shopify a Base64 para una URL limpia
    const idProducto = btoa(prod.id); 

    return `
        <div class="shopify-buy__product">
            <div class="shopify-buy__product-img-wrapper">
                <img src="${imagen}" class="shopify-buy__product-img" alt="${prod.title}">
            </div>
            <h3 class="shopify-buy__product-title">${prod.title}</h3>
            <div class="shopify-buy__product-price-size">$${precio.toLocaleString('es-CL')}</div>
            <a href="detalles.html?id=${idProducto}" class="shopify-buy__btn" style="text-decoration:none; text-align:center;">
                Ver Detalles
            </a>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Carga componentes siempre (Header/Footer)
    Promise.all([
        loadComponent('header-placeholder', 'components/header.html'),
        loadComponent('footer-placeholder', 'components/footer.html')
    ]).then(() => {
        inicializarBusquedaUniversal();
        
        // 2. SOLO si existe el menú de categorías, activamos los clics
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
    });

    // 3. SOLO si existe el contenedor de productos, buscamos por URL
    const contenedorProductos = document.getElementById('shopify-products-load');
    if (contenedorProductos) {
        const urlParams = new URLSearchParams(window.location.search);
        const busquedaURL = urlParams.get('q');
        if (busquedaURL) {
            ejecutarBusquedaAPI(decodeURIComponent(busquedaURL));
        }
    }
});
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
