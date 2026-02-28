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
            
            const archivo = enlace.getAttribute('data-archivo');
            const nombreCategoria = enlace.textContent;

            // Actualizar interfaz
            if (titulo) titulo.textContent = nombreCategoria;
            contenedor.innerHTML = `<p>Cargando productos de ${nombreCategoria}...</p>`;

            // Remover script de colección anterior si existe
            const scriptViejo = document.getElementById('script-dinamico-shopify');
            if (scriptViejo) { scriptViejo.remove(); }

            // Crear y cargar el nuevo script de la colección
            const nombreArchivo = enlace.getAttribute('data-archivo');
            nuevoScript.id = 'script-dinamico-shopify';
            nuevoScript.src = 'js/colecciones/' + nombreArchivo;
            nuevoScript.async = true;

            // Manejo de error si el archivo .js no existe
            nuevoScript.onerror = () => {
                contenedor.innerHTML = '<p>Error: No se pudo cargar la colección de ' + nombreCategoria + '</p>';
            };

            document.body.appendChild(nuevoScript);

            // Estilo visual del menú (opcional)
            enlaces.forEach(el => el.classList.remove('active'));
            enlace.classList.add('active');
        });
    });
});
