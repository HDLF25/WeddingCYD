// Fecha de la boda (Ajusta esta fecha con la de tu evento)
var weddingDate = new Date("Oct 18, 2025 16:00:00").getTime();

// Actualiza la cuenta regresiva cada 1 segundo
var countdown = setInterval(function() {

    // Obtiene la fecha y hora actual
var now = new Date().getTime();

// Encuentra la diferencia entre la fecha de la boda y la fecha actual
var timeRemaining = weddingDate - now;

// Cálculos para días, horas, minutos y segundos
var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

// Muestra el resultado en el elemento con id="countdown"
//document.getElementById("countdown").innerHTML = "Quedan " + days + " días, " + hours + " hrs, " + minutes + " mins y " + seconds + " segs. ";
document.getElementById("countdown_days").innerHTML = days;
document.getElementById("countdown_hours").innerHTML = hours;
document.getElementById("countdown_minutes").innerHTML = minutes;
document.getElementById("countdown_seconds").innerHTML = seconds;

// Si la cuenta regresiva ha terminado, muestra un mensaje
if (timeRemaining < 0) {
    clearInterval(countdown);
    document.getElementById("countdown").innerHTML = "¡Ya nos casamos!";
}
}, 1000);