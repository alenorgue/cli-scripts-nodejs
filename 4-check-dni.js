const fs = require('fs');
const path = require('path');

// Función para validar DNI español
function validarDNI(dni) {
    const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
    const dniRegex = /^(\d{8})([A-Z])$/i;
    const match = dni.match(dniRegex);

    if (!match) return false;

    const numero = parseInt(match[1]);
    const letra = match[2].toUpperCase();
    const letraCorrecta = letras[numero % 23];

    return letra === letraCorrecta;
}

// Función para registrar resultado en el log JSON, con historial
function escribirLogJSON(dni, resultado) {
    const logPath = path.join(__dirname, 'resultados.json');
    const fecha = new Date().toISOString();
    let logData = [];

    if (fs.existsSync(logPath)) {
        try {
            const contenido = fs.readFileSync(logPath, 'utf8');
            logData = JSON.parse(contenido);
        } catch (err) {
            console.error("⚠️ Error al leer el log JSON, se sobrescribirá:", err.message);
        }
    }

    const index = logData.findIndex(entry => entry.dni === dni);

    if (index !== -1) {
        // Ya existe una entrada previa, actualizamos historial
        const entrada = logData[index];

        // Guardamos el resultado anterior en el historial
        entrada.historial = entrada.historial || [];
        entrada.historial.push({
            fecha: entrada.fechaUltimaConsulta,
            resultado: entrada.resultadoActual
        });

        // Actualizamos con la nueva info
        entrada.fechaUltimaConsulta = fecha;
        entrada.resultadoActual = resultado;
    } else {
        // Es una nueva entrada
        logData.push({
            dni,
            fechaUltimaConsulta: fecha,
            resultadoActual: resultado,
            historial: []
        });
    }

    try {
        fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    } catch (err) {
        console.error("❌ Error al escribir en el log JSON:", err.message);
    }
}

// Función que comprueba un solo DNI
function comprobarUnDNI(dniInput, data) {
    const dni = dniInput.toUpperCase().trim();

    if (!validarDNI(dni)) {
        const mensaje = `❌ El DNI '${dni}' no es válido.`;
        console.error(mensaje);
        escribirLogJSON(dni, "DNI inválido");
        return;
    }

    const lineas = data.split(/\r?\n/);
    for (const linea of lineas) {
        const [dniArchivo, cantidad] = linea.trim().split(",");

        if (dniArchivo && dniArchivo.toUpperCase() === dni) {
            const mensaje = `✅ El contribuyente ${dni} le toca pagar ${cantidad}`;
            console.log(mensaje);
            escribirLogJSON(dni, `Debe pagar ${cantidad}`);
            return;
        }
    }

    const mensaje = `✅ El contribuyente ${dni} no le toca pagar`;
    console.log(mensaje);
    escribirLogJSON(dni, "No le toca pagar");
}

// Función principal para múltiples DNIs
function comprobarVariosDNIs(dnis) {
    const filePath = path.join(__dirname, 'dnis_con_deuda.txt');

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        for (const dni of dnis) {
            comprobarUnDNI(dni, data);
        }
    } catch (err) {
        console.error("❌ Error al leer el archivo:", err.message);
        dnis.forEach(dni => escribirLogJSON(dni, "Error al leer archivo"));
    }
}

// Obtener DNIs desde línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Uso: node 4-check-dni <DNI1> [DNI2] [DNI3] ...");
    process.exit(1);
}

comprobarVariosDNIs(args);
