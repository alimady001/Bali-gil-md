const axios = require('axios');
const settings = require('../settings');

function onlyDigits(s = '') { 
    return String(s).replace(/\D/g, ''); 
}

module.exports = async function(sock, chatId, message, q) {
    try {
        await sock.sendMessage(chatId, { react: { text: '📞', key: message.key } });
        
        if (!q) return await sock.sendMessage(chatId, { text: '⚠️ Usage: .callbomb <number>' }, { quoted: message });

        const target = onlyDigits(q);
        if (target.length < 10) return await sock.sendMessage(chatId, { text: '❌ Invalid number' }, { quoted: message });

        await sock.sendMessage(chatId, { 
            text: `📞 *BALI CALL BOMBER* 📞\n\n👤 *Target:* +${target}\n📊 *Status:* Initiating Call Bombing Attack\n\n_Please wait..._` 
        }, { quoted: message });

        // Using a reliable API for call bombing if available, otherwise simulate
        const apiUrl = `https://api.siputzx.my.id/api/tools/callbomb?number=${target}`;
        
        let apiSuccess = false;
        let statusCode = null;
        try {
            const res = await axios.get(apiUrl, {
                timeout: 15000,
                validateStatus: () => true
            });
            statusCode = res.status;
            apiSuccess = res.status >= 200 && res.status < 300 && (!res.data || res.data.status !== false);
        } catch (e) {
            console.error('Call Bomb API error:', e.message);
        }

        if (apiSuccess) {
            await sock.sendMessage(chatId, { 
                text: `✅ *CALL BOMBING COMPLETE*\n\n👤 *Target:* +${target}\n⚡ *Result:* Attack executed successfully!` 
            }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        } else {
            const statusText = statusCode ? ` (HTTP ${statusCode})` : '';
            await sock.sendMessage(chatId, {
                text: `❌ Call Bomb API unavailable${statusText}. Please try again later.`
            }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        }

    } catch(err) { 
        console.error('Call Bomb Error:', err);
        await sock.sendMessage(chatId, { text: '❌ Error: ' + err.message }, { quoted: message }); 
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
    }
};
