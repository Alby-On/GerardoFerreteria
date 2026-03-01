// 1. Función para cargar componentes estáticos (Header/Footer) - ACTUALIZADA CON RETURN
function loadComponent(id, file) {
    return fetch(file) // Agregado return para poder encadenar la carga
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
    // Carga de componentes iniciales y activación de búsqueda tras carga
    Promise.all([
        loadComponent('header-placeholder', 'componentes/header.html'),
        loadComponent('footer-placeholder', 'componentes/footer.html')
    ]).then(() => {
        // Ejecutamos la búsqueda solo después de que el HTML del Header exista
        inicializarBusquedaAlbyon();
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

            // Actualizar interfaz
            if (titulo) titulo.textContent = nombreCategoria;
            contenedor.innerHTML = `<p>Cargando productos de ${nombreCategoria}...</p>`;

            // Remover script de colección anterior si existe
            const scriptViejo = document.getElementById('script-dinamico-shopify');
            if (scriptViejo) { scriptViejo.remove(); }

            // --- AQUÍ ESTÁ EL ARREGLO ---
            const nuevoScript = document.createElement('script'); 
            
            nuevoScript.id = 'script-dinamico-shopify';
            nuevoScript.src = 'js/colecciones/' + nombreArchivo;
            nuevoScript.async = true;

            // Manejo de error si el archivo .js no existe
            nuevoScript.onerror = () => {
                contenedor.innerHTML = '<p>Error: No se pudo cargar la colección de ' + nombreCategoria + '</p>';
            };

            document.body.appendChild(nuevoScript);

            // Estilo visual del menú
            enlaces.forEach(el => el.classList.remove('active'));
            enlace.classList.add('active');
        });
    });

    // 3. Lógica para detectar categoría desde la URL (Navegación externa)
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaURL = urlParams.get('cat');

    if (categoriaURL) {
        const botonAClickear = document.querySelector(`.btn-categoria[data-archivo="${categoriaURL}"]`);
        
        if (botonAClickear) {
            setTimeout(() => {
                botonAClickear.click();
                const target = document.getElementById('shopify-products-load');
                if(target) target.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }
});

// 4. Lógica de Búsqueda Global "Albyon Search" encapsulada
function inicializarBusquedaAlbyon() {
    const inputBuscar = document.getElementById('search-input');
    const btnBuscar = document.getElementById('search-btn');

    if (btnBuscar && inputBuscar) {
        btnBuscar.addEventListener('click', () => {
            const termino = inputBuscar.value.toLowerCase().trim();
            
            if (termino === "") return;

            // Disparamos la carga de la colección maestra
            cargarColeccionDesdeBusqueda('todo.js', `Resultados para: "${termino}"`);

            // Esperamos a que los productos aparezcan para filtrar
            const intervaloBusqueda = setInterval(() => {
                const productos = document.querySelectorAll('.shopify-buy__product');
                
                if (productos.length > 0) {
                    productos.forEach(prod => {
                        const nombreElemento = prod.querySelector('.shopify-buy__product-title');
                        if (nombreElemento) {
                            const nombre = nombreElemento.textContent.toLowerCase();
                            // Forzamos el display para ganar a los estilos inline de Shopify
                            prod.style.setProperty('display', nombre.includes(termino) ? 'flex' : 'none', 'important');
                        }
                    });
                    clearInterval(intervaloBusqueda);
                }
            }, 500); 
        });

        // Extra: Buscar al presionar Enter
        inputBuscar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') btnBuscar.click();
        });
    }
}

// Función auxiliar para no repetir código de carga
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
