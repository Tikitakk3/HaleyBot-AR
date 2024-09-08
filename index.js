const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const qrcode = require('qrcode-terminal');
const path = require('path');

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
});

// Inicializar el cliente
client.initialize();
