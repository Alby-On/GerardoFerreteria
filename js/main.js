// 1. Función para cargar componentes estáticos (Header/Footer)
function loadComponent(id, file) {
    fetch(file)
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
    // Carga de componentes iniciales
    loadComponent('header-placeholder', 'componentes/header.html');
    loadComponent('footer-placeholder', 'componentes/footer.html');

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
            // Creamos la variable 'nuevoScript' antes de usarla
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
        // Buscamos el botón en el sidebar que coincida con el nombre del archivo
        const botonAClickear = document.querySelector(`.btn-categoria[data-archivo="${categoriaURL}"]`);
        
        if (botonAClickear) {
            // Un pequeño retraso de 300ms para asegurar que el DOM y los componentes estén listos
            setTimeout(() => {
                botonAClickear.click();
                
                // Opcional: Desplazar la vista hacia los productos si el catálogo está muy abajo
                const target = document.getElementById('shopify-products-load');
                if(target) target.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }
});
// 4. Lógica de Búsqueda Global "Albyon Search"
const inputBuscar = document.getElementById('search-input');
const btnBuscar = document.getElementById('search-btn');

if (btnBuscar) {
    btnBuscar.addEventListener('click', () => {
        const termino = inputBuscar.value.toLowerCase().trim();
        
        if (termino === "") return;

        // 1. Forzamos la carga de la colección maestra "todo.js"
        // (Debes tener este archivo en js/colecciones/todo.js)
        const botonTodo = document.createElement('a');
        botonTodo.setAttribute('data-archivo', 'todo.js');
        botonTodo.textContent = "Resultados de búsqueda";
        
        // Disparamos la carga (reutilizando tu lógica de scripts dinámicos)
        cargarColeccionDesdeBusqueda('todo.js', `Resultados para: "${termino}"`);

        // 2. Esperamos a que los productos aparezcan para filtrar
        const intervaloBusqueda = setInterval(() => {
            const productos = document.querySelectorAll('.shopify-buy__product');
            
            if (productos.length > 0) {
                productos.forEach(prod => {
                    const nombre = prod.querySelector('.shopify-buy__product-title').textContent.toLowerCase();
                    // Si el nombre contiene la palabra (ej: cable), se queda. Si no, se va.
                    prod.style.display = nombre.includes(termino) ? 'flex' : 'none';
                });
                clearInterval(intervaloBusqueda);
            }
        }, 500); // Revisa cada medio segundo hasta que carguen
    });
}

// Función auxiliar para no repetir código de carga
function cargarColeccionDesdeBusqueda(archivo, tituloTexto) {
    const contenedor = document.getElementById('shopify-products-load');
    const titulo = document.getElementById('titulo-coleccion');
    
    if (titulo) titulo.textContent = tituloTexto;
    contenedor.innerHTML = `<p>Buscando coincidencias...</p>`;

    const scriptViejo = document.getElementById('script-dinamico-shopify');
    if (scriptViejo) scriptViejo.remove();

    const nuevoScript = document.createElement('script');
    nuevoScript.id = 'script-dinamico-shopify';
    nuevoScript.src = 'js/colecciones/' + archivo;
    nuevoScript.async = true;
    document.body.appendChild(nuevoScript);
}
