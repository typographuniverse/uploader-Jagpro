// ✨ Plugin main - menu ✨

/ ✨ Plugin main - menu ✨

const moment = require('moment-timezone');
const PhoneNumber = require('awesome-phonenumber');
const fs = require('fs');
const fetch = require('node-fetch');
const util = require('util');
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const { pickRandom } = require('../lib/functions.js');

moment.tz.setDefault('Asia/Jakarta').locale('id');

let menulist = async (m, { conn, usedPrefix, command, args }) => {
  const perintah = args[0] ? args[0].toLowerCase() : 'tags';
  let settings = global.db.data.settings[conn.user.jid] || {};
  if (!('setmenu' in settings)) settings.setmenu = 'simple';
  global.db.data.settings[conn.user.jid] = settings;

  const tagCount = {};
  const tagHelpMapping = {};

  Object.keys(global.features)
    .filter(plugin => !plugin.disabled)
    .forEach(plugin => {
      const tagsArray = Array.isArray(global.features[plugin].tags) ? global.features[plugin].tags : [];
      if (tagsArray.length > 0) {
        const helpArray = Array.isArray(global.features[plugin].help)
          ? global.features[plugin].help
          : [global.features[plugin].help].filter(item => item);
        tagsArray.forEach(tag => {
          if (tag) {
            if (tagCount[tag]) {
              tagCount[tag]++;
              tagHelpMapping[tag].push(...helpArray);
            } else {
              tagCount[tag] = 1;
              tagHelpMapping[tag] = [...helpArray];
            }
          }
        });
      }
    });

  let totalAllFeatures = 0;
  Object.keys(tagHelpMapping).forEach(tag => {
    totalAllFeatures += (tagHelpMapping[tag] || []).length;
  });

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });
  } catch (err) {
    console.error('[ERROR] Gagal mengirim reaksi:', err);
  }

  // 📅 Waktu sekarang (Asia/Jakarta)
  const moment = require('moment-timezone');
const jakarta = moment().tz('Asia/Jakarta');

// Hari dan Pasaran Jawa
const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const pasaran = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
const refDate = moment.tz('2020-01-01', 'Asia/Jakarta'); // Rabu Legi
const selisihHari = jakarta.diff(refDate, 'days');
const indexPasaran = (selisihHari % 5 + 5) % 5;

const hariPasaran = `${hari[jakarta.day()]} ${pasaran[indexPasaran]}`;
const tanggal = jakarta.format('DD-MM-YYYY');
const jam = jakarta.format('HH:mm:ss');

console.log(`📅 Hari Pasaran: ${hariPasaran}`);
console.log(`📆 Tanggal: ${tanggal}`);
console.log(`🕒 Jam: ${jam}`);
 
 // 🧍 Nama pengguna
  let userName = m.pushName || conn.getName(m.sender) || m.sender.split('@')[0];

  // 📌 Info menu
  let infoBot = `
···─── ⋆⋅ 𓆩👁𓆪 ⋅⋆ ───···
▣─────────────•
> *.𖦹˙ NAMA : ${userName}*
> *.𖦹˙ BOT : ${namebot}*  
> *.𖦹˙ OWNER : ${nameowner}*  
> *.𖦹˙ VERSION : ${version}* 
> *.𖦹˙ STATUS : ${global.opts['self'] ? 'self' : 'public'}*  
> *.𖦹˙ HARI : ${hariPasaran}*
> *.𖦹˙ TANGGAL : ${tanggal}*
> *.𖦹˙ JAM : ${jam}*
▣─────────────•

⊹ ࣪ ﹏𓊝﹏𓂁﹏⊹﹏𓊝﹏𓂁﹏⊹࣪ ˖
> 𝐈 𝐓 𝐀 𝐂 𝐇 𝐈 - 𝐌 𝐄 𝐍 𝐔
⊹ ࣪ ﹏𓊝﹏𓂁﹏⊹﹏𓊝﹏𓂁﹏⊹࣪ ˖
`.trim();

// Daftar kategori
const daftarTag = Object.keys(tagCount).sort();

// Buat teks daftar kategori dengan tanda backtick
let categoryListText = daftarTag.map(tag => {
  return "> ⎙ *MENU " + tag.toUpperCase() + "*";
}).join("\n");

// Tambahkan simbol di awal dan akhir daftar
categoryListText = "▣─────────────•\n" + categoryListText + "\n▣─────────────•";

  // URL default untuk gambar
  const defaultImageUrl = 'https://i.supa.codes/CJkjK'; // URL fallback jika global.thumb tidak valid

  // Logika utama berdasarkan perintah
  if (perintah === 'tags') {
    let _mpt;
    if (process.send) {
      process.send('uptime');
      _mpt = await new Promise(resolve => {
        process.once('message', resolve);
        setTimeout(resolve, 1000);
      }) * 1000;
    }
    let mpt = clockString(_mpt);
    let name = m.pushName || conn.getName(m.sender);

    // Buat daftar opsi untuk menu list/buttonlist
    let rows = [
      { 
        title: 'MENU ALL', 
        id: `${usedPrefix + command} all`, 
        description: `╰┈➤ total fitur : ${totalAllFeatures}`
      },
      ...daftarTag.filter(tag => tag !== 'all').map(tag => ({
        title: `MENU ${tag.toUpperCase()}`,
        id: `${usedPrefix + command} ${tag}`,
        description: `╰┈➤ total fitur : ${(tagHelpMapping[tag] || []).length}`
      }))
    ];

    if (settings.setmenu === 'simple') {
      await conn.sendMessage(m.chat, { 
        text: infoBot + '\n\n' + categoryListText,
        contextInfo: global.adReply.contextInfo
      }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else if (settings.setmenu === 'payment') {
      await conn.relayMessage(m.chat, {
        requestPaymentMessage: {
          currencyCodeIso4217: 'IDR',
          amount1000: 999999999 * 1000, // Rp. 70.000
          requestFrom: '0@s.whatsapp.net',
          noteMessage: {
            extendedTextMessage: {
              text: infoBot + '\n\n' + categoryListText,
              contextInfo: global.adReply.contextInfo
            }
          },
          contextInfo: global.adReply.contextInfo
        }
      }, {});
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else if (settings.setmenu === 'edit') {
      const arr = [
        { text: `➳ *L*`, timeout: 60 },
        { text: `➳ *L O*`, timeout: 60 },
        { text: `➳ *L O A*`, timeout: 60 },
        { text: `➳ *L O A D*`, timeout: 60 },
        { text: `➳ *L O A D I*`, timeout: 60 },
        { text: `➳ *L O A D I N*`, timeout: 60 },
        { text: `➳ *L O A D I N G*`, timeout: 60 },
        { text: `➳ *L O A D I N G .*`, timeout: 60 },
        { text: `➳ *L O A D I N G . .*`, timeout: 60 },
        { text: `➳ *L O A D I N G . . .*`, timeout: 60 },
        { text: `➳ *L O A D I N G . .*`, timeout: 60 },
        { text: `➳ *L O A D I N G .*`, timeout: 60 },
        { text: `➳ *L O A D I N G*`, timeout: 60 },
        { text: `➳ *W E L C O M E*`, timeout: 60 },
        { text: infoBot + '\n\n' + categoryListText, timeout: 60 },
      ];
      let { key } = await conn.sendMessage(m.chat, {
        text: `➳ *Please Wait...*`,
        contextInfo: global.adReply.contextInfo
      }, { quoted: m });
      for (let i = 0; i < arr.length; i++) {
        await new Promise(resolve => setTimeout(resolve, arr[i].timeout));
        await conn.sendMessage(m.chat, {
          text: arr[i].text,
          edit: key,
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
      }
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else if (settings.setmenu === 'buttonlist') {
      let listMessage = {
        title: 'LIST MENU',
        sections: [{
          title: '‼️ SILAHKAN PILIH KATEGORI YANG KAMU INGINKAN',
          rows
        }]
      };

      try {
        let msg = generateWAMessageFromContent(m.chat, {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: infoBot
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: `\n📝 Untuk informasi lebih lanjut bisa menghubungi owner.\n– nomor owner :\n wa.me/${global.rowner || '6287832743170'}\n\n> https://ẉ.ceo/andiiii`
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              title: `${global.namebot || 'BenZz'}`,
              hasMediaAttachment: global.thumb ? true : false,
              ...(global.thumb ? await prepareWAMessageMedia({ image: { url: global.thumb } }, { upload: conn.waUploadToServer }).catch(() => ({})) : {})
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify(listMessage)
                }
              ]
            })
          })
        }, { userJid: m.chat, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim buttonlist untuk tags:', err);
        await conn.sendMessage(m.chat, { 
          text: infoBot + '\n\n' + categoryListText,
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'image') {
      try {
        console.log('[INFO] Memulai pengiriman image dengan URL:', global.thumb);
        const startTime = Date.now();
        if (!(await isValidUrl(global.thumb))) {
          console.warn('[WARN] URL thumbnail tidak valid, menggunakan defaultImageUrl');
          await conn.sendMessage(m.chat, {
            image: { url: defaultImageUrl },
            caption: infoBot + '\n\n' + categoryListText,
            contextInfo: global.fakeig.contextInfo
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, {
            image: { url: global.thumb },
            caption: infoBot + '\n\n' + categoryListText,
            contextInfo: global.fakeig.contextInfo
          }, { quoted: m });
        }
        console.log('[INFO] Pesan image berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim image:', err);
        await conn.sendMessage(m.chat, { 
          text: infoBot + '\n\n' + categoryListText,
          contextInfo: global.fakeig.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'button') {
      try {
        console.log('[INFO] Memulai pengiriman button menu dengan URL:', global.thumb);
        const startTime = Date.now();
        const thumbUrl = (await isValidUrl(global.thumb)) ? global.thumb : defaultImageUrl;
        await conn.sendMessage(m.chat, {
          image: { url: thumbUrl },
          caption: infoBot + '\n\n' + categoryListText,
          footer: global.namebot,
          buttons: [
            {
              buttonId: '.sc',
              buttonText: { displayText: '𝗦𝗖𝗥𝗜𝗣𝗧 📁' },
              type: 1
            },
            {
              buttonId: '.owner',
              buttonText: { displayText: '𝗢𝗪𝗡𝗘𝗥 👑' },
              type: 1
            },
            {
              buttonId: '.donasi',
              buttonText: { displayText: '𝗗𝗢𝗡𝗔𝗦𝗜 💰' },
              type: 1
            }
          ],
          headerType: 4,
          viewOnce: true
        }, { quoted: m });
        console.log('[INFO] Pesan button berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim button menu:', err);
        await conn.sendMessage(m.chat, { 
          text: infoBot + '\n\n' + categoryListText,
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'mix') {
      try {
        console.log('[INFO] Memulai pengiriman mix menu dengan URL:', global.thumb);
        const startTime = Date.now();
        const thumbUrl = (await isValidUrl(global.thumb)) ? global.thumb : defaultImageUrl;

        let listMessage = {
          title: 'LIST MENU',
          sections: [{
            title: '‼️ SILAHKAN PILIH KATEGORI YANG KAMU INGINKAN',
            highlight_label: 'Hot 🥵',
            rows: rows.map(row => ({
              header: row.title,
              title: row.title,
              description: row.description,
              id: row.id
            }))
          }]
        };

        await conn.sendMessage(m.chat, {
          image: { url: thumbUrl },
          caption: infoBot,
          footer: global.namebot,
          buttons: [
            {
              buttonId: '.sc',
              buttonText: { displayText: '𝗦𝗖𝗥𝗜𝗣𝗧 📁' },
              type: 1
            },
            {
              buttonId: '.owner',
              buttonText: { displayText: '𝗢𝗪𝗡𝗘𝗥 👑' },
              type: 1
            },
            {
              buttonId: 'action',
              buttonText: { displayText: '𝗞𝗔𝗧𝗘𝗚𝗢𝗥' },
              type: 4,
              nativeFlowInfo: {
                name: 'single_select',
                paramsJson: JSON.stringify(listMessage)
              }
            }
          ],
          headerType: 1,
          viewOnce: true
        }, { quoted: m });
        console.log('[INFO] Pesan mix berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim mix menu:', err);
        await conn.sendMessage(m.chat, { 
          text: infoBot + '\n\n' + categoryListText,
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'gift') {
      try {
        console.log('[INFO] Memulai pengiriman gift menu dengan URL:', global.gifmenu);
        const startTime = Date.now();
        const gifUrl = (await isValidUrl(global.gifmenu)) ? global.gifmenu : 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWQyY2NtY3J2d2V4b2N6Z2N4dW5wYzZ6eGJjZ3RqZzZ1bGJmYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT5LMHxhOfscxPfIfm/giphy.gif';
        await conn.sendMessage(m.chat, {
          video: { url: gifUrl },
          gifPlayback: true,
          caption: infoBot + '\n\n' + categoryListText,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: `${global.namebot} - Version ${version}`,
              body: `Powered by ${nameowner}`,
              thumbnailUrl: global.thumb || 'https://i.ibb.co/Fb2z8jz/zhenya-menu.jpg',
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: 'https://wa.me/' + (global.rowner || '6287832743170'),
            },
          },
        }, { quoted: m });
        console.log('[INFO] Pesan gift berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim gift menu:', err);
        await conn.sendMessage(m.chat, { 
          text: infoBot + '\n\n' + categoryListText,
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    }
    // Kirim VN setelah menu dikirim
    if (!args[0]) {
      try {
        await conn.sendMessage(m.chat, { 
          audio: { url: 'https://qu.ax/iFGOK.mp3' },
          mimetype: 'audio/aac',
          ptt: true
        }, { quoted: m });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim VN:', err);
      }
    }
  } else if (tagCount[perintah]) {
    let daftarHelp = tagHelpMapping[perintah] || [];
    if (!Array.isArray(daftarHelp)) {
      daftarHelp = [];
    }

    if (daftarHelp.length === 0) {
      await conn.reply(m.chat, `Tidak ada perintah dengan kategori *${perintah.toUpperCase()}* yang tersedia.`, m);
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      return;
    }

    const list2 = `╭─⋆ MENU ${perintah.toUpperCase()}\n▣─────────────•\n${daftarHelp.map((helpItem) => `├ .${helpItem}`).join('\n')}\n▣─────────────•`;

    if (settings.setmenu === 'simple') {
      await conn.sendMessage(m.chat, { 
        text: list2, 
        contextInfo: global.adReply.contextInfo
      }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else if (settings.setmenu === 'payment') {
      await conn.relayMessage(m.chat, {
        requestPaymentMessage: {
          currencyCodeIso4217: 'IDR',
          amount1000: 999999999 * 1000, // Rp. 70.000
          requestFrom: '0@s.whatsapp.net',
          noteMessage: {
            extendedTextMessage: {
              text: list2,
              contextInfo: global.adReply.contextInfo
            }
          },
          contextInfo: global.adReply.contextInfo
        }
      }, {});
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else if (settings.setmenu === 'edit') {
      const arr = [
        { text: `➳ *L*`, timeout: 60 },
        { text: `➳ *L O*`, timeout: 60 },
        { text: `➳ *L O A*`, timeout: 60 },
        { text: `➳ *L O A D*`, timeout: 60 },
        { text: `➳ *L O A D I*`, timeout: 60 },
        { text: `➳ *L O A D I N*`, timeout: 60 },
        { text: `➳ *L O A D I N G*`, timeout: 60 },
        { text: `➳ *L O A D I N G .*`, timeout: 60 },
        { text: `➳ *L O A D I N G . .*`, timeout: 60 },
        { text: `➳ *L O A D I N G . . .*`, timeout: 60 },
        { text: `➳ *L O A D I N G . .*`, timeout: 60 },
        { text: `➳ *L O A D I N G .*`, timeout: 60 },
        { text: `➳ *L O A D I N G*`, timeout: 60 },
        { text: `➳ *W E L C O M E*`, timeout: 60 },
        { text: list2, timeout: 60 },
      ];
      let { key } = await conn.sendMessage(m.chat, {
        text: `➳ *Please Wait...*`,
        contextInfo: global.adReply.contextInfo
      }, { quoted: m });
      for (let i = 0; i < arr.length; i++) {
        await new Promise(resolve => setTimeout(resolve, arr[i].timeout));
        await conn.sendMessage(m.chat, {
          text: arr[i].text,
          edit: key,
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
      }
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else if (settings.setmenu === 'buttonlist') {
      let rows = daftarHelp.map((helpItem, index) => ({
        title: `.${helpItem}`.substring(0, 24),
        id: `${usedPrefix}${helpItem}`,
        description: ''
      }));

      let listMessage = {
        title: `MENU ${perintah.toUpperCase()}`,
        sections: [{
          title: '‼️ SILAHKAN PILIH SALAH SATU PERINTAH',
          rows
        }]
      };

      try {
        let msg = generateWAMessageFromContent(m.chat, {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: list2
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: `\n📝 Untuk informasi lebih lanjut bisa menghubungi owner.\n– nomor owner :\n wa.me/${global.rowner || '6287832743170'}\n\n> https://ẉ.ceo/andiiii`
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              title: `${global.namebot || 'BenZz'}`,
              hasMediaAttachment: global.thumb ? true : false,
              ...(global.thumb ? await prepareWAMessageMedia({ image: { url: global.thumb } }, { upload: conn.waUploadToServer }).catch(() => ({})) : {})
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify(listMessage)
                }
              ]
            })
          })
        }, { userJid: m.chat, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim buttonlist untuk kategori:', err);
        await conn.sendMessage(m.chat, { 
          text: list2, 
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'image') {
      try {
        console.log('[INFO] Memulai pengiriman image dengan URL:', global.thumb);
        const startTime = Date.now();
        if (!(await isValidUrl(global.thumb))) {
          console.warn('[WARN] URL thumbnail tidak valid, menggunakan defaultImageUrl');
          await conn.sendMessage(m.chat, {
            image: { url: defaultImageUrl },
            caption: list2,
            contextInfo: global.fakeig.contextInfo
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, {
            image: { url: global.thumb },
            caption: list2,
            contextInfo: global.fakeig.contextInfo
          }, { quoted: m });
        }
        console.log('[INFO] Pesan image berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim image:', err);
        await conn.sendMessage(m.chat, { 
          text: list2, 
          contextInfo: global.fakeig.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'button') {
      try {
        console.log('[INFO] Memulai pengiriman button menu dengan URL:', global.thumb);
        const startTime = Date.now();
        const thumbUrl = (await isValidUrl(global.thumb)) ? global.thumb : defaultImageUrl;
        await conn.sendMessage(m.chat, {
          image: { url: thumbUrl },
          caption: list2,
          footer: global.namebot,
          buttons: [
            {
              buttonId: '.sc',
              buttonText: { displayText: '𝗦𝗖𝗥𝗜𝗣𝗧 📁' },
              type: 1
            },
            {
              buttonId: '.owner',
              buttonText: { displayText: '𝗢𝗪𝗡𝗘𝗥 👑' },
              type: 1
            },
            {
              buttonId: '.donasi',
              buttonText: { displayText: '𝗗𝗢𝗡𝗔𝗦𝗜 💰' },
              type: 1
            }
          ],
          headerType: 4,
          viewOnce: true
        }, { quoted: m });
        console.log('[INFO] Pesan button berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim button menu:', err);
        await conn.sendMessage(m.chat, { 
          text: list2, 
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'mix') {
      try {
        console.log('[INFO] Memulai pengiriman mix menu dengan URL:', global.thumb);
        const startTime = Date.now();
        const thumbUrl = (await isValidUrl(global.thumb)) ? global.thumb : defaultImageUrl;

        let rows = daftarHelp.map((helpItem, index) => ({
          header: `Perintah ${index + 1}`,
          title: `.${helpItem}`,
          description: `Gunakan perintah .${helpItem}`,
          id: `${usedPrefix}${helpItem}`
        }));

        let listMessage = {
          title: `MENU ${perintah.toUpperCase()}`,
          sections: [{
            title: '‼️ SILAHKAN PILIH SALAH SATU PERINTAH',
            highlight_label: 'Hot 🥵',
            rows
          }]
        };

        await conn.sendMessage(m.chat, {
          image: { url: thumbUrl },
          caption: list2,
          footer: global.namebot,
          buttons: [
            {
              buttonId: '.sc',
              buttonText: { displayText: '𝗦𝗖𝗥𝗜𝗣𝗧 📁' },
              type: 1
            },
            {
              buttonId: '.owner',
              buttonText: { displayText: '𝗢𝗪𝗡𝗘𝗥 👑' },
              type: 1
            },
            {
              buttonId: 'action',
              buttonText: { displayText: '𝗣𝗜𝗟𝗜𝗛 𝗣𝗘𝗥𝗜𝗡𝗧𝗔𝗛' },
              type: 4,
              nativeFlowInfo: {
                name: 'single_select',
                paramsJson: JSON.stringify(listMessage)
              }
            }
          ],
          headerType: 1,
          viewOnce: true
        }, { quoted: m });
        console.log('[INFO] Pesan mix berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim mix menu:', err);
        await conn.sendMessage(m.chat, { 
          text: list2, 
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'gift') {
      try {
        console.log('[INFO] Memulai pengiriman gift menu dengan URL:', global.gifmenu);
        const startTime = Date.now();
        const gifUrl = (await isValidUrl(global.gifmenu)) ? global.gifmenu : 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWQyY2NtY3J2d2V4b2N6Z2N4dW5wYzZ6eGJjZ3RqZzZ1bGJmYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT5LMHxhOfscxPfIfm/giphy.gif';
        await conn.sendMessage(m.chat, {
          video: { url: gifUrl },
          gifPlayback: true,
          caption: list2,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: `${global.namebot} - Version ${version}`,
              body: `Powered by ${nameowner}`,
              thumbnailUrl: global.thumb || 'https://i.ibb.co/Fb2z8jz/zhenya-menu.jpg',
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: 'https://wa.me/' + (global.rowner || '6287832743170'),
            },
          },
        }, { quoted: m });
        console.log('[INFO] Pesan gift berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim gift menu:', err);
        await conn.sendMessage(m.chat, { 
          text: list2, 
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    }
    // Kirim VN setelah menu dikirim
    if (!args[0]) {
      try {
        await conn.sendMessage(m.chat, { 
          audio: { url: 'https://qu.ax/iFGOK.mp3' },
          mimetype: 'audio/aac',
          ptt: true
        }, { quoted: m });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim VN:', err);
      }
    }
  } else if (perintah === 'all') {
    let name = m.pushName || conn.getName(m.sender);
    const more = String.fromCharCode(8206);
    const readMore = more.repeat(4001);
    const allTagsAndHelp = Object.keys(tagCount)
      .map(tag => {
        let daftarHelp = tagHelpMapping[tag] || [];
        if (!Array.isArray(daftarHelp)) {
          daftarHelp = [];
        }

        if (daftarHelp.length === 0) {
          return `╭─⋆ *MENU ${tag.toUpperCase()}*\n▣─────────────•\n> Tidak ada perintah yang tersedia.\n▣─────────────•`;
        }

        const helpText = daftarHelp.map((helpItem) => `├ .${helpItem}`).join('\n');
        return `╭─⋆ *MENU ${tag.toUpperCase()}*\n▣─────────────•\n${helpText}\n▣─────────────•`;
      })
      .join('\n\n');

    // 🧍 Nama pengguna
    let userName = m.pushName || conn.getName(m.sender) || m.sender.split('@')[0];

    // 📅 Hari & tanggal Jawa
    let { hariPasaran, tanggal } = getTanggalJawa(new Date());

    let all = `
···─── ⋆⋅ 𓆩👁𓆪 ⋅⋆ ───···
▣─────────────•
> *.𖦹˙ NAMA : ${userName}*
> *.𖦹˙ BOT : ${namebot}*  
> *.𖦹˙ OWNER : ${nameowner}*  
> *.𖦹˙ VERSION : ${version}* 
> *.𖦹˙ STATUS : ${global.opts['self'] ? 'self' : 'public'}*  
> *.𖦹˙ HARI : ${hariPasaran}*
> *.𖦹˙ TANGGAL : ${tanggal}*
> *.𖦹˙ JAM : ${await DateNow(new Date)}*
▣─────────────•

⊹ ࣪ ﹏𓊝﹏𓂁﹏⊹﹏𓊝﹏𓂁﹏⊹࣪ ˖
> 𝐒 𝐄 𝐌 𝐔 𝐀 - 𝐌 𝐄 𝐍 𝐔
⊹ ࣪ ﹏𓊝﹏𓂁﹏⊹﹏𓊝﹏𓂁﹏⊹࣪ ˖
\n\n${allTagsAndHelp}`;

    if (settings.setmenu === 'simple') {
      await conn.sendMessage(m.chat, { 
        text: all, 
        contextInfo: global.adReply.contextInfo
      }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else if (settings.setmenu === 'payment') {
      await conn.relayMessage(m.chat, {
        requestPaymentMessage: {
          currencyCodeIso4217: 'IDR',
          amount1000: 70000 * 1000, // Rp. 70.000
          requestFrom: '0@s.whatsapp.net',
          noteMessage: {
            extendedTextMessage: {
              text: all,
              contextInfo: global.adReply.contextInfo
            }
          },
          contextInfo: global.adReply.contextInfo
        }
      }, {});
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else if (settings.setmenu === 'edit') {
      const arr = [
        { text: `➳ *L*`, timeout: 60 },
        { text: `➳ *L O*`, timeout: 60 },
        { text: `➳ *L O A*`, timeout: 60 },
        { text: `➳ *L O A D*`, timeout: 60 },
        { text: `➳ *L O A D I*`, timeout: 60 },
        { text: `➳ *L O A D I N*`, timeout: 60 },
        { text: `➳ *L O A D I N G*`, timeout: 60 },
        { text: `➳ *L O A D I N G .*`, timeout: 60 },
        { text: `➳ *L O A D I N G . .*`, timeout: 60 },
        { text: `➳ *L O A D I N G . . .*`, timeout: 60 },
        { text: `➳ *L O A D I N G . .*`, timeout: 60 },
        { text: `➳ *L O A D I N G .*`, timeout: 60 },
        { text: `➳ *L O A D I N G*`, timeout: 60 },
        { text: `➳ *W E L C O M E*`, timeout: 60 },
        { text: all, timeout: 60 },
      ];
      let { key } = await conn.sendMessage(m.chat, {
        text: `➳ *Please Wait...*`,
        contextInfo: global.adReply.contextInfo
      }, { quoted: m });
      for (let i = 0; i < arr.length; i++) {
        await new Promise(resolve => setTimeout(resolve, arr[i].timeout));
        await conn.sendMessage(m.chat, {
          text: arr[i].text,
          edit: key,
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
      }
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else if (settings.setmenu === 'buttonlist') {
      let rows = [];
      Object.keys(tagCount).forEach(tag => {
        let daftarHelp = tagHelpMapping[tag] || [];
        if (!Array.isArray(daftarHelp)) daftarHelp = [];
        if (daftarHelp.length > 0) {
          rows.push({
            title: tag === 'all' ? `MENU ALL` : `MENU ${tag.toUpperCase()}`,
            id: `${usedPrefix + command} ${tag}`,
            description: `╰┈➤ total fitur : ${(tagHelpMapping[tag] || []).length}`
          });
        }
      });

      let listMessage = {
        title: 'SEMUA MENU',
        sections: [{
          title: '‼️ PILIH KATEGORI YANG KAMU INGINKAN',
          rows
        }]
      };

      try {
        let msg = generateWAMessageFromContent(m.chat, {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: all
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: `\n📝 Untuk informasi lebih lanjut bisa menghubungi owner.\n– nomor owner :\n wa.me/${global.rowner || '6287832743170'}\n\n> https://ẉ.ceo/andiiii`
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              title: `${global.namebot || 'BeZz'}`,
              hasMediaAttachment: global.thumb ? true : false,
              ...(global.thumb ? await prepareWAMessageMedia({ image: { url: global.thumb } }, { upload: conn.waUploadToServer }).catch(() => ({})) : {})
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify(listMessage)
                }
              ]
            })
          })
        }, { userJid: m.chat, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: m.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim buttonlist untuk semua menu:', err);
        await conn.sendMessage(m.chat, { 
          text: all, 
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'image') {
      try {
        console.log('[INFO] Memulai pengiriman image dengan URL:', global.thumb);
        const startTime = Date.now();
        if (!(await isValidUrl(global.thumb))) {
          console.warn('[WARN] URL thumbnail tidak valid, menggunakan defaultImageUrl');
          await conn.sendMessage(m.chat, {
            image: { url: defaultImageUrl },
            caption: all,
            contextInfo: global.fakeig.contextInfo
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, {
            image: { url: global.thumb },
            caption: all,
            contextInfo: global.fakeig.contextInfo
          }, { quoted: m });
        }
        console.log('[INFO] Pesan image berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim image:', err);
        await conn.sendMessage(m.chat, { 
          text: all, 
          contextInfo: global.fakeig.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'button') {
      try {
        console.log('[INFO] Memulai pengiriman button menu dengan URL:', global.thumb);
        const startTime = Date.now();
        const thumbUrl = (await isValidUrl(global.thumb)) ? global.thumb : defaultImageUrl;
        await conn.sendMessage(m.chat, {
          image: { url: thumbUrl },
          caption: all,
          footer: global.namebot,
          buttons: [
            {
              buttonId: '.sc',
              buttonText: { displayText: '𝗦𝗖𝗥𝗜𝗣𝗧 📁' },
              type: 1
            },
            {
              buttonId: '.owner',
              buttonText: { displayText: '𝗢𝗪𝗡𝗘𝗥 👑' },
              type: 1
            },
            {
              buttonId: '.donasi',
              buttonText: { displayText: '𝗗𝗢𝗡𝗔𝗦𝗜 💰' },
              type: 1
            }
          ],
          headerType: 4,
          viewOnce: true
        }, { quoted: m });
        console.log('[INFO] Pesan button berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim button menu:', err);
        await conn.sendMessage(m.chat, { 
          text: all, 
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'mix') {
      try {
        console.log('[INFO] Memulai pengiriman mix menu dengan URL:', global.thumb);
        const startTime = Date.now();
        const thumbUrl = (await isValidUrl(global.thumb)) ? global.thumb : defaultImageUrl;

        let rows = [];
        Object.keys(tagCount).forEach(tag => {
          let daftarHelp = tagHelpMapping[tag] || [];
          if (!Array.isArray(daftarHelp)) daftarHelp = [];
          if (daftarHelp.length > 0) {
            rows.push({
              header: `Kategori ${tag.toUpperCase()}`,
              title: tag === 'all' ? `MENU ALL` : `MENU ${tag.toUpperCase()}`,
              description: `╰┈➤ total fitur : ${(tagHelpMapping[tag] || []).length}`,
              id: `${usedPrefix + command} ${tag}`
            });
          }
        });

        let listMessage = {
          title: 'SEMUA MENU',
          sections: [{
            title: '‼️ PILIH KATEGORI YANG KAMU INGINKAN',
            highlight_label: 'Hot 🥵',
            rows
          }]
        };

        await conn.sendMessage(m.chat, {
          image: { url: thumbUrl },
          caption: all,
          footer: global.namebot,
          buttons: [
            {
              buttonId: '.sc',
              buttonText: { displayText: '𝗦𝗖𝗥𝗜𝗣𝗧 📁' },
              type: 1
            },
            {
              buttonId: '.owner',
              buttonText: { displayText: '𝗢𝗪𝗡𝗘𝗥 👑' },
              type: 1
            },
            {
              buttonId: 'action',
              buttonText: { displayText: '𝗞𝗔𝗧𝗘𝗚𝗢𝗥𝗜' },
              type: 4,
              nativeFlowInfo: {
                name: 'single_select',
                paramsJson: JSON.stringify(listMessage)
              }
            }
          ],
          headerType: 1,
          viewOnce: true
        }, { quoted: m });
        console.log('[INFO] Pesan mix berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim mix menu:', err);
        await conn.sendMessage(m.chat, { 
          text: all, 
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    } else if (settings.setmenu === 'gift') {
      try {
        console.log('[INFO] Memulai pengiriman gift menu dengan URL:', global.gifmenu);
        const startTime = Date.now();
        const gifUrl = (await isValidUrl(global.gifmenu)) ? global.gifmenu : 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWQyY2NtY3J2d2V4b2N6Z2N4dW5wYzZ6eGJjZ3RqZzZ1bGJmYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT5LMHxhOfscxPfIfm/giphy.gif';
        await conn.sendMessage(m.chat, {
          video: { url: gifUrl },
          gifPlayback: true,
          caption: all,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: `${global.namebot} - Version ${version}`,
              body: `Powered by ${nameowner}`,
              thumbnailUrl: global.thumb || 'https://i.ibb.co/Fb2z8jz/zhenya-menu.jpg',
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: 'https://wa.me/' + (global.rowner || '6287832743170'),
            },
          },
        }, { quoted: m });
        console.log('[INFO] Pesan gift berhasil dikirim, waktu: ', (Date.now() - startTime) / 1000, 'detik');
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim gift menu:', err);
        await conn.sendMessage(m.chat, { 
          text: all, 
          contextInfo: global.adReply.contextInfo
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      }
    }
    // Kirim VN setelah menu dikirim
    if (!args[0]) {
      try {
        await conn.sendMessage(m.chat, { 
          audio: { url: 'https://qu.ax/iFGOK.mp3' },
          mimetype: 'audio/aac',
          ptt: true
        }, { quoted: m });
      } catch (err) {
        console.error('[ERROR] Gagal mengirim VN:', err);
      }
    }
  } else {
    await conn.reply(m.chat, `*MENU APA ITU PAKCIK? 😹*`, m);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  }
};

menulist.help = ['menu'];
menulist.tags = ['main'];
menulist.command = ['menu'];
menulist.register = true;
module.exports = menulist;