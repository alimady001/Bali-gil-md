module.exports = async function(sock, chatId, msg, q) {
    if (!q) return await sock.sendMessage(chatId, { text: '\u26A0\uFE0F .editmsg <new text>' }, { quoted: msg });
    
    try {
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedKey = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
        const targetKey = quotedKey ? { remoteJid: chatId, id: quotedKey, fromMe: true } : msg.key;
        
        await sock.sendMessage(chatId, { text: q, edit: targetKey });
    } catch (e) {
        await sock.sendMessage(chatId, { text: '\u274C Error: ' + e.message }, { quoted: msg });
    }
};
