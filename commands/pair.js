const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');

async function pairCommand(sock, from, msg, q) {
    if (!q) return sock.sendMessage(from, { text: "❌ Please provide a phone number with country code!\nExample: .pair 923271054080" }, { quoted: msg });

    const phoneNumber = q.replace(/[^0-9]/g, '');
    if (phoneNumber.length < 10) return sock.sendMessage(from, { text: "❌ Invalid phone number!" }, { quoted: msg });

    await sock.sendMessage(from, { text: "🔄 Generating pairing code... Please wait." }, { quoted: msg });

    const tempSessionId = `temp_pair_${Date.now()}`;
    const authPath = path.join(__dirname, '../auth_info', tempSessionId);
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState(authPath);
        const tempSock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'fatal' }),
            browser: Browsers.ubuntu('Chrome'),
        });

        if (!tempSock.authState.creds.registered) {
            await delay(3000);
            let code = await tempSock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;

            const response = `\u{25EC}\u{2501}\u{2501}\u{2501}\u{3008} *BALI GIL PAIRING* \u{3009}\u{2501}\u{2501}\u{2501}\u{25EC}\n\n` +
                             `*\u{1F511} YOUR PAIRING CODE:* \`${code}\`\n\n` +
                             `_Enter this code in your WhatsApp Linked Devices section._\n\n` +
                             `> © POWERED BY BALI GIL MINI BOT v4.0.1`;

            await sock.sendMessage(from, { text: response }, { quoted: msg });
            
            // Cleanup after a short delay
            setTimeout(async () => {
                try {
                    await fs.remove(authPath);
                } catch (e) {}
            }, 60000);
        }
    } catch (err) {
        await sock.sendMessage(from, { text: `\u{274C} Error: ${err.message}` }, { quoted: msg });
        try { await fs.remove(authPath); } catch (e) {}
    }
}

module.exports = pairCommand;
