import { promises as fs } from 'fs'
import { join } from 'path'

const menuImages = [
  './IMG-20260528-WA0003.jpg',
  './image-34.jpg',
  './image-17.jpg'
]

const defaultMenu = {
  before: `
𝚯𝚩𝚵𝐘𝐑𝚫 𝚩𝚯𝐓
───────────────────────
⎔ 𝘊𝘰𝘳𝘦_𝘓𝘪𝘯𝘬: %mention
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝘶𝘴: 𝘖𝘯𝘭𝘪𝘯𝘦
⎔ 𝘚𝘊𝘈𝘕_𝘚𝘌𝘊𝘛𝘖𝘙: 𝘋𝘢𝘵𝘢_𝘓𝘦𝘢𝘬
───────────────────────

» 𝘐𝘕𝘐𝘡𝘐𝘈𝘕𝘋𝘖 𝘚𝘊𝘈𝘕𝘕𝘌𝘙𝘐𝘡𝘡𝘈𝘡𝘐𝘖𝘕𝘌...
`.trimStart(),
  header: 'ョ ── %category 𪚥',
  body: '    ⤿ 🔎 %cmd ╳',
  footer: '͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞\n',
  after: `_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰𝘺 𝘵𝘩𝘦 𝘤𝘩𝘢𝘰𝘴._`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let mention = `@${m.sender.split('@')[0]}`
    let tags = {
      'ricerca': '𝘚𝘠𝘚𝘛𝘌𝘔_𝘔𝘈𝘓𝘍𝘜𝘕𝘊𝘛𝘐𝘖𝘕_𝘚𝘊𝘈𝘕'
    }

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before.replace(/%mention/g, mention),
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(h => {
              return defaultMenu.body.replace(/%cmd/g, menu.prefix ? h : _p + h)
                .trim()
            }).join('\n')
          }),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    await m.react('💥')

    let randomImg = menuImages[Math.floor(Math.random() * menuImages.length)]
    let imageBuffer = null
    try {
      imageBuffer = await fs.readFile(randomImg)
    } catch (e) {
      for (let img of menuImages) {
        try { imageBuffer = await fs.readFile(img); break } catch (err) {}
      }
    }

    await conn.sendMessage(m.chat, { 
      ...(imageBuffer ? { image: imageBuffer } : {}),
      caption: _text.trim(), 
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "𝚯𝚩𝚵𝐘𝐑𝚫 𝚩𝚯𝐓"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ 𝘍𝘈𝘛𝘈𝘓_𝘌𝘙𝘙𝘖𝘙: Fallimento irreversibile del modulo di ricerca.', m)
  }
}

handler.help = ['menuricerche']
handler.tags = ['menu']
handler.command = ['menuricerche', 'menur', 'searchmenu']

export default handler
