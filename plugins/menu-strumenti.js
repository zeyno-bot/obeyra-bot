import { promises as fs } from 'fs'
import { join } from 'path'

const menuImages = [
  './IMG-20260528-WA0003.jpg',
  './image-34.jpg',
  './'image-17.jpg'
]

const defmenu = {
  before: `
𝚯𝚩𝚵𝐘𝐑𝚫 𝚩𝚯𝐓
───────────────────────
⎔ 𝘊𝘰𝘳𝘦_𝘓𝘪𝘯𝘬: %mention
⎔ 𝘔𝘰𝘥𝘶𝘭𝘪: 𝘚𝘵𝘳𝘶𝘮𝘦𝘯𝘵𝘪
⎔ 𝘚𝘵𝘢𝘵𝘶𝘴: 𝘋𝘦𝘦𝘱 𝘚𝘤𝘢𝘯
───────────────────────
`.trimStart(),
  header: 'ョ ── %category 𪚥',
  body: '    ⤿ ⚡ %cmd ╳',
  footer: '͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞\n',
  after: `_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰𝘺 𝘵𝘩𝘦 𝘤𝘩𝘢𝘰𝘴._`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let mention = `@${m.sender.split('@')[0]}`
    let tags = { 'strumenti': '𝘚𝘠𝘚𝘛𝘌𝘔_𝘛𝘖𝘖𝘓𝘚_𝘊𝘖𝘙𝘌' }

    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('strumenti'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin,
      }))

    let _text = [
      defmenu.before.replace(/%mention/g, mention),
      defmenu.header.replace(/%category/g, tags['strumenti']),
      help.map(menu => menu.help.map(cmd => 
        defmenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
      ).join('\n')).join('\n'),
      defmenu.footer,
      defmenu.after
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
    conn.reply(m.chat, `❌ 𝘍𝘈𝘛𝘈𝘓_𝘌𝘙𝘙𝘖𝘙: ${e.message}`, m)
  }
}

handler.help = ['menustrumenti']
handler.tags = ['menu']
handler.command = ['menutools', 'menustrumenti']

export default handler