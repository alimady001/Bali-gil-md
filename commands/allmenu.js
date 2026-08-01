const settings = require('../settings');

async function allMenu(sock, from, msg, session = {}, commands = {}) {
    // Safety defaults for settings
    const ownerName = (settings && settings.ownerName) ? settings.ownerName : 'Owner';
    const botName = (settings && settings.botName) ? settings.botName : 'BALI GIL';
    const prefix = (settings && settings.prefix) ? settings.prefix : '.';
    // Default to the provided WhatsApp channel URL if settings.channel is not set
    const channel = (settings && settings.channel) ? settings.channel : 'https://whatsapp.com/channel/0029VbC1gR3J3jv22YgI511bp';
    const startimage = (settings && settings.startimage) ? settings.startimage : null;

    // ===== HEADER =====
    let allMenuText = `✨ ━━━❲ *${botName} V3* ❳━━━ ✨\n\n`;
    allMenuText += `— Owner: ${ownerName} — ${botName} —\n`;
    allMenuText += `— Total Commands: 420+ — Prefix: ${prefix} — Runtime: ${process.uptime().toFixed(0)}s\n\n`;

    // ===== CHANNEL BLOCK (prominent) =====
    allMenuText += `─────────────────────────\n`;
    allMenuText += ` 🔗 CHANNEL\n`;
    allMenuText += `─────────────────────────\n`;
    // Bold the channel link for visibility
    allMenuText += `*${channel}*\n\n`;

    // ===== CATEGORIES =====
    const categories = {
        'OWNER': ['public', 'private', 'mode', 'owner', 'setname', 'block', 'unblock', 'bcgc', 'bcall', 'restart', 'shutdown', 'backup', 'restore'],
        'GROUP': ['kick', 'add', 'promote', 'demote', 'mute', 'unmute', 'tagall', 'hidetag', 'grouplink', 'groupinfo', 'join', 'leave', 'setdesc', 'setppgc'],
        'AI': ['ai', 'chatbot', 'gali', 'gpt4', 'gpt3', 'bard', 'bing', 'dalle3'],
        'DOWNLOAD': ['song', 'video', 'insta', 'tiktok', 'facebook', 'youtube', 'pinterest', 'twitter', 'reddit', 'spotify'],
        'TOOLS': ['ping', 'dp', 'vv', 'translate', 'base64', 'font', 'qr', 'shorturl', 'calc', 'weather', 'github'],
        'FUN & GAMES': ['joke', 'fact', 'advice', 'quote', 'roast', 'insult', 'pickup', 'flirt'],
        'ISLAMIC': ['quran', 'hadith', 'prayer', 'qibla', 'asmaulhusna', 'surah'],
        'ANIME': ['anime', 'manga', 'waifu', 'neko', 'hug', 'kiss', 'pat'],
        'LOGO & TEXT': ['neon', 'glitch', 'gold', 'fire', 'water', 'shadow'],
        'NEWS': ['news_tech', 'news_sports', 'news_finance', 'news_world', 'news_health'],
        'SEARCH': ['google', 'bing', 'yahoo', 'duckduckgo', 'wiki', 'github', 'npm']
    };

    // ===== BUILD HORIZONTAL LAYOUT =====
    // Each category will be separated by a horizontal divider and list commands in one line separated by " | "
    for (const [category, cmds] of Object.entries(categories)) {
        // Divider with category name centered-ish
        allMenuText += `─────────────────────────\n`;
        allMenuText += ` ${category} \n`;
        allMenuText += `─────────────────────────\n`;

        // Build a single-line list of commands, prefixing each with the configured prefix
        const line = cmds.map(c => `${prefix}${c}`).join(' | ');
        allMenuText += `${line}\n\n`;
    }

    // ===== FOOTER =====
    allMenuText += `🚀 POWERED BY : ITACHI UCHIA 🚀`;

    // ===== SEND =====
    try {
        if (startimage) {
            await sock.sendMessage(from, { image: { url: startimage }, caption: allMenuText }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: allMenuText }, { quoted: msg });
        }
    } catch (e) {
        // Fallback to plain text if image/caption fails or any other error
        try {
            await sock.sendMessage(from, { text: allMenuText }, { quoted: msg });
        } catch (err) {
            console.error('Failed to send allmenu:', err);
        }
    }
}

module.exports = allMenu;
