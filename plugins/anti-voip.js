let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antivoip || !isBotAdmin) return false

  let decodedSender = conn.decodeJid(m.sender)
  let senderNumber = decodedSender.split('@')[0].split(':')[0]
  let domain = decodedSender.split('@')[1]
  let decodedBotJid = conn.decodeJid(conn.user.jid)

  if (decodedSender === decodedBotJid || isAdmin || isOwner || isSam || domain === 'lid') return false

  if (!senderNumber.startsWith('39')) {
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})

    const text = `╭─── 〔 ⚠️ 𝐄𝐑𝐑𝐎𝐑_𝐒𝐘𝐒𝐓𝐄𝐌 〕 ───
│
│ 📡 *ID:* ${senderNumber}
│ ✖️ *Stato:* Rilevato VOIP_NON_AUTORIZZATO
│ 👾 *Status:* Corruzione_rilevata
│ 🚫 *Azione:* Rimozione dal sistema
│ ⚙️ *Log:* Accesso negato dal BORDER_CONTROL
│
╰─────────────────────`

    await conn.sendMessage(m.chat, { 
      text, 
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: 'ERROR_BOT | SECURITY',
          body: 'Accesso negato: Numero non in whitelist',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          mediaType: 1
        }
      }
    })

    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {})
    return true
  }

  return false
}

export default handler
