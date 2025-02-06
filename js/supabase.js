const SUPABASE_URL = "https://kdbcaksimnsuflcpcnps.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkYmNha3NpbW5zdWZsY3BjbnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MTU5OTAsImV4cCI6MjA1NDI5MTk5MH0.nicW59e5cZh-Vq8IN-DwIOpskwKg_FAlAeCiiyjmBeA";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function validarCodigo() {
    const codigo = document.getElementById("codigo").value;
    const resultado = document.getElementById("resultado");

    // Verificar si el campo está vacío o no es un número válido
    if (!codigo || isNaN(codigo) || codigo <= 0) {
        resultado.textContent = "Ingrese un código válido.";
        resultado.style.color = "red";
        return;
    }

    try {
        // Consultar en la tabla "invitados" si existe el código ingresado
        const { data, error } = await supabase
            .from("guests")
            .select("id") // Seleccionamos solo el ID por eficiencia
            .eq("private_code", codigo)
            .single(); // single() para obtener solo un resultado

        if (error && error.code !== "PGRST116") {
            // Ignoramos error de "no data found"
            console.error(error);
            resultado.textContent = "Error al consultar la base de datos.";
            resultado.style.color = "red";
            return;
        }

        if (data) {
            resultado.textContent = "El código es válido. 🎉";
            resultado.style.color = "green";
        } else {
            resultado.textContent = "Código no encontrado. ❌";
            resultado.style.color = "red";
        }
    } catch (err) {
        console.error(err);
        resultado.textContent = "Ocurrió un error inesperado.";
        resultado.style.color = "red";
    }
}