module.exports = (client) => {
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
    });

    // Detectar cuando alguien se une a un grupo
    client.on('group_join', async notification => {
        const chat = await client.getChatById(notification.chatId);
        const participant = chat.participants.find(p => p.id._serialized === notification.recipientIds[0]);
        if (participant) {
            const number = participant.id.user;
            const groupName = chat.name;
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
