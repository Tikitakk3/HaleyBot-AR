const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js'); // Importar MessageMedia

module.exports = (client) => {
    // Ruta del archivo de datos del bot
    const filePath = path.join(__dirname, '..', 'HaleyBot-AR.txt');

    // Leer el archivo y parsear los datos
    const botData = {};
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error al leer el archivo: ${err.message}`);
            return;
        }
        data.split('\n').forEach(line => {
            const [key, value] = line.split(': ');
            if (key && value) {
                botData[key.trim()] = value.trim();
            }
        });
    });

    // Detectar mensajes y diferenciar entre grupos y chats privados
    client.on('message', async message => {
        if (message.from.includes('@g.us')) {
            const chat = await message.getChat();
            const contact = await message.getContact();
            const number = contact.number;
            const groupName = chat.name;
            console.log(`Mensaje de grupo "${groupName}": ${number} - ${message.body}`);
        } else {
            const number = message.from.split('@')[0];
            console.log(`Mensaje privado: ${number} - ${message.body}`);
        }

        // Ejemplo de uso de los datos del archivo
        if (message.body.toLowerCase() === 'info') {
            const infoMessage = `
Nombre del Bot: ${botData.NombreBot}
Versión: ${botData.Version}
Creador: ${botData.NombreCreador}
Instagram: ${botData.InstagramCreador}
GitHub: ${botData.GitHub}
Powered: ${botData.Powered}
            `;
            message.reply(infoMessage.trim());
        }
    });

    // Detectar cuando alguien se une a un grupo
    client.on('group_join', async notification => {
        const chat = await client.getChatById(notification.chatId);
        const participant = chat.participants.find(p => p.id._serialized === notification.recipientIds[0]);
        if (participant) {
            const number = participant.id.user;
            const groupName = chat.name;

            // Leer el archivo de bienvenida
            const bienvenidaPath = path.join(__dirname, '..', 'TikiTXT', 'bienvenida.txt');
            fs.readFile(bienvenidaPath, 'utf8', async (err, data) => {
                if (err) {
                    console.error(`Error al leer el archivo de bienvenida: ${err.message}`);
                    return;
                }
                const bienvenidaMessage = data
                    .replace('[Nombre del bot]', botData.NombreBot)
                    .replace('[Nombre del grupo]', groupName)
                    .replace('[Numero de el que ingreso al grupo]', number)
                    .replace('[Powered]', botData.Powered);

                // Ruta del archivo de video
                const videoPath = path.join(__dirname, '..', 'temp', 'video.mp4');

                // Leer el archivo de video y convertirlo a Base64
                fs.readFile(videoPath, async (err, videoData) => {
                    if (err) {
                        console.error(`Error al leer el archivo de video: ${err.message}`);
                        return;
                    }
                    const base64Video = videoData.toString('base64');
                    const media = new MessageMedia('video/mp4', base64Video, 'video.mp4');

                    // Enviar el mensaje de bienvenida y el video juntos
                    await chat.sendMessage(media, { caption: bienvenidaMessage.trim() });

                    console.log(`Mensaje de bienvenida y video enviados a ${number} en el grupo "${groupName}"`);
                });
            });
        } else {
            console.log(`Un participante se ha unido al grupo "${chat.name}", pero no se pudo obtener su número.`);
        }
    });

    // Detectar cuando alguien sale de un grupo
    client.on('group_leave', async notification => {
        const chat = await client.getChatById(notification.chatId);
        const number = notification.recipientIds[0].split('@')[0];
        const groupName = chat.name;
        console.log(`Número ${number} ha salido del grupo "${groupName}"`);
    });
};
