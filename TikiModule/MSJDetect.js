const fs = require('fs');
const path = require('path');

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
            fs.readFile(bienvenidaPath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error al leer el archivo de bienvenida: ${err.message}`);
                    return;
                }
                const bienvenidaMessage = data
                    .replace('[Nombre del bot]', botData.NombreBot)
                    .replace('[Nombre del grupo]', groupName)
                    .replace('[Numero de el que ingreso al grupo]', number)
                    .replace('[Powered]', botData.Powered);
                chat.sendMessage(bienvenidaMessage.trim());
            });

            console.log(`Número ${number} se ha unido al grupo "${groupName}"`);
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
