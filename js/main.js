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

// Función auxiliar para filtrar (solo corre en productos.html)
function ejecutarFiltroEnTienda(termino) {
    // 1. Cargamos la colección "todo.js"
    cargarColeccionDesdeBusqueda('todo.js', `Resultados para: "${termino}"`);

    let intentos = 0;
    const intervaloBusqueda = setInterval(() => {
        // Buscamos las tarjetas de producto
        const productos = document.querySelectorAll('.shopify-buy__product');
        intentos++;

        if (productos.length > 0) {
            let encontrados = 0;

            productos.forEach(prod => {
                // Buscamos el título dentro de la tarjeta
                const tituloProd = prod.querySelector('.shopify-buy__product-title');
                
                if (tituloProd) {
                    const nombre = tituloProd.textContent.toLowerCase();
                    
                    if (nombre.includes(termino.toLowerCase())) {
                        // Si coincide, lo mostramos como flex
                        prod.style.setProperty('display', 'flex', 'important');
                        encontrados++;
                    } else {
                        // Si NO coincide, lo ocultamos totalmente
                        prod.style.setProperty('display', 'none', 'important');
                    }
                }
            });

            // Si ya procesamos los productos, detenemos el reloj
            if (intentos > 5) { 
                clearInterval(intervaloBusqueda); 
                // Si no hubo coincidencias, avisamos al usuario
                if (encontrados === 0) {
                    document.getElementById('shopify-products-load').innerHTML = 
                        `<p style="grid-column: 1/-1; text-align: center;">No se encontraron productos que coincidan con "${termino}".</p>`;
                }
            }
        }

        // Timer de seguridad: si en 10 segundos no carga nada, paramos
        if (intentos > 20) clearInterval(intervaloBusqueda);
    }, 600); // Aumentamos ligeramente el tiempo de espera para el renderizado
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
