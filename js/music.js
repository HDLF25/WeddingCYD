document.addEventListener("DOMContentLoaded", function () {
    let musica = document.getElementById("musicaFondo");
    let boton = document.getElementById("btnMusica");

    // Intentar reproducir la música automáticamente
    /* let playPromise = musica.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                // Éxito: Cambia el icono a "pausa"
                boton.innerHTML = '<i class="bi bi-pause"></i>';
            })
            .catch(() => {
                // Fallo: El navegador bloqueó el autoplay, mostrar botón
                console.warn("El navegador bloqueó el autoplay. Esperando interacción del usuario.");
            });
    } */

    boton.addEventListener("click", function () {
        if (musica.paused) {
            musica.play();
            boton.innerHTML = '<i class="bi bi-pause"></i>'; // Cambia a icono de pausa
        } else {
            musica.pause();
            boton.innerHTML = '<i class="bi bi-play-fill"></i>'; // Cambia a icono de música
        }
    });
});
