import { promises as fs } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

// Configurazione immagini random (tutte .jpeg)
const menuImages = [
  './menu-1.jpeg',
  './menu-2.jpeg',
  './menu-3.jpeg'
]

const defaultMenu = {
  before: `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘙𝘖𝘖𝘛_𝘊𝘖𝘙𝘌 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘖𝘸𝘯𝘦𝘳: %name
⎔ 𝘌𝘹𝘦𝘤_𝘔𝘰𝘥𝘦: %mode
⎔ 𝘖𝘚_𝘛𝘦𝘳𝘮𝘪𝘯𝘢𝘭: %platform
───────────────────────

» 𝘐𝘕𝘐𝘡𝘐𝘈𝘓𝘐𝘡𝘡𝘈𝘡𝘐count𝘕𝘌 𝘗𝘙𝘖𝘛𝘖𝘊𝘖𝘓𝘓𝘖 𝘉𝘠𝘗𝘈𝘚𝘚...
`.trimStart(),
  header: 'ョ ── %category 𪚥',
  body: '    ⤿ 👨‍💻 %cmd ╳',
  footer: '͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞\n',
  after: `_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'creatore': '𝘚𝘠𝘚𝘛𝘌𝘔_𝘔𝘈𝘓𝘍𝘜𝘕𝘊𝘛𝘐badge_𝘖𝘝𝘌𝘙𝘙𝘐𝘋𝘌'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let mode = global.opts['self'] ? '𝘗𝘳𝘪𝘷𝘢𝘵𝘰_𝘓𝘰𝘤𝘬' : '𝘗𝘶𝘣𝘣𝘭𝘪𝘤𝘰_𝘎𝘳𝘪𝘥'
    let platform = os.platform().toUpperCase()

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body.replace(/%cmd/g, menu.prefix ? help : _p + help)
                .trim()
            }).join('\n')
          }),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      name, uptime, mode, platform,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('💥')

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

    // Invio finale configurato come immagine con didascalia ed estetica hacker
    await conn.sendMessage(m.chat, {
      ...(imageBuffer ? { image: imageBuffer } : {}),
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "☠️ ᴇʀʀᴏʀ⁴⁰⁴ // ʀᴏᴏᴛ ᴄᴏʀᴇ ☠️"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ 𝘍𝘈𝘛𝘈𝘓_𝘌𝘙𝘙𝘖𝘙: Impossibile eseguire l\'override del modulo proprietario.', m)
  }
}

handler.help = ['menucreatore']
handler.tags = ['menu']
handler.command = ['menuowner', 'menucreatore', 'owner']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
