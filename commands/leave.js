module.exports = async function(sock, chatId, msg, isAdmin) {
    if (!isAdmin) return await sock.sendMessage(chatId, { text: '❌ Only admin!' }, { quoted: msg });
    
    try {
        await sock.sendMessage(chatId, { text: '🚪 Leaving group... Goodbye!' });
        await sock.groupLeave(chatId);
    } catch (e) {
        const errText = e && e.message ? e.message : String(e);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + errText }, { quoted: msg });
    }
};
