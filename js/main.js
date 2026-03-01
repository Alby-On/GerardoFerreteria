// 1. Función para cargar componentes estáticos (Header/Footer) - ACTUALIZADA
function loadComponent(id, file) {
    return fetch(file) // Devolvemos el fetch para manejar la asincronía
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

document.addEventListener("DOMContentLoaded", () => {
    // Carga de componentes iniciales con Promesa para activar el buscador después
    Promise.all([
        loadComponent('header-placeholder', 'componentes/header.html'),
        loadComponent('footer-placeholder', 'componentes/footer.html')
    ]).then(() => {
        // Ejecutamos la búsqueda solo cuando el Header ya existe en el DOM
        inicializarBusquedaUniversal();
    });

    // 2. Lógica para las Colecciones de Shopify
    const enlaces = document.querySelectorAll('.btn-categoria');
    const contenedor = document.getElementById('shopify-products-load');
    const titulo = document.getElementById('titulo-coleccion');

    enlaces.forEach(enlace => {
        enlace.addEventListener('click', (e) => {
            e.preventDefault();
            
            const nombreArchivo = enlace.getAttribute('data-archivo');
            const nombreCategoria = enlace.textContent;

            if (titulo) titulo.textContent = nombreCategoria;
            contenedor.innerHTML = `<p>Cargando productos de ${nombreCategoria}...</p>`;

            const scriptViejo = document.getElementById('script-dinamico-shopify');
            if (scriptViejo) { scriptViejo.remove(); }

            const nuevoScript = document.createElement('script'); 
            
            nuevoScript.id = 'script-dinamico-shopify';
            nuevoScript.src = 'js/colecciones/' + nombreArchivo;
            nuevoScript.async = true;

            nuevoScript.onerror = () => {
                contenedor.innerHTML = '<p>Error: No se pudo cargar la colección de ' + nombreCategoria + '</p>';
            };

            document.body.appendChild(nuevoScript);

            enlaces.forEach(el => el.classList.remove('active'));
            enlace.classList.add('active');
        });
    });

    // 3. Lógica para detectar categoría O búsqueda desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaURL = urlParams.get('cat');
    const busquedaURL = urlParams.get('q'); // Captura parámetro de búsqueda global

    if (categoriaURL) {
        const botonAClickear = document.querySelector(`.btn-categoria[data-archivo="${categoriaURL}"]`);
        if (botonAClickear) {
            setTimeout(() => {
                botonAClickear.click();
                const target = document.getElementById('shopify-products-load');
                if(target) target.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    } else if (busquedaURL) {
        // Si venimos desde otra página con una búsqueda
        setTimeout(() => {
            const inputInterno = document.getElementById('search-input');
            if (inputInterno) {
                inputInterno.value = decodeURIComponent(busquedaURL);
                ejecutarFiltroEnTienda(decodeURIComponent(busquedaURL));
            }
        }, 500);
    }
});

// 4. Lógica de Búsqueda Global "Albyon Search" Universal
function inicializarBusquedaUniversal() {
    const inputBuscar = document.getElementById('search-input');
    const btnBuscar = document.getElementById('search-btn');

    if (btnBuscar && inputBuscar) {
        btnBuscar.addEventListener('click', () => {
            const termino = inputBuscar.value.toLowerCase().trim();
            if (termino === "") return;

            // Verificamos si estamos en la página de productos
            const esPaginaProductos = window.location.pathname.includes('productos.html');

            if (esPaginaProductos) {
                ejecutarFiltroEnTienda(termino);
            } else {
                // Redirigimos a productos con el parámetro de búsqueda
                window.location.href = `productos.html?q=${encodeURIComponent(termino)}`;
            }
        });

        inputBuscar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') btnBuscar.click();
        });
    }
}

// Función definitiva con MutationObserver para ganar a Shopify
function ejecutarFiltroEnTienda(termino) {
    const contenedor = document.getElementById('shopify-products-load');
    const term = termino.toLowerCase().trim();

    // 1. Cargamos la colección global
    cargarColeccionDesdeBusqueda('todo.js', `Resultados para: "${term}"`);

    // 2. Creamos el Vigilante (MutationObserver)
    const observer = new MutationObserver((mutations) => {
        const productos = document.querySelectorAll('.shopify-buy__product');
        
        if (productos.length > 0) {
            let encontrados = 0;

            productos.forEach(prod => {
                const tituloProd = prod.querySelector('.shopify-buy__product-title');
                
                if (tituloProd && tituloProd.textContent !== "") {
                    const nombre = tituloProd.textContent.toLowerCase();
                    
                    if (nombre.includes(term)) {
                        prod.style.setProperty('display', 'flex', 'important');
                        encontrados++;
                    } else {
                        prod.style.setProperty('display', 'none', 'important');
                    }
                }
            });

            // Si ya encontramos y filtramos productos, podemos desconectar el observador tras 5s
            // para no consumir recursos innecesarios
            setTimeout(() => observer.disconnect(), 5000);
        }
    });

    // 3. Activamos la vigilancia sobre el contenedor de productos
    observer.observe(contenedor, { childList: true, subtree: true });
}

// Función auxiliar para carga de scripts
function cargarColeccionDesdeBusqueda(archivo, tituloTexto) {
    const contenedor = document.getElementById('shopify-products-load');
    const titulo = document.getElementById('titulo-coleccion');
    
    if (titulo) titulo.textContent = tituloTexto;
    contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Buscando coincidencias...</p>`;

    const scriptViejo = document.getElementById('script-dinamico-shopify');
    if (scriptViejo) scriptViejo.remove();

    const nuevoScript = document.createElement('script');
    nuevoScript.id = 'script-dinamico-shopify';
    nuevoScript.src = 'js/colecciones/' + archivo;
    nuevoScript.async = true;
    document.body.appendChild(nuevoScript);
}
