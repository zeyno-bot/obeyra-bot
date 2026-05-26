import { performance } from 'perf_hooks'

let handler = async (m, { conn }) => {

  let nomeDelBot = global.db.data.nomedelbot || `𝐄𝐑𝐑𝐎𝐑⁴⁰⁴`
  let destinatario

  if (m.quoted && m.quoted.sender) {
    destinatario = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    destinatario = m.mentionedJid[0]
  } else {
    return m.reply("Tagga qualcuno o rispondi a un messaggio per segarlo 😏")
  }

  let nomeDestinatario = `@${destinatario.split('@')[0]}`

  let { key } = await conn.sendMessage(m.chat, {
    text: `Ora sego ${nomeDestinatario}...`,
    mentions: [destinatario]
  }, { quoted: m })

  const animazione = [
   "8==👊==D", "8===👊=D", "8=👊===D", "8==👊==D", "8===👊=D", "8====👊D", "8===👊=D", "8==👊==D", "8=👊===D", "8👊====D", "8=👊===D","8==👊==D", "8===👊=D", "8====👊D","8==👊==D", "8===👊=D", "8=👊===D", "8=👊===D", "8==👊==D", "8===👊=D", "8====👊D💦"
  ]

  for (let frame of animazione) {
    await new Promise(resolve => setTimeout(resolve, 500))
    try {
      await conn.sendMessage(m.chat, {
        text: frame,
        edit: key,
        mentions: [destinatario]
      })
    } catch (e) {}
  }

  await new Promise(resolve => setTimeout(resolve, 500))

  return conn.sendMessage(m.chat, {
    text: `Oh ${nomeDestinatario} ha sborrato! 😋💦`,
    edit: key,
    mentions: [destinatario]
  })
}

handler.help = ['sega @tag']
handler.tags = ['giochi']
handler.command = /^(sega)$/i
handler.owner = false
handler.admin = false
handler.group = false
handler.private = false
handler.premium = false

export default handler
