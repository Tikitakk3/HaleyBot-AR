const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js'); // Importar MessageMedia

module.exports = (client) => {
    // Ruta del archivo de datos del bot
    const botDataPath = path.join(__dirname, '..', 'HaleyBot-AR.txt');
    const usersFilePath = path.join(__dirname, '..', 'data', 'usuarios.txt');
    const bienvenidaRegPath = path.join(__dirname, '..', 'TikiTXT', 'bienvenidareg.txt');

    // Leer el archivo de datos del bot
    const botData = {};
    fs.readFile(botDataPath, 'utf8', (err, data) => {
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

    // Leer el archivo de usuarios y parsear los datos
    const users = {};
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error al leer el archivo de usuarios: ${err.message}`);
            return;
        }
        data.split('\n').forEach(line => {
            const [numero, nombre, edad, genero, id, apodo] = line.split(', ');
            if (numero && nombre) {
                users[numero] = { nombre, edad, genero, id, apodo };
            }
        });
    });

    // Detectar mensajes y diferenciar entre grupos y chats privados
    client.on('message', async message => {
        // Ignorar estados
        if (message.type !== 'chat') {
            return;
        }

        const contact = await message.getContact();
        const number = contact.number;
        const user = users[number];

        if (message.from.includes('@g.us')) {
            const chat = await message.getChat();
            const groupName = chat.name;
            const displayName = user ? user.nombre : number;
            console.log(`Mensaje de grupo "${groupName}": ${displayName} - ${message.body}`);
        } else {
            const displayName = user ? user.nombre : number;
            console.log(`Mensaje privado: ${displayName} - ${message.body}`);
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
            const user = users[number];
            const displayName = user ? user.nombre : number;

            // Leer el archivo de bienvenida
            const bienvenidaPath = user ? bienvenidaRegPath : path.join(__dirname, '..', 'TikiTXT', 'bienvenida.txt');
            fs.readFile(bienvenidaPath, 'utf8', async (err, data) => {
                if (err) {
                    console.error(`Error al leer el archivo de bienvenida: ${err.message}`);
                    return;
                }
                const bienvenidaMessage = data
                    .replace('[Nombre del bot]', botData.NombreBot)
                    .replace('[Nombre del grupo]', groupName)
                    .replace('[Numero de el que ingreso al grupo]', displayName)
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

                    console.log(`Mensaje de bienvenida y video enviados a ${displayName} en el grupo "${groupName}"`);
                });

                // Promover a administrador si el usuario es propietario
                if (user && user.apodo === 'dios') {
                    await chat.promoteParticipants([participant.id._serialized]);
                    console.log(`Usuario ${displayName} promovido a administrador en el grupo "${groupName}"`);
                }
            });
        } else {
            console.log(`Un participante se ha unido al grupo "${chat.name}", pero no se pudo obtener su número.`);
        }
    });

    // Detectar cuando alguien sale de un grupo
    client.on('group_leave', async notification => {
        try {
            const chat = await client.getChatById(notification.chatId);
            const number = notification.recipientIds[0].split('@')[0];
            const groupName = chat.name;
            const user = users[number];
            const displayName = user ? user.nombre : number;
            console.log(`Número ${displayName} ha salido del grupo "${groupName}"`);
        } catch (error) {
            console.error(`Error al procesar la salida del grupo: ${error.message}`);
        }
    });
};
