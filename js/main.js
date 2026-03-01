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

// NUEVA FUNCIÓN: Control visual del carrito lateral
window.toggleCarrito = function() {
    const sidebar = document.getElementById('carrito-lateral');
    const overlay = document.getElementById('carrito-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('visible');
        
        // Si se abre, actualizamos el contenido desde Shopify
        if (sidebar.classList.contains('open')) {
            actualizarVisualizacionCarro();
        }
    }
};

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
    // 1. Carga de componentes dinámicos
    Promise.all([
        loadComponent('header-placeholder', 'components/header.html'),
        loadComponent('footer-placeholder', 'components/footer.html'),
        loadComponent('whatsapp-placeholder', 'components/whatsapp.html'),
        loadComponent('carrito-placeholder', 'components/carro_compras.html')
    ]).then(() => {

        // ================================
        // INICIALIZACIONES GENERALES
        // ================================

        inicializarBusquedaUniversal();

        // --- LLAMADA AUTOMÁTICA DEL CARRITO ---
        // Esto hace que el número aparezca sin hacer clic
        if (localStorage.getItem('shopify_cart_id')) {
            actualizarVisualizacionCarro();
        }

        // ================================
        // EVENTOS DEL CARRITO
        // ================================

        // Botón para ABRIR (está en header.html)
        const btnAbrir = document.getElementById('cart-button'); 
        if (btnAbrir) {
            btnAbrir.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCarrito();
            });
        }

        // Evento para CERRAR al hacer clic en el fondo oscuro (overlay)
        const overlay = document.getElementById('carrito-overlay');
        if (overlay) {
            overlay.addEventListener('click', toggleCarrito);
        }

        // ================================
        // CATEGORÍAS
        // ================================

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

        // --- ACTIVAR CATEGORÍA DESDE URL (?cat=algo) ---
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

    // ========================================
    // 2. LÓGICA DE CARGA DE PRODUCTOS
    // ========================================

    const contenedorOfertas = document.getElementById('carrusel-ofertas');
    if (contenedorOfertas) {
        ejecutarCargaOfertasInicio();
    }

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

// --- NUEVA LÓGICA DEL CARRITO LATERAL ---

// 1. Abrir y Cerrar el panel
window.toggleCarrito = function() {
    const sidebar = document.getElementById('carrito-lateral');
    const overlay = document.getElementById('carrito-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('visible');
        
        // Si se abre, refrescamos los productos desde Shopify
        if (sidebar.classList.contains('open')) {
            actualizarVisualizacionCarro();
        }
    }
};

// 2. Redirigir al checkout de Shopify (Mantenemos tu lógica)
window.irAPagar = function() {
    const url = localStorage.getItem('shopify_checkout_url');
    if (url) {
        window.location.href = url;
    } else {
        alert("El carrito está vacío o no se ha generado el checkout.");
    }
}

async function actualizarVisualizacionCarro() {
    const cartId = localStorage.getItem('shopify_cart_id');
    if (!cartId) return;

    const query = `{
      cart(id: "${cartId}") {
        totalQuantity
        checkoutUrl
        cost { totalAmount { amount } }
        lines(first: 20) {
          edges {
            node {
              id
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

    // ================================
    // SI SHOPIFY DEVUELVE NULL
    // ================================
    if (!cart) {
        localStorage.removeItem('shopify_cart_id');

        const countEl = document.getElementById('cart-count');
        if (countEl) {
            countEl.textContent = '0';
            countEl.style.display = 'none';
        }

        return;
    }

    // ================================
    // GUARDAR CHECKOUT URL
    // ================================
    localStorage.setItem('shopify_checkout_url', cart.checkoutUrl);

    // ================================
    // ACTUALIZAR CONTADOR HEADER
    // ================================
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.textContent = cart.totalQuantity;
        countEl.style.display = cart.totalQuantity > 0 ? 'inline-block' : 'none';
    }

    // ================================
    // ACTUALIZAR TOTAL
    // ================================
    const totalEl = document.getElementById('carrito-total-monto');
    if (totalEl) {
        const total = Number(cart.cost.totalAmount.amount);
        totalEl.textContent = `$${Math.round(total).toLocaleString('es-CL')}`;
    }

    // ================================
    // ACTUALIZAR LISTA LATERAL
    // ================================
    const listContainer = document.getElementById('carrito-items-lista');
    if (!listContainer) return;

    if (cart.lines.edges.length === 0) {
        listContainer.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
        return;
    }

    listContainer.innerHTML = '';

    cart.lines.edges.forEach(item => {
        const prod = item.node.merchandise;
        const lineId = item.node.id;
        const qty = item.node.quantity;
        const price = Number(prod.price.amount);
        const imageUrl = prod.image ? prod.image.url : '';

        const div = document.createElement('div');
        div.style.cssText = 'display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; gap: 10px;';

        div.innerHTML = `
            <img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            <div style="flex-grow: 1;">
                <div style="font-weight: bold; font-size: 0.9rem; color: #333;">${prod.product.title}</div>
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                    <div style="display: flex; border: 1px solid #ddd; border-radius: 4px;">
                        <button onclick="cambiarCantidad('${lineId}', ${qty - 1})" style="padding: 2px 8px; border: none; cursor: pointer;">-</button>
                        <span style="padding: 2px 8px; font-size: 0.8rem;">${qty}</span>
                        <button onclick="cambiarCantidad('${lineId}', ${qty + 1})" style="padding: 2px 8px; border: none; cursor: pointer;">+</button>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: bold;">
                        $${Math.round(price * qty).toLocaleString('es-CL')}
                    </span>
                </div>
            </div>
            <button onclick="quitarProducto('${lineId}')" 
                style="background: none; border: none; color: #e63946; cursor: pointer; font-size: 1.1rem;" 
                title="Quitar producto">🗑️</button>
        `;

        listContainer.appendChild(div);
    });
}
// Función para sumar o restar
window.cambiarCantidad = async function(lineId, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
        quitarProducto(lineId);
        return;
    }
    const cartId = localStorage.getItem('shopify_cart_id');
    const mutation = `mutation { cartLinesUpdate(cartId: "${cartId}", lines: [{ id: "${lineId}", quantity: ${nuevaCantidad} }]) { cart { id } } }`;
    await queryShopify(mutation);
    actualizarVisualizacionCarro();
};

// Función para ELIMINAR totalmente
window.quitarProducto = async function(lineId) {
    const cartId = localStorage.getItem('shopify_cart_id');
    const mutation = `mutation { cartLinesRemove(cartId: "${cartId}", lineIds: ["${lineId}"]) { cart { id } } }`;
    await queryShopify(mutation);
    actualizarVisualizacionCarro();
};
