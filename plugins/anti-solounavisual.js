/**
 * Gestore Anti-Media: Consente solo messaggi "Visualizza una volta"
 */
export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]

  // Se la funzione non è attiva nel database, l'istanza si arresta
  if (!chat?.antimedia) return false

  // Esclusione filtri per host dotati di privilegi root
  if (m.fromMe || isAdmin || isOwner || isSam) return false
  if (!isBotAdmin) return false

  // Escludiamo i messaggi "View Once" (V1, V2 e Estensioni)
  const isViewOnce = m.message?.viewOnceMessage || 
                     m.message?.viewOnceMessageV2 || 
                     m.message?.viewOnceMessageV2Extension

  if (isViewOnce) return false

  // Intercettazione flussi media standard (Immagine o Video nel buffer lineare)
  const hasNormalMedia = !!m.message?.imageMessage || !!m.message?.videoMessage

  if (hasNormalMedia) {
    // Purge immediato del frame multimediale non autorizzato
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant,
      },
    }).catch(() => {})

    let interceptMsg = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘔𝘌𝘋𝘐𝘈_𝘐𝘕𝘛𝘌𝘙𝘊𝘌𝘗𝘛 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘗𝘌𝘙𝘔𝘈𝘕𝘌𝘕𝘛_𝘚𝘛𝘓_𝘙𝘌𝘑𝘌𝘊𝘛
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${m.sender.split('@')[0]}
⎔ 𝘚𝘺𝘴_𝘈𝘤𝘵𝘪𝘰𝘯: 𝘔𝘌𝘋𝘐𝘈_𝘗𝘜𝘙𝘎𝘌_𝘌𝘟𝘌𝘊𝘜𝘛𝘌𝘋
───────────────────────

» 𝘈𝘝𝘝𝘐𝘚𝘖: Intercettata persistenza dati multimediale. Le direttive di questo settore consentono esclusivamente la trasmissione di pacchetti volatili monouso (*𝘝𝘪𝘦𝘸_𝘖𝘯𝘤𝘦*). Il file statico è stato distrutto.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦System 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

    // Invio del log di intercettazione sulla frequenza di rete del gruppo
    await conn.sendMessage(m.chat, {
      text: interceptMsg,
      mentions: [m.sender],
    }).catch(() => {})

    return true
  }

  return false
}

// --- LOGICA COMANDO (Attiva/Disattiva) ---
export async function handler(m, { conn, args, isAdmin, isOwner }) {
  if (!m.isGroup) return false
  
  if (!(isAdmin || isOwner)) {
    let errAdmin = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘈𝘊𝘊𝘌𝘚𝘚_𝘋𝘌𝘕𝘐𝘌𝘋 ☠️
───────────────────────
» 𝘓𝘖𝘎: Privilegi insufficienti. L'esecuzione di questa istruzione richiede credenziali di livello Sys_Admin o Root_Owner.`.trim()
    return m.reply(errAdmin)
  }

  const chat = global.db.data.chats[m.chat]
  let active = args[0]?.toLowerCase()

  if (active === 'on' || active === 'attiva' || active === '1') {
    chat.antimedia = true
    let turnOn = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘔𝘖𝘋𝘜𝘓𝘌_𝘈𝘊𝘛𝘐𝘝𝘈𝘛𝘌𝘋 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘊𝘰𝘥𝘦: 𝘈𝘕𝘛𝘐𝘔𝘌𝘋𝘐𝘈_𝘚𝘌𝘊𝘛𝘖𝘙
⎔ 𝘚𝘵𝘢𝘵𝘶𝘴: 𝘖𝘝𝘌𝘙𝘙𝘐𝘋𝘌_𝘓𝘖𝘊𝘒_𝘖𝘕
───────────────────────
» 𝘓𝘖𝘎: Modulo Anti-Media inizializzato con successo. Tutti i vettori di immagini e video permanenti verranno purgati all'istante. Tolleranza attiva solo per transazioni volatili monouso.`.trim()
    m.reply(turnOn)
  } else if (active === 'off' || active === 'disattiva' || active === '0') {
    chat.antimedia = false
    let turnOff = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘔𝘖𝘋𝘜𝘓𝘌_𝘋𝘌𝘈𝘊𝘛𝘐𝘝𝘈𝘛𝘌𝘋 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘊𝘰𝘥𝘦: 𝘈𝘕𝘛𝘐𝘔𝘌𝘋𝘐𝘈_𝘚𝘌𝘊𝘛𝘖𝘙
⎔ 𝘚𝘵𝘢𝘵𝘶𝘴: 𝘖𝘝𝘌𝘙𝘙𝘐𝘋𝘌_𝘓𝘖𝘊𝘒_𝘖𝘍𝘍
───────────────────────
» 𝘓𝘖𝘎: Il firewall Anti-Media è stato rimosso dalla memoria volatile del canale. Ripristinato il flusso standard di storage dei media fissi.`.trim()
    m.reply(turnOff)
  } else {
    let usage = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘐𝘕𝘝𝘈𝘓𝘐𝘋_𝘚𝘠𝘕𝘛𝘈𝘟 ☠️
───────────────────────
» 𝘚𝘺𝘴_𝘜𝘴𝘢𝘨𝘦: .antimedia [on/off]`.trim()
    m.reply(usage)
  }
}

handler.command = ['antimedia']
handler.group = true
handler.admin = true

export { before }
