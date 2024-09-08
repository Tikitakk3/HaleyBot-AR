const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const copyFile = promisify(fs.copyFile);

const sourceDir = path.join(__dirname, '..', 'TikiMP4');
const destDir = path.join(__dirname, '..', 'temp');
const destFile = path.join(destDir, 'video.mp4');

// Función para seleccionar un archivo aleatorio
function getRandomFile(files) {
    return files[Math.floor(Math.random() * files.length)];
}

// Función principal
async function selectAndCopyRandomVideo() {
    try {
        // Leer los archivos de la carpeta de origen
        const files = await fs.promises.readdir(sourceDir);

        // Filtrar solo los archivos .mp4
        const mp4Files = files.filter(file => path.extname(file).toLowerCase() === '.mp4');

        if (mp4Files.length === 0) {
            console.log('No se encontraron archivos .mp4 en la carpeta TikiMP4.');
            return;
        }

        // Seleccionar un archivo aleatorio
        const randomFile = getRandomFile(mp4Files);
        const sourceFile = path.join(sourceDir, randomFile);

        // Crear la carpeta de destino si no existe
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
        }

        // Copiar el archivo al destino con el nombre video.mp4
        await copyFile(sourceFile, destFile);
        console.log(`Archivo ${randomFile} copiado a ${destFile} como video.mp4`);

        // Terminar el proceso
        process.exit(0);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
}

// Ejecutar la función
selectAndCopyRandomVideo();
