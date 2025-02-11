const SUPABASE_URL = "https://kdbcaksimnsuflcpcnps.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYmNha3NpbW5zdWZsY3BjbnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MTU5OTAsImV4cCI6MjA1NDI5MTk5MH0.nicW59e5cZh-Vq8IN-DwIOpskwKg_FAlAeCiiyjmBeA";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let codigoIngresado = null;
let nombrePrincipal = "";
let cantidadInvitadosExtra = 0;
let invitadosExtras = [];
let opcionSeleccionada = null;

async function validarCodigo() {
    const codigo = document.getElementById("codigo").value;
    const mensaje = document.getElementById("mensaje");
    const detalle = document.getElementById("detalle");
    const extraInvitados = document.getElementById("extraInvitados");
    document.getElementById("errorMensaje").textContent = "";

    extraInvitados.innerHTML = "";

    if (!codigo || isNaN(codigo) || codigo <= 0) {
        mensaje.textContent = "Ingrese un código válido.";
        mensaje.style.color = "red";
        return;
    }

    try {
        const { data, error } = await supabase
            .from("guests")
            .select("id, guest, amountguest, isconfirmed")
            .eq("privatecode", codigo)
            .single();

            
        if (error && error.code !== "PGRST116") {
            console.error(error);
            mensaje.textContent = "Error al consultar la base de datos.";
            mensaje.style.color = "red";
            return;
        }

        if (data) {
            codigoIngresado = data.id;
            nombrePrincipal = data.guest;
            cantidadInvitadosExtra = data.amountguest - 1;

            if (data.isconfirmed) {
                document.getElementById("infoInvitado").classList.add("d-none");
                mensaje.textContent = `${data.guest} ya ha confirmado su asistencia.`;
                mensaje.style.color = "green";
                detalle.textContent = "";
            } else {
                document.getElementById("infoInvitado").classList.remove("d-none");
                mensaje.textContent = `Bienvenido/a, ${data.guest}`;
                mensaje.style.color = "black";
                const amountguest = data.amountguest;
                if (amountguest == 1) {
                    detalle.textContent = `Invitación válida para ${data.amountguest} persona`;
                } else {
                    detalle.textContent = `Invitación válida para ${data.amountguest} personas`;
                }

                if (cantidadInvitadosExtra > 0) {
                    extraInvitados.innerHTML = "<h5>Ingresa los nombres de tus acompañantes:</h5>";
                    for (let i = 1; i <= cantidadInvitadosExtra; i++) {
                        extraInvitados.innerHTML += `
                            <input type="text" id="invitado${i}" class="form-control mt-2" placeholder="Nombre del invitado ${i + 1}">
                        `;
                    }
                }
            }
        } else {
            mensaje.textContent = "Código no encontrado. ❌";
            mensaje.style.color = "red";
            detalle.textContent = "";
        }
    } catch (err) {
        console.error(err);
        mensaje.textContent = "Ocurrió un error inesperado.";
        mensaje.style.color = "red";
    }
}

function seleccionarOpcion(asiste) {
    opcionSeleccionada = asiste;
    document.getElementById("errorMensaje").textContent = "";
}

// Función para enviar confirmación
async function enviarConfirmacion() {
    if (opcionSeleccionada === null) {
        document.getElementById("errorMensaje").textContent = "Seleccione una opción.";
        return;
    }

    invitadosExtras = [];
    for (let i = 1; i <= cantidadInvitadosExtra; i++) {
        const nombre = document.getElementById(`invitado${i}`)?.value.trim();
        if (nombre) invitadosExtras.push(nombre);
    }

    try {
        let insertData = [{ idguest: codigoIngresado, guestname: nombrePrincipal, confirmed: opcionSeleccionada }];

        if (opcionSeleccionada && invitadosExtras.length > 0) {
            invitadosExtras.forEach((nombre) => {
                insertData.push({ idguest: codigoIngresado, guestname: nombre, confirmed: true });
            });
        }

        const { error } = await supabase.from("guestconfirmed").insert(insertData);

        if (error) {
            console.error(error);
            alert("Error al registrar la asistencia.");
            return;
        }

        alert(opcionSeleccionada ? "¡Asistencia confirmada! 🎉" : "Lamentamos que no puedas asistir. 😢");
        location.reload();
    } catch (err) {
        console.error(err);
        alert("Ocurrió un error inesperado.");
    }
}
