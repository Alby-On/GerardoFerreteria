document.addEventListener('click', function (e) {
    // Verificamos si lo que clickeamos es un botón de categoría
    if (e.target.classList.contains('btn-categoria')) {
        e.preventDefault();
        
        const filtro = e.target.getAttribute('data-categoria');
        const productos = document.querySelectorAll('.tarjeta-oferta');

        productos.forEach(prod => {
            // Si el filtro es el mismo que la categoría del producto
            if (prod.getAttribute('data-categoria') === filtro) {
                prod.style.display = "block";
            } else {
                prod.style.display = "none";
            }
        });
    }
});
