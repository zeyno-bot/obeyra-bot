import fetch from 'node-fetch'
import { promises as fs } from 'fs'
import { join } from 'path'

// Configurazione immagini random (tutte .jpeg)
const menuImages = [
  './menu-1.jpeg',
  './menu-2.jpeg',
  './menu-3.jpeg'
]

let handler = async (m, { conn, usedPrefix: _p, command, args, isOwner, isAdmin }) => {
  const userName = m.pushName || 'Unknown_User'

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid]

  // --- CONFIGURAZIONE MODULI ---
  const securityFeatures = [
    { key: 'antigore', name: '🚫 𝖠𝗇𝗍 toolkit_𝗀𝗈𝗋𝖾', desc: 'Blocca contenuti splatter/gore' },
    { key: 'modoadmin', name: '🛡️ 𝖲𝗈𝗅𝗈_𝖺𝖽𝗆𝗂𝗇', desc: 'Solo gli admin usano il bot' },
    { key: 'antivoip', name: '📞 𝖠𝗇𝗍𝗂_𝗏𝗈𝗂𝗉', desc: 'Rifiuta chiamate nel gruppo' },
    { key: 'antilink', name: '🔗 𝖠𝗇𝗍𝗂_𝗅𝗂𝗇𝗄', desc: 'Elimina link gruppi WhatsApp' },
    { key: 'antilinksocial', name: '🌐 𝖢𝖻_𝖫𝗂𝗇𝗄_𝖲𝗈𝖼𝗂𝖺𝗅', desc: 'Elimina link social (IG, TT, ecc)' },
    { key: 'antitrava', name: '🧱 𝖠𝗇𝗍𝗂_𝗍𝗋𝖺𝗏𝖺', desc: 'Blocca crash/messaggi lunghi' },
    { key: 'antinuke', name: '☢️ 𝖠𝗇𝗍𝗂_𝗇𝗎𝗄𝖾', desc: 'Sicurezza avanzata del gruppo' },
    { key: 'antiviewonce', name: '👁️ 𝖠𝗇𝗍𝗂_𝗏𝗂𝖾𝗐𝗈𝗇𝖼𝖾', desc: 'Invia messaggi visualizza una volta' },
    { key: 'antispam', name: '🛑 𝖠𝗇𝗍𝗂_𝗌𝗉𝖺𝗆', desc: 'Blocca spam di comandi' }
  ]

  const automationFeatures = [
    { key: 'ai', name: '🧠 𝖨𝖠_𝖢𝗈𝗋𝖾', desc: 'Intelligenza artificiale attiva' },
    { key: 'vocali', name: '🎤 𝖵𝗈𝖼𝖾_𝖲𝗒𝗌', desc: 'Risponde con audio ai messaggi' },
    { key: 'reaction', name: '😎 𝖠𝗎𝗍𝗈_𝖱𝖾𝖺𝖼𝗍', desc: 'Reazioni automatiche ai messaggi' },
    { key: 'autolevelup', name: '⬆️ 𝖠𝗎𝗍𝗈_𝖫𝗏𝗅', desc: 'Messaggio di livello automatico' },
    { key: 'welcome', name: '👋 𝖶𝖾𝗅𝖼𝗈𝗆𝖾_𝖫𝗈𝖦', desc: 'Messaggio di benvenuto' }
  ]

  const ownerFeatures = [
    { key: 'anticall', name: '📵 𝖠𝗇𝗍𝗂_𝖢𝖺𝗅𝗅', desc: 'Blocca chiamate al bot (Global)' },
    { key: 'antiprivate', name: '🔒 𝖠𝗇𝗍𝗂_𝖯𝗏', desc: 'Blocca uso del bot in privato' },
    { key: 'solocreatore', name: '👑 𝖮𝗐𝗇𝖾𝗋_𝖮𝗇𝗅𝗒', desc: 'Bot risponde solo all\'owner' }
  ]

  // --- GENERAZIONE MENU ---
  if (!args.length || /menu|help/i.test(args[0])) {
    let text = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝖬𝖠𝖲𝖳𝖤𝖱 ☠️
───────────────────────
⎔ 𝘊𝘰𝘳𝘦_𝘓𝘪𝘯𝘬: ${userName}
⎔ 𝘚𝘦𝘤_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘉𝘙𝘌𝘈𝘊𝘏𝘌𝘋
───────────────────────

» 𝘐𝘕𝘐𝘌𝘡𝘐𝘖𝘕𝘌_𝖢𝖮𝖬𝖠𝖭𝖣𝖨...
*│ ➤* ${_p}*attiva* <nome>
*│ ➤* ${_p}*disattiva* <nome>

ョ ── 𝘚𝘠𝘚𝘛𝘌𝘔_𝘔𝘈𝘓𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕_𝘚𝘌𝘊 𪚥
${securityFeatures.map(f => `    ⤿ ${f.name}\n    ☣️ _${f.desc}_\n    ↳ 𝘊𝘮𝘥: *${f.key}* \n╳`).join('\n')}
͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞

ョ ── 𝘚𝘠𝘚𝘛𝘌𝘔_𝘔𝘈𝘓𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕_𝖠𝖴𝖳𝖮 𪚥
${automationFeatures.map(f => `    ⤿ ${f.name}\n    ☣️ _${f.desc}_\n    ↳ 𝘊𝘮𝘥: *${f.key}* \n╳`).join('\n')}
͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞

_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`

    // Estrazione random dell'immagine .jpeg
    let randomImg = menuImages[Math.floor(Math.random() * menuImages.length)]
    let imageBuffer = null
    
    try {
      imageBuffer = await fs.readFile(randomImg)
    } catch (e) {
      console.log(`⚠️ Immagine ${randomImg} non trovata, tento il recupero...`)
      for (let img of menuImages) {
        try {
          imageBuffer = await fs.readFile(img)
          break
        } catch (err) {}
      }
    }

    // Invio con immagine randomizzata ed estetica modificata
    await conn.sendMessage(m.chat, { 
      ...(imageBuffer ? { image: imageBuffer } : {}), 
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "☠️ ᴇʀʀᴏʀ⁴⁰⁴ // ᴍᴀsᴛᴇʀ sᴇᴄᴜʀɪᴛʏ ☠️"
        }
      }
    }, { quoted: m })
    return
  }

  // --- LOGICA DI ATTIVAZIONE ---
  let isEnable = !/disattiva|off|0/i.test(command)
  let type = args[0].toLowerCase()
  let status = isEnable ? '𝘜𝘗_𝘈𝘊𝘛𝘐𝘝𝘌𝘋 🩸' : '𝘋𝘖𝘞𝘕_𝘍𝘈𝘐𝘓𝘌𝘋 🛑'

  let dbKey = type
  if (type === 'antilink') dbKey = 'antiLink'
  if (type === 'antilinksocial') dbKey = 'antiLink2'
  if (type === 'antiviewonce') dbKey = 'antioneview'
  if (type === 'antiprivate') dbKey = 'antiPrivate'
  if (type === 'solocreatore') dbKey = 'soloCreatore'

  const isSecurity = securityFeatures.some(f => f.key.toLowerCase() === type)
  const isAuto = automationFeatures.some(f => f.key.toLowerCase() === type)
  const isOwnerKey = ownerFeatures.some(f => f.key.toLowerCase() === type)

  if (isSecurity || isAuto) {
    if (!m.isGroup && !isOwner) return m.reply('❌ 𝘚𝘺𝘴_𝘓𝘰𝘨: Solo nei gruppi')
    if (m.isGroup && !isAdmin && !isOwner) return m.reply('💥 𝘚𝘺𝘴_𝘓𝘰𝘨: Solo per Admin')
    chat[dbKey] = isEnable
  } else if (isOwnerKey) {
    if (!isOwner) return m.reply('👑 𝘚𝘺𝘴_𝘓𝘰𝘨: Accesso negato, serve Owner-Key')
    bot[dbKey] = isEnable
  } else {
    return m.reply('❓ 𝘔𝘰𝘥𝘶𝘭𝘰 𝘯𝘰𝘯 𝘵𝘳𝘰𝘷𝘢𝘵𝘰 𝘯𝘦𝘭 𝘋𝘢𝘵𝘢_𝘊𝘰𝘳𝘦.')
  }

  await m.react('💥')
  m.reply(`ョ ── 𝘚𝘠𝘚𝘛𝘌𝘔_𝘜𝘗𝘋𝘈𝘛𝘌𝘋 𪚥\n\n𝘔𝘰𝘥𝘶𝘭𝘰: *${type.toUpperCase()}*\n𝘚𝘵𝘢𝘵𝘰: *${status}*`)
}

handler.command = ['attiva', 'disattiva', 'on', 'off', 'enable', 'disable']
export default handler
