const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

let users = {};
let owners = [];
let registeredUsers = new Set();

// Leer el archivo de usuarios registrados al iniciar
const filePath = path.join(__dirname, '..', 'data', 'usuarios.txt');
if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');
    lines.forEach(line => {
        const [numero] = line.split(', ');
        if (numero) {
            registeredUsers.add(numero);
        }
    });
}

module.exports = (client) => {
    client.on('message', async message => {
        try {
            const chatId = message.from;
            const contact = await message.getContact();
            const phoneNumber = contact.number;

            // Verificar si el usuario ya está registrado
            if (registeredUsers.has(phoneNumber)) {
                if (message.body === '.registrar') {
                    await message.reply('Ya estás registrado y no puedes usar el comando .registrar nuevamente.');
                }
                return;
            }

            if (!users[chatId]) {
                users[chatId] = { step: 0, data: { numero: phoneNumber } };
            }

            const user = users[chatId];

            if (message.body === '.registrar') {
                user.step = 1;
                await message.reply('Por favor, envía tu nombre para registrarte.');
            } else if (user.step === 1) {
                user.data.nombre = message.body;
                user.step = 2;
                await message.reply('Por favor, envía tu edad.');
            } else if (user.step === 2) {
                user.data.edad = message.body;
                user.step = 3;
                await message.reply('Por favor, envía tu género (Hombre o Mujer).');
            } else if (user.step === 3) {
                const genero = message.body.toLowerCase();
                if (genero === 'hombre' || genero === 'mujer') {
                    user.data.genero = genero.charAt(0).toUpperCase() + genero.slice(1);
                    user.data.id = Math.floor(Math.random() * (99999999 - 11111111 + 1)) + 11111111;
                    user.step = 4;
                    await message.reply('Registro casi completo. Usa el comando .finalizar para guardar tus datos.');
                } else {
                    await message.reply('Género no válido. Por favor, envía "Hombre" o "Mujer".');
                }
            } else if (message.body === '.finalizar' && user.step === 4) {
                const userData = `${user.data.numero}, ${user.data.nombre}, ${user.data.edad}, ${user.data.genero}, ${user.data.id}\n`;
                fs.appendFileSync(filePath, userData);
                registeredUsers.add(phoneNumber);

                const powered = fs.readFileSync(path.join(__dirname, '..', 'HaleyBot-AR.txt'), 'utf8').trim();
                const videoPath = path.join(__dirname, '..', 'temp', 'video.mp4'); // Ruta del video en la carpeta temp
                const finalMessage = `╭══• ೋ•✧๑♡๑✧•ೋ •══╮\n🍬  🎀  𝐻𝒶𝓁𝑒𝓎𝐵❀𝓉-𝒜𝑅  🎀  🍬\n> Registro Completado\nUsuario: ${user.data.numero}\nID: ${user.data.id}\nNombre: ${user.data.nombre}\nEdad: ${user.data.edad}\nGénero: ${user.data.genero}\nTipo: ${user.data.apodo || 'Usuario'}\n╰══• ೋ•✧๑♡๑✧•ೋ •══╯\n> Powered By Microsoft Copilot`;

                // Leer el archivo de video y convertirlo a Base64
                fs.readFile(videoPath, async (err, videoData) => {
                    if (err) {
                        console.error(`Error al leer el archivo de video: ${err.message}`);
                        await message.reply('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
                        return;
                    }
                    const base64Video = videoData.toString('base64');
                    const media = new MessageMedia('video/mp4', base64Video, 'video.mp4');

                    // Enviar el mensaje de finalización y el video juntos
                    await client.sendMessage(chatId, media, { caption: finalMessage });
                });

                user.step = 0;
            } else if (message.body === '.owner' && user.step === 4) {
                owners.push(chatId);
                user.data.apodo = 'dios';
                const userData = `${user.data.numero}, ${user.data.nombre}, ${user.data.edad}, ${user.data.genero}, ${user.data.id}, ${user.data.apodo}\n`;
                fs.appendFileSync(filePath, userData);
                registeredUsers.add(phoneNumber);

                const powered = fs.readFileSync(path.join(__dirname, '..', 'HaleyBot-AR.txt'), 'utf8').trim();
                const videoPath = path.join(__dirname, '..', 'temp', 'video.mp4'); // Ruta del video en la carpeta temp
                const finalMessage = `╭══• ೋ•✧๑♡๑✧•ೋ •══╮\n🍬  🎀  𝐻𝒶𝓁𝑒𝓎𝐵❀𝓉-𝒜𝑅  🎀  🍬\n> Registro Completado\nUsuario: ${user.data.numero}\nID: ${user.data.id}\nNombre: ${user.data.nombre}\nEdad: ${user.data.edad}\nGénero: ${user.data.genero}\nTipo: ${user.data.apodo}\n╰══• ೋ•✧๑♡๑✧•ೋ •══╯\n> Powered By Microsoft Copilot`;

                // Leer el archivo de video y convertirlo a Base64
                fs.readFile(videoPath, async (err, videoData) => {
                    if (err) {
                        console.error(`Error al leer el archivo de video: ${err.message}`);
                        await message.reply('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
                        return;
                    }
                    const base64Video = videoData.toString('base64');
                    const media = new MessageMedia('video/mp4', base64Video, 'video.mp4');

                    // Enviar el mensaje de finalización y el video juntos
                    await client.sendMessage(chatId, media, { caption: finalMessage });
                });

                user.step = 0;
            }
        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
            await message.reply('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
        }
    });
};
