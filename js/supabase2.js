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
    if (error) {
        console.error("Error al buscar invitados:", error);
        alert("Error al validar el código.");
        return;
    }
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
    
    listaInvitados.innerHTML = `<h4 class="text-center mb-3">Lista de Invitados</h4>`;
    listaInvitados.innerHTML += `<p class="text-center">Invitación válida para ${amountGuest} persona(s)</p>`;

    data.forEach((invitado, index) => {
        let div = document.createElement("div");
        div.classList.add("mb-3", "p-3", "col-sm-4");
        div.setAttribute("data-idguest", invitado.id);

        div.innerHTML = `
            <label class="form-label"><b>• Invitado N°${index + 1}:</b></label>
            <input type="text" class="form-control mb-2" value="${invitado.guest}" readonly>

            <h6>¿Asistirá?</h6>
            <div class="d-inline-block text-start">
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="asistencia_${invitado.id}" value="true">
                    <label class="form-check-label">Sí, asistiré</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="asistencia_${invitado.id}" value="false">
                    <label class="form-check-label">No podré asistir</label>
                </div>
            </div>
        `;

        listaInvitados.appendChild(div);
    });
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
        let idGuest = invitado.getAttribute("data-idguest");
        let guestName = invitado.querySelector("input").value;
        let asistencia = invitado.querySelector("input[type=radio]:checked");

        if (!asistencia) {
            alert("Por favor, selecciona una opción para cada invitado.");
            return;
        }
        confirmaciones.push({
            idguest: parseInt(idGuest),
            guestname: guestName.trim(),
            privatecodeused: privateCode.trim(),
            confirmed: asistencia.value === "true",
        });
    }
    let { error: insertError } = await supabase.from("guestsconfirmed").insert(confirmaciones);
    if (insertError) {
        console.error("Error al insertar en guestsconfirmed:", insertError);
        alert("Hubo un error al guardar la confirmación.");
        return;
    }
    let { error: updateError } = await supabase.from("guests").update({ isconfirmed: true }).eq("privatecode", privateCode);

    if (updateError) {
        console.error("Error al actualizar guests:", updateError);
        alert("Error al actualizar la asistencia en la tabla de invitados.");
    }
    let toast = new bootstrap.Toast(document.getElementById("toastConfirmacion"));
    toast.show();
    setTimeout(() => location.reload(), 3000);
}