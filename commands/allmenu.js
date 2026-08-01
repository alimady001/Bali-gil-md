const settings = require('../settings');

async function allMenu(sock, from, msg, session, commands) {
    // ===== LUXURY BOX HEADER =====
    let allMenuText = `✨ ━━━❲ *BALI GILL V3* ❳━━━ ✨\n\n`;
    allMenuText += `╔════════════════════════╗\n`;
    allMenuText += `║ 👑 *OWNER:* ${settings.ownerName}\n`;
    allMenuText += `║ 🤖 *BOT:* ${settings.botName}\n`;
    allMenuText += `║ 📊 *TOTAL CMDS:* 400+\n`;
    allMenuText += `║ ⚡ *PREFIX:* ${settings.prefix}\n`;
    allMenuText += `║ 🕒 *RUNTIME:* ${process.uptime().toFixed(0)}s\n`;
    allMenuText += `╚════════════════════════╝\n\n`;

    // ===== CATEGORIES =====
    const categories = {
        '👑 OWNER': ['public', 'private', 'mode', 'owner', 'setname', 'block', 'unblock', 'bcgc', 'bcall', 'restart', 'shutdown', 'xrestart', 'xshutdown', 'nuke', 'clear', 'backup', 'restore', 'clone'],
        '👥 GROUP': ['kick', 'add', 'promote', 'demote', 'mute', 'unmute', 'tagall', 'hidetag', 'grouplink', 'groupinfo', 'join', 'leave', 'setdesc', 'setppgc', 'getbio', 'getdp', 'accept', 'poll', 'everyonemsg', 'listonline', 'tagme', 'mention', 'kickoffline', 'snipe', 'editmsg', 'react', 'send', 'forward', 'save', 'antilink', 'antidelete', 'antistatus'],
        '🤖 AI': ['ai', 'chatbot', 'gali', 'chatgpt', 'gemini', 'llama', 'deepseek', 'mistral', 'flux', 'dalle', 'stable-diffusion', 'midjourney', 'bingai', 'blackbox', 'copilot', 'perplexity', 'imagine', 'pixart'],
        '⬇️ DOWNLOAD': ['song', 'video', 'insta', 'tiktok', 'facebook', 'youtube', 'pinterest', 'twitter', 'reddit', 'spotify', 'mf', 'apk', 'gdrive'],
        '🛠️ TOOLS': ['ping', 'dp', 'vv', 'translate', 'base64', 'font', 'qr', 'shorturl', 'calc', 'weather', 'github', 'ipinfo', 'tempmail', 'fakeinfo', 'binlookup', 'whois', 'dnslookup', 'portscan', 'screenshot', 'define', 'google', 'wiki', 'yts', 'playstore', 'npm', 'sticker', 'toimg', 'tomp3', 'tts', 'blur', 'invert', 'crop', 'flip', 'grayscale', 'removebg', 'enlarge', 'runtime', 'uptime', 'serverinfo', 'speedtest', 'device'],
        '🎉 FUN': ['joke', 'meme', 'dare', 'truth', 'ascii', 'roast', 'compliment', 'ship', 'emojimix', 'character', 'quote', 'fact', 'trivia', 'coinflip', 'roll', 'riddle', 'wouldyourather', 'hack', 'report', 'spam', 'smsbomb', 'callbomb', 'crash', 'freeze', 'lag', 'bug', 'bug_powerful', 'locspam', 'vcardspam', 'buttonspam', 'pollspam', 'contactspam'],
        '🕌 ISLAMIC': ['quran', 'hadith', 'prayer', 'qibla', 'asmaulhusna'],
        '🎌 ANIME': ['anime', 'manga', 'waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe'],
        '🎨 LOGO': [],
        '📰 NEWS': [],
        '🔍 SEARCH': [],
        '🎮 EXTRA FUN': [],
        '🔥 BUG V-SERIES': []
    };

    // Add dynamic logos
    for (let i = 1; i <= 50; i++) categories['🎨 LOGO'].push(`logo${i}`);
    
    // Add dynamic news
    const newsSources = ['tech', 'sports', 'finance', 'world', 'health', 'science', 'entertainment', 'business', 'pakistan', 'india', 'usa', 'uk', 'crypto', 'gaming', 'fashion', 'travel', 'food', 'politics', 'education', 'weather_news'];
    newsSources.forEach(s => categories['📰 NEWS'].push(`news_${s}`));
    
    // Add dynamic search
    const searchTools = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex', 'ask', 'aol', 'wolfram', 'archive', 'github_search', 'npm_search', 'pypi_search', 'docker_search', 'stack_overflow', 'quora', 'reddit_search', 'pinterest_search', 'twitter_search', 'insta_search'];
    searchTools.forEach(s => categories['🔍 SEARCH'].push(s));

    // Add extra fun
    for (let i = 1; i <= 50; i++) categories['🎮 EXTRA FUN'].push(`fun${i}`);
    
    // Add bug v-series
    for (let i = 1; i <= 60; i++) categories['🔥 BUG V-SERIES'].push(`bug_v${i}`);

    // ===== BUILD LIST =====
    for (const [category, cmds] of Object.entries(categories)) {
        if (cmds.length === 0) continue;
        
        allMenuText += `╭───❲ *${category}* ❳\n`;
        
        let line = `│ ◈ `;
        cmds.forEach((cmd, index) => {
            line += `.${cmd}`;
            if (index < cmds.length - 1) {
                line += `, `;
                if (line.length > 40) {
                    allMenuText += `${line}\n`;
                    line = `│ ◈ `;
                }
            }
        });
        if (line !== `│ ◈ `) allMenuText += `${line}\n`;
        
        allMenuText += `╰═══════════════════════\n\n`;
    }

    // ===== FOOTER =====
    allMenuText += `🚀 *POWERED BY : ITACHI UCHIA * 🚀\n`;
    allMenuText += `🔗 *CHANNEL:* ${settings.channel}`;

    // ===== SEND =====
    try {
        await sock.sendMessage(from, { image: { url: settings.startimage }, caption: allMenuText }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: allMenuText }, { quoted: msg });
    }
}

module.exports = allMenu;
