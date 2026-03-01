// Este archivo maneja el filtrado de productos por categoría
document.addEventListener('DOMContentLoaded', () => {
    const botones = document.querySelectorAll('.btn-categoria');
    const tarjetas = document.querySelectorAll('.tarjeta-oferta');

    botones.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Obtenemos la categoría del botón (ej: Herramientas)
            const categoriaSeleccionada = boton.getAttribute('data-categoria');

            tarjetas.forEach(tarjeta => {
                const categoriaTarjeta = tarjeta.getAttribute('data-categoria');

                // Si la categoría coincide, la mostramos. Si no, la ocultamos.
                if (categoriaTarjeta === categoriaSeleccionada) {
                    tarjeta.style.display = "block";
                    tarjeta.style.opacity = "1";
                    tarjeta.style.transform = "scale(1)";
                } else {
                    tarjeta.style.display = "none";
                    tarjeta.style.opacity = "0";
                }
            });
        });
    });
});
