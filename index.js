const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const qrcode = require('qrcode-terminal');
const path = require('path');
const { exec } = require('child_process');

// Función para ejecutar TRVideo.js
function runTRVideo() {
    exec('node TikiModule/TRVideo.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al ejecutar TRVideo.js: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

// Ejecutar TRVideo antes de iniciar el bot
runTRVideo();

// Crear el cliente de WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true // Ejecutar el navegador en segundo plano
    }
});

// Generar el código QR para la autenticación
client.on('qr', (qr) => {
    console.log('QR recibido, escanéalo con tu teléfono.');
    qrcode.generate(qr, { small: true });
});

// Confirmar que el cliente está listo
client.on('ready', () => {
    console.log('Client is ready!');
    // Importar y ejecutar el módulo de detección de mensajes
    require(path.join(__dirname, 'TikiModule', 'MSJDetect'))(client);
    // Importar y ejecutar el módulo de registro
    require(path.join(__dirname, 'TikiModule', 'Tregister'))(client);

    // Configurar la ejecución periódica de TRVideo cada 5 minutos
    setInterval(runTRVideo, 5 * 60 * 1000);
});

// Inicializar el cliente
client.initialize();
