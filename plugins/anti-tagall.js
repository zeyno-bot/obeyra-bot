let handler = m => m

async function addWarn(conn, m, target, reason, isBotAdmin) {
  if (!global.db.data.users[target]) global.db.data.users[target] = {}
  const user = global.db.data.users[target]
  if (!user.warns) user.warns = {}
  if (typeof user.warns[m.chat] !== 'number') user.warns[m.chat] = 0

  user.warns[m.chat] += 1
  const warns = user.warns[m.chat]
  const tag = target.split('@')[0]

  if (warns >= 3) {
    user.warns[m.chat] = 0
    let kickMsg = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘔𝘈𝘚𝘚_𝘛𝘈𝘎_𝘛𝘌𝘙𝘔𝘐𝘕𝘈𝘛𝘐𝘖𝘕 ☠️
───────────────────────
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${tag}
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘓𝘐𝘔𝘐𝘛_𝘌𝘟𝘊𝘌𝘌𝘋𝘌𝘋
⎔ 𝘚𝘺𝘴_𝘈𝘤𝘵𝘪𝘰𝘯: 𝘗𝘜𝘙𝘎𝘌_𝘌𝘟𝘌𝘊𝘜𝘛𝘌𝘋
───────────────────────

» 𝘓𝘖𝘎: L'host ha violato ripetutamente le politiche di notifica di massa del server saturando la griglia con tag massivi non autorizzati. Il firewall ha rimosso l'agente.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦System 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝒕. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

    await conn.sendMessage(m.chat, {
      text: kickMsg,
      mentions: [target]
    }).catch(() => {})

    if (isBotAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [target], 'remove').catch(() => {})
    }
    return
  }

  let warnMsg = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘔𝘈𝘚𝘚_𝘛𝘈𝘎_𝘐𝘕𝘛𝘌𝘙𝘊𝘌𝘗𝘛 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘜𝘕𝘈𝘜𝘛𝘏𝘖𝘙𝘐𝘡𝘌𝘋_𝘔𝘈𝘚𝘚_𝘕𝘖𝘛𝘐𝘍𝘠
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${tag}
⎔ 𝘍𝘪𝘭𝘵𝘦𝘳_𝘓𝘰𝘨: ${reason.toUpperCase()}
⎔ 𝘚𝘺𝘴_𝘞𝘢𝘳𝘯: *${warns}/3*
───────────────────────

» 𝘈𝘝𝘝𝘐𝘚𝘖: Intercettata iniezione di tag-all/menzione massiva non autorizzata nel buffer di input. Il payload è stato rimosso per prevenire il sovraccarico di notifiche degli utenti. Al terzo avviso scatterà il ban automatico.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦System 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝒕. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

  await conn.sendMessage(m.chat, {
    text: warnMsg,
    mentions: [target]
  }).catch(() => {})
}

handler.before = async function (m, { conn, participants, isAdmin, isOwner, isSam, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false
  if (!m.message) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antitagall) return true

  const sender = m.sender
  if (!sender) return true

  const botJid = conn.decodeJid(conn.user?.jid || conn.user?.id)
  if (sender === botJid) return true
  if (isAdmin || isOwner || isSam) return true

  const contextMentioned =
    m.msg?.contextInfo?.mentionedJid ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    m.message?.imageMessage?.contextInfo?.mentionedJid ||
    m.message?.videoMessage?.contextInfo?.mentionedJid ||
    m.message?.documentMessage?.contextInfo?.mentionedJid ||
    m.message?.audioMessage?.contextInfo?.mentionedJid ||
    m.message?.stickerMessage?.contextInfo?.mentionedJid ||
    []

  const mentionedRaw = [...(m.mentionedJid || []), ...(contextMentioned || [])]
  const mentioned = (mentionedRaw).map(j => conn.decodeJid(j))

  if (!mentioned.length) return true

  const uniqueMentioned = [...new Set(mentioned)].filter(j => j && j !== botJid)
  const groupSize = Array.isArray(participants) && participants.length ? participants.length : 0

  if (!groupSize) return true

  // Verificatore di soglia: attiva il blocco se i tag superano il 70% della griglia
  const ratio = uniqueMentioned.length / groupSize
  if (ratio <= 0.7) return true

  // Pulizia immediata del pacchetto infetto se il bot ha i permessi admin
  if (isBotAdmin) {
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
  }

  // Registrazione dell'anomalia nel database utente
  await addWarn(conn, m, sender, `𝘔𝘢𝘴𝘴_𝘔𝘦𝘯𝘵𝘪𝘰𝘯_𝘝𝘪𝘰𝘭𝘢𝘵𝘪𝘰𝘯_𝘙𝘢𝘵𝘪𝘰_𝘋𝘦𝘵𝘦𝘤𝘵𝘦𝘥`, !!isBotAdmin)

  return false
}

export default handler
