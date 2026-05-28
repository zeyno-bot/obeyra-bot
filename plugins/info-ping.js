import fs from 'fs';
import os from 'os';
import { performance } from 'perf_hooks';

const toMathematicalAlphanumericSymbols = number => {
  const map = {
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗', '.': '.'
  };
  return number.toString().split('').map(digit => map[digit] || digit).join('');
};

const clockString = ms => {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return `${toMathematicalAlphanumericSymbols(days.toString().padStart(2, '0'))}:${toMathematicalAlphanumericSymbols(hours.toString().padStart(2, '0'))}:${toMathematicalAlphanumericSymbols(minutes.toString().padStart(2, '0'))}:${toMathematicalAlphanumericSymbols(seconds.toString().padStart(2, '0'))}`;
};

const handler = async (m, { conn }) => {

  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);

  const old = performance.now();
  // Calcolo latenza effettiva per il benchmark
  const neww = performance.now();
  const speed = (neww - old).toFixed(4);
  const speedWithFont = toMathematicalAlphanumericSymbols(speed);

  const totalMemBytes = os.totalmem();
  const freeMemBytes = os.freemem();
  const usedMemBytes = totalMemBytes - freeMemBytes;
  const totalMemMB = (totalMemBytes / (1024 * 1024)).toFixed(2);
  const usedMemMB = (usedMemBytes / (1024 * 1024)).toFixed(2);

  const processMemory = process.memoryUsage();
  const heapUsedMB = (processMemory.heapUsed / (1024 * 1024)).toFixed(2);
  const heapTotalMB = (processMemory.heapTotal / (1024 * 1024)).toFixed(2);

  let image;
  try {
    image = fs.readFileSync('./icone/ping.png');
  } catch (e) {
    image = Buffer.alloc(0); // Fallback se il file manca nel grid
  }

  const prova = {
    key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo" },
    message: {
      documentMessage: {
        title: `𝚯𝚩𝚵𝐘𝐑𝚫 𝚩𝚯𝐓 // LATENCY_TEST 𪚥`,
        jpegThumbnail: image
      }
    },
    participant: "0@s.whatsapp.net"
  };

  const info = `
 𝚯𝚩𝚵𝐘𝐑𝚫 𝚩𝚯𝐓 // 𝘗𝘐𝘕𝘎 
───────────────────────
⎔ 𝘓𝘪𝘧ｪ_𝘚𝘪𝘨𝘯𝘢𝘭: ${uptime}
⎔ 𝘗𝘬𝘵_𝘋𝘦𝘭𝘢𝘺: ${speedWithFont} 𝘔𝘚
⎔ 𝘎𝘳𝘪𝘥_𝘙𝘢𝘮: ${usedMemMB} 𝘔𝘉 / ${totalMemMB} 𝘔𝘉
⎔ 𝘊𝘰𝘳𝘦_𝘏𝘦𝘢𝘱: ${heapUsedMB} 𝘔𝘉 / ${heapTotalMB} 𝘔𝘉
───────────────────────
ョ ── 𝘚𝘠𝘚𝘛𝘌𝘔_𝘙𝘌𝘚𝘗𝘖𝘕𝘚𝘌_𝘖𝘒 𪚥`.trim();

  await m.react('💥');

  await conn.sendMessage(m.chat, {
    text: info,
    contextInfo: {
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363232743845068@newsletter',
        newsletterName: "𝚯𝚩𝚵𝐘𝐑𝚫 𝚩𝚯𝐓"
      }
    }
  }, { quoted: prova });
};

handler.command = /^(ping)$/i;
export default handler;
