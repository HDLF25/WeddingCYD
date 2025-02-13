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
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYmNha3NpbW5zdWZsY3BjbnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MTU5OTAsImV4cCI6MjA1NDI5MTk5MH0.nicW59e5cZh-Vq8IN-DwIOpskwKg_FAlAeCiiyjmBeA";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function validarCodigo() {
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

    let guestNameClean = guestName.replace(/ y Flia/i, "").trim();

    for (let i = 0; i < amountGuest; i++) {
        let div = document.createElement("div");
        div.classList.add("mb-3", "p-3", "col-sm-4");
        
        let nombreInvitado = (i === 0) ? guestNameClean : "";
        
        div.innerHTML = `
            <label class="form-label"><b>• Invitado N°${i + 1}:</b></label>
            <input type="text" class="form-control mb-2" value="${nombreInvitado}" placeholder="Nombre del invitado ${i + 1}" required>

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

        listaInvitados.appendChild(div);
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
    let listaInvitados = document.getElementById("listaInvitados").children;
    let confirmaciones = [];
    let privateCode = document.getElementById("codigo").value;

    for (let invitado of listaInvitados) {
        let idGuest = invitado.getAttribute("data-idguest") || null;
        let guestNameInput = invitado.querySelector("input[type='text']");
        let asistencia = invitado.querySelector("input[type=radio]:checked");

        if (!asistencia) {
            mostrarToast("Por favor, selecciona una opción para cada invitado.", "danger");
            return;
        }

        let guestName = guestNameInput ? guestNameInput.value.trim() : "";
        
        if (asistencia.value === "true" && guestName === "") {
            mostrarToast("El nombre del invitado no puede estar vacío si asistirá.", "danger");
            return;
        }

        if (asistencia.value === "false" && guestName === "") {
            guestName = "Null";
        }

        confirmaciones.push({
            idguest: idGuest ? parseInt(idGuest) : null,
            guestname: guestName,
            privatecodeused: privateCode.trim(),
            confirmed: asistencia.value === "true",
        });
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

    mostrarToast("¡Confirmación enviada con éxito!", "success");
    setTimeout(() => location.reload(), 3000);
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
