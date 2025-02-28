function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

document.addEventListener("DOMContentLoaded", function () {
    const codigo = getParameterByName("pc");
    if (codigo) {
        document.getElementById("codigo").value = codigo;
    }
});

const SUPABASE_URL = "https://kdbcaksimnsuflcpcnps.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYmNha3NpbW5zdWZsY3BjbnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MTU5OTAsImV4cCI6MjA1NDI5MTk5MH0.nicW59e5cZh-Vq8IN-DwIOpskwKg_FAlAeCiiyjmBeA";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function validarCodigo() {
    document.getElementById("codetitle").style.display = "none";
    document.getElementById("codigo").style.display = "none";
    document.getElementById("btnValidate").style.display = "none";
    let codigo = document.getElementById("codigo").value;

    if (!codigo) {
        alert("Por favor, ingresa un código.");
        return;
    }

    let { data, error } = await supabase.from("guests").select("id, guest, amountguest, isconfirmed").eq("privatecode", codigo);

    if (error || !data || data.length === 0) {
        alert("Código no válido.");
        return;
    }

    let isConfirmed = data[0].isconfirmed;
    let guestName = data[0].guest;
    let amountGuest = data[0].amountguest;

    let listaInvitados = document.getElementById("listaInvitados");
    listaInvitados.innerHTML = "";

    if (isConfirmed) {
        listaInvitados.innerHTML = `<h3 class="text-success text-center">Ya se confirmó la asistencia!</h3>`;
        document.getElementById("infoInvitados").classList.remove("d-none");
        return;
    }

    listaInvitados.innerHTML = `<h3 class="text-center"><b>Bienvenido,<br>${guestName}</b></h3>`;
    listaInvitados.innerHTML += `<h4 class="text-center mb-3">Lista de Invitados</h4>`;
    listaInvitados.innerHTML += `<p class="text-center">Invitación válida para ${amountGuest} persona(s)</p>`;

    for (let i = 0; i < amountGuest; i++) {
        let invitado = data[i] || { id: null, guest: "" };
        let nombreInvitado = invitado.guest.replace(/ y flia/i, "").trim();

        let div = document.createElement("div");
        div.classList.add("mb-3", "p-3", "col-sm-4");
        div.setAttribute("data-idguest", invitado.id || `nuevo-${i}`);

        div.innerHTML = `
            <label class="form-label"><b>• Invitado N°${i + 1}:</b></label>
            <input type="text" class="form-control mb-2" value="${nombreInvitado}" placeholder="Nombre del invitado">

            <h6>¿Asistirá?</h6>
            <div class="d-inline-block text-start">
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="asistencia_${i}" value="true">
                    <label class="form-check-label">Sí, asistiré</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="asistencia_${i}" value="false">
                    <label class="form-check-label">No podré asistir</label>
                </div>
            </div>
        `;

        console.log("Div agregado con data-idguest:", div);

        listaInvitados.appendChild(div);

        // 🎯 Lógica para manejar el comportamiento del input
        let nombreInput = div.querySelector(".nombre-invitado");
        let radios = div.querySelectorAll(".asistencia-radio");

        radios.forEach((radio) => {
            radio.addEventListener("change", function () {
                if (this.value === "false") {
                    if (nombreInput.value.trim() === "") {
                        nombreInput.value = "Invitado";
                    }
                    nombreInput.disabled = true;
                } else {
                    nombreInput.disabled = false;
                }
            });
        });
    }

    if (!isConfirmed) {
        let button = document.createElement("button");
        button.classList.add("btn", "btn-outline-primary", "w-100", "mt-3");
        button.textContent = "Enviar";
        button.onclick = enviarConfirmacion;
        listaInvitados.appendChild(button);
    }

    document.getElementById("infoInvitados").classList.remove("d-none");
}

async function enviarConfirmacion() {
    let listaInvitados = document.querySelectorAll("#listaInvitados > div[data-idguest]");
    let confirmaciones = [];
    let privateCode = document.getElementById("codigo").value;

    if (listaInvitados.length === 0) {
        mostrarToast("No hay invitados para confirmar.", "danger");
        return;
    }
    
    // ✅ Recuperamos el mismo ID para todos los invitados
    let idGuestPrincipal = listaInvitados[0].getAttribute("data-idguest");
    if (!idGuestPrincipal) {
        mostrarToast("Error al obtener el ID del invitado principal.", "danger");
        return;
    }
    idGuestPrincipal = parseInt(idGuestPrincipal);

    for (let invitado of listaInvitados) {
        let guestNameInput = invitado.querySelector("input[type='text']");
        let asistencia = invitado.querySelector("input[type=radio]:checked");

        if (!asistencia) {
            mostrarToast("Por favor, selecciona una opción para cada invitado.", "danger");
            return;
        }

        let guestName = guestNameInput ? guestNameInput.value.trim() : "Invitado";

        if (asistencia.value === "true" && guestName === "") {
            mostrarToast("El nombre del invitado no puede estar vacío si asistirá.", "danger");
            return;
        }

        if (asistencia.value === "false" && guestName === "") {
            guestName = "Null";
        }

        let confirmacion = {
            idguest: idGuestPrincipal,
            guestname: guestName,
            privatecodeused: privateCode,
            confirmed: asistencia.value === "true",
        };

        console.log("Datos a insertar:", confirmacion);
        confirmaciones.push(confirmacion);
    }

    let { error: insertError } = await supabase.from("guestsconfirmed").insert(confirmaciones);
    if (insertError) {
        console.error("Error al insertar en guestsconfirmed:", insertError);
        mostrarToast("Hubo un error al guardar la confirmación.", "danger");
        return;
    }

    let { error: updateError } = await supabase.from("guests").update({ isconfirmed: true }).eq("privatecode", privateCode);
    if (updateError) {
        console.error("Error al actualizar guests:", updateError);
        mostrarToast("Error al actualizar la asistencia.", "danger");
        return;
    }
    validarCodigo();
    mostrarToast("¡Confirmación enviada con éxito!", "success");
}

function mostrarToast(mensaje, tipo) {
    let toastElement = document.getElementById("toastConfirmacion");
    let toastBody = toastElement.querySelector(".toast-body");
    toastBody.textContent = mensaje;
    toastElement.classList.remove("bg-success", "bg-danger");
    toastElement.classList.add(`bg-${tipo}`);

    let toast = new bootstrap.Toast(toastElement);
    toast.show();
}

document.addEventListener("DOMContentLoaded", function () {
    const inputCodigo = document.getElementById("codigo");
    const codigo = getParameterByName("pc") || document.getElementById("codigo").value.trim();

    if (codigo) {
        document.getElementById("codigo").value = codigo;
        validarCodigo();
    }

    if (inputCodigo) {
        inputCodigo.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                validarCodigo();
            }
        });
    } else {
        console.error('El input con id="codigo" no se encontró en el DOM.');
    }
});