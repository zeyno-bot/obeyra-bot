import { downloadContentFromMessage } from '@realvare/baileys'
import crypto from 'crypto'
import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isOwner, isBotAdmin, isROwner }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false
  if (!m.message) return true

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antigore) return true
  if (isAdmin || isOwner || isROwner || m.fromMe) return true

  const user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = { warn: 0 })
  if (typeof user.warn !== 'number') user.warn = 0

  if (!global.db.data.goreCache) global.db.data.goreCache = {}

  const isMedia =
    m.message.imageMessage ||
    m.message.videoMessage ||
    m.message.stickerMessage

  if (!isMedia) return true

  try {
    let mediaBuffer, mimeType, fileName
    const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
    const msg = quoted
      ? (quoted.imageMessage || quoted.videoMessage || quoted.stickerMessage)
      : (m.message.imageMessage || m.message.videoMessage || m.message.stickerMessage)

    if (!msg) return true

    let type
    if (msg.mimetype?.includes('video')) type = 'video'
    else if (msg.mimetype?.includes('sticker')) type = 'sticker'
    else if (msg.mimetype?.includes('image')) type = 'image'
    else return true

    const stream = await downloadContentFromMessage(msg, type)
    mediaBuffer = Buffer.from([])
    for await (const chunk of stream) {
      mediaBuffer = Buffer.concat([mediaBuffer, chunk])
    }

    const fileHash = crypto.createHash('md5').update(mediaBuffer).digest('hex')

    if (global.db.data.goreCache[fileHash] === true) {
      return await punishUser(conn, m, user, isBotAdmin, '𝘗𝘈𝘊𝘒𝘌𝘛_𝘒𝘕𝘖𝘞𝘕_𝘎𝘖𝘙𝘌_𝘋𝘌𝘛𝘌𝘊𝘛𝘌𝘋')
    }

    if (global.db.data.goreCache[fileHash] === false) {
      return true
    }

    if (type === 'video') {
      mimeType = 'video/mp4'
      fileName = 'media.mp4'
      if (mediaBuffer.length > 10 * 1024 * 1024) return true
    } else if (type === 'sticker') {
      mimeType = 'image/webp'
      fileName = 'media.webp'
    } else {
      mimeType = msg.mimetype || 'image/jpeg'
      fileName = 'media.jpg'
    }

    const SIGHTENGINE_USER = global.APIKeys.sightengine_user
    const SIGHTENGINE_SECRET = global.APIKeys.sightengine_secret

    if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) return true

    const apiUrl = type === 'video'
      ? 'https://api.sightengine.com/1.0/video/check-sync.json'
      : 'https://api.sightengine.com/1.0/check.json'

    const formData = new FormData()
    formData.append('media', mediaBuffer, { filename: fileName, contentType: mimeType })
    formData.append('models', 'gore-2.0,violence')
    formData.append('api_user', SIGHTENGINE_USER)
    formData.append('api_secret', SIGHTENGINE_SECRET)

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (result.status !== 'success') return true

    let goreProb = 0, violenceProb = 0, seriousInjury = 0, veryBloody = 0, corpse = 0, skull = 0, bodyOrgan = 0, firearmThreat = 0, physicalViolence = 0

    if (type === 'video') {
      const frames = result.data?.frames || []
      goreProb = Math.max(...frames.map(f => f.gore?.prob || 0), 0)
      violenceProb = Math.max(...frames.map(f => f.violence?.prob || 0), 0)
      seriousInjury = Math.max(...frames.map(f => f.gore?.classes?.serious_injury || 0), 0)
      veryBloody = Math.max(...frames.map(f => f.gore?.classes?.very_bloody || 0), 0)
      corpse = Math.max(...frames.map(f => f.gore?.classes?.corpse || 0), 0)
      skull = Math.max(...frames.map(f => f.gore?.classes?.skull || 0), 0)
      bodyOrgan = Math.max(...frames.map(f => f.gore?.classes?.body_organ || 0), 0)
      firearmThreat = Math.max(...frames.map(f => f.violence?.classes?.firearm_threat || 0), 0)
      physicalViolence = Math.max(...frames.map(f => f.violence?.classes?.physical_violence || 0), 0)
    } else {
      goreProb = result.gore?.prob || 0
      violenceProb = result.violence?.prob || 0
      seriousInjury = result.gore?.classes?.serious_injury || 0
      veryBloody = result.gore?.classes?.very_bloody || 0
      corpse = result.gore?.classes?.corpse || 0
      skull = result.gore?.classes?.skull || 0
      bodyOrgan = result.gore?.classes?.body_organ || 0
      firearmThreat = result.violence?.classes?.firearm_threat || 0
      physicalViolence = result.violence?.classes?.physical_violence || 0
    }

    const isHighRisk =
      goreProb > 0.45 || violenceProb > 0.75 || seriousInjury > 0.35 || veryBloody > 0.35 || corpse > 0.25 || skull > 0.30 || bodyOrgan > 0.20 || firearmThreat > 0.85 || physicalViolence > 0.85

    global.db.data.goreCache[fileHash] = isHighRisk

    if (isHighRisk) {
      return await punishUser(conn, m, user, isBotAdmin, '𝘊𝘖𝘕𝘛𝘌𝘕𝘜𝘛𝘖_𝘎𝘙𝘈𝘍𝘐𝘊𝘖_𝘝𝘐𝘖𝘓𝘌𝘕𝘛𝘖_𝘙𝘐𝘓𝘌𝘝𝘈𝘛𝘖')
    }
  } catch (e) {
    console.error('Errore antigore:', e)
    return true
  }
  return true
}

async function punishUser(conn, m, user, isBotAdmin, reason) {
  user.warn += 1
  const senderTag = m.sender.split('@')[0]
  try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {}

  if (user.warn < 3) {
    let warnMsg = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘎𝘖𝘙𝘌_𝘋𝘌𝘛𝘌𝘊𝘛𝘐𝘖𝘕 ☠️
───────────────────────
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘜𝘕𝘚𝘈𝘍𝘌_𝘗𝘈𝘊𝘒𝘌𝘛_𝘍𝘖𝘜𝘕𝘋
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${senderTag}
⎔ 𝘍𝘪𝘭𝘵𝘦𝘳_𝘓𝘰𝘨: ${reason}
⎔ 𝘚𝘺𝘴_𝘞𝘢𝘳𝘯: *${user.warn}/3*
───────────────────────

» 𝘈𝘝𝘝𝘐𝘚𝘖: Rilevato materiale splatter, gore o ad alto tasso di violenza visiva. I media non autorizzati sono stati distrutti. Al terzo blocco scatta l'estromissione permanente.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦ม 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

    await conn.sendMessage(m.chat, {
      text: warnMsg,
      mentions: [m.sender]
    }, { quoted: m })
    return false
  }

  user.warn = 0
  if (!isBotAdmin) {
    let failMsg = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘎𝘖𝘙𝘌_𝘓𝘐𝘔𝘐𝘛_𝘌𝘟𝘊𝘌𝘌𝘋𝘌𝘋 ☠️
───────────────────────
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${senderTag}
⎔ 𝘚𝘺𝘴_𝘞𝘢𝘳𝘯: *3/3*
⎔ 𝘚𝘺𝘴_𝘈𝘤𝘵𝘪𝘰𝘯: 𝘒𝘐𝘊𝘒_𝘍𝘈𝘐𝘓𝘌𝘋_𝘕𝘖_𝘈𝘋𝘔𝘐𝘕
───────────────────────

» 𝘓𝘖𝘎: L'host ha superato la soglia di tolleranza di sanzioni per violenza estrema. Impossibile terminare il nodo: il firewall del bot non dispone di privilegi di amministrazione (Sys_Admin) in questa griglia.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

    await conn.sendMessage(m.chat, {
      text: failMsg,
      mentions: [m.sender]
    }, { quoted: m })
    return false
  }

  let kickMsg = `
☠️ 𝗘 𝗥 𝗥 𝗢 𝗥  𝟰 𝟬 𝟰  // 𝘛𝘌𝘙𝘔𝘐𝘕𝘈𝘛𝘌_𝘏𝘖𝘚𝘛 ☠️
───────────────────────
⎔ 𝘛𝘢𝘳𝘨𝘦𝘵_𝘏𝘰𝓼𝘵: @${senderTag}
⎔ 𝘚𝘺𝘴_𝘚𝘵𝘢𝘵𝗎𝗌: 𝘉𝘓𝘈𝘊𝘒𝘓𝘐𝘚𝘛𝘌𝘋_𝘕𝘖𝘋𝘌
⎔ 𝘙𝘦𝘢𝘴𝘰𝘯_𝘊𝘰𝘥𝘦: 𝘎𝘖𝘙𝘌_𝘝𝘐𝘖𝘓𝘈𝘛𝘐𝘖𝘕
───────────────────────

» 𝘓𝘖𝘎: Espulsione eseguita. La trasmissione ripetuta di file multimediali corrotti contenenti gore ha attivato la rimozione forzata dell'host dall'infrastruttura del gruppo.

͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞ ͟͟͞͞
_𝘚𝘺𝘴𝘵𝘦𝘮 𝘸𝘪𝘭𝘭 𝘯𝘰𝘵 𝘳𝘦𝘉𝘰𝘰𝘵. 𝘌𝘯𝘫𝘰ย 𝘵𝘩𝗲 𝘤𝘩𝘢𝘰𝘴._`.trim()

  await conn.sendMessage(m.chat, {
    text: kickMsg,
    mentions: [m.sender]
  }, { quoted: m })

  await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
  return false
}

export default handler
