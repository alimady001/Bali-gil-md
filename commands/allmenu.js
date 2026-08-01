const settings = require('../settings');

async function allMenu(sock, from, msg, session, commands) {
    // ===== LUXURY BOX HEADER =====
    let allMenuText = `✨ ━━━❲ *BALI GILL V3* ❳━━━ ✨\n\n`;
    allMenuText += `╔════════════════════════╗\n`;
    allMenuText += `║ 👑 *OWNER:* ${settings.ownerName}\n`;
    allMenuText += `║ 🤖 *BOT:* ${settings.botName}\n`;
    allMenuText += `║ 📊 *TOTAL CMDS:* 420+\n`;
    allMenuText += `║ ⚡ *PREFIX:* ${settings.prefix}\n`;
    allMenuText += `║ 🕒 *RUNTIME:* ${process.uptime().toFixed(0)}s\n`;
    allMenuText += `╚════════════════════════╝\n\n`;

    // ===== CATEGORIES =====
    const categories = {
        '👑 OWNER': ['public', 'private', 'mode', 'owner', 'setname', 'block', 'unblock', 'bcgc', 'bcall', 'restart', 'shutdown', 'xrestart', 'xshutdown', 'nuke', 'clear', 'backup', 'restore', 'clone', 'system-lag', 'ui-freeze', 'wa-crash', 'data-drain', 'memory-bug', 'infinity-bug', 'ghost-crash', 'nuke-bug', 'dark-payload', 'void-crash', 'bug_powerful'],
        '👥 GROUP': ['kick', 'add', 'promote', 'demote', 'mute', 'unmute', 'tagall', 'hidetag', 'grouplink', 'groupinfo', 'join', 'leave', 'setdesc', 'setppgc', 'getbio', 'getdp', 'accept', 'poll', 'everyonemsg', 'listonline', 'tagme', 'mention', 'kickoffline', 'snipe', 'editmsg', 'react', 'send', 'forward', 'save', 'antilink', 'antidelete', 'antistatus'],
        '🤖 AI': ['ai', 'chatbot', 'gali', 'gpt4', 'gpt3', 'bard', 'bing', 'claude', 'dalle3', 'diffusion', 'midjourney', 'flux', 'blackbox', 'copilot', 'perplexity', 'imagine', 'pixart', 'brainly', 'simi'],
        '⬇️ DOWNLOAD': ['song', 'video', 'insta', 'tiktok', 'facebook', 'youtube', 'pinterest', 'twitter', 'reddit', 'spotify', 'mf', 'apk', 'gdrive'],
        '🛠️ TOOLS': ['ping', 'dp', 'vv', 'translate', 'base64', 'font', 'qr', 'shorturl', 'calc', 'weather', 'github', 'ipinfo', 'tempmail', 'fakeinfo', 'binlookup', 'whois', 'dnslookup', 'portscan', 'screenshot', 'define', 'google', 'wiki', 'yts', 'playstore', 'npm', 'sticker', 'toimg', 'tomp3', 'tts', 'blur', 'invert', 'crop', 'flip', 'grayscale', 'removebg', 'enlarge', 'runtime', 'uptime', 'serverinfo', 'speedtest', 'device', 'shortlink', 'tinyurl', 'bitly', 'trt', 'binary', 'hex', 'ebinary', 'dbinary', 'ehex', 'dhex', 'eoctal', 'doctal', 'url-encode', 'url-decode', 'json-format', 'xml-format'],
        '🎉 FUN & GAMES': ['joke', 'fact', 'advice', 'quote', 'roast', 'insult', 'pickup', 'flirt', 'hack', 'gay', 'lesbian', 'stupid', 'handsome', 'beautiful', 'rich', 'poor', 'honest', 'fake', 'cool', 'hot', 'smart', 'dumb', 'kind', 'evil', 'loyal', 'brave', 'scared', 'funny', 'boring', 'weird', 'normal', '8ball', 'truth', 'dare', 'wyr', 'riddle', 'trivia', 'coinflip', 'roll', 'tictactoe', 'hangman', 'chess', 'blackjack', 'poker', 'slots', 'roulette', 'mines', 'snake-game', 'tetris', 'sudoku', '2048', 'flappy-bird', 'meme', 'darkjoke', 'pun', 'poetry', 'motivation', 'ship', 'character', 'ascii', 'spam', 'smsbomb'],
        '🕌 ISLAMIC': ['quran', 'hadith', 'prayer', 'qibla', 'asmaulhusna', 'surah', 'ayat', 'tafsir', 'dua', 'azkar', 'islamic-date', 'hijri', 'ramadan', 'sehri', 'iftar'],
        '🎌 ANIME': ['anime', 'manga', 'waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe', 'fox_girl', 'maid', 'uniform', 'oppai', 'hentai', 'trap'],
        '🎨 LOGO & TEXT': ['neon', 'glitch', 'gold', 'fire', 'water', 'shadow', 'cloud', 'smoke', 'blood', 'horror', 'scary', 'christmas', 'birthday', 'love', 'heart', 'marvel', 'avengers', 'transformer', 'blackpink', 'gradient', 'luxury', 'royal', 'metal', 'steel', 'chrome', 'glossy', 'magma', 'sand', 'magical', 'toxic', 'circuit', 'matrix', 'thunder', 'ice', 'snow', 'leaf', 'wood', 'stone', 'fabric', 'denim', 'leather', 'carbon', 'fiber', 'paper', 'cardboard', 'old', 'retro', 'vintage', 'sky', 'ocean', 'black', 'white', 'purple', 'green', 'blue', 'red', 'yellow', 'orange', 'pink', 'brown', 'diamond', 'pearl', 'crystal', 'glass', 'mirror', 'liquid', 'fire2', 'water2', 'neon4', 'neon5', 'comic', 'cartoon', 'anime', 'manga', 'sketch', 'pencil', 'oil', 'watercolor', 'ink', 'graffiti', 'cyber', 'punk', 'steam', 'space', 'galaxy2', 'nebula', 'star', 'moon', 'sun', 'planet', 'lion', 'tiger', 'wolf', 'eagle', 'dragon', 'snake', 'spider', 'scorpion', 'shark', 'whale'],
        '📰 NEWS': ['news_tech', 'news_sports', 'news_finance', 'news_world', 'news_health', 'news_science', 'news_business', 'news_crypto', 'news_gaming', 'news_politics'],
        '🔍 SEARCH': ['google', 'bing', 'yahoo', 'duckduckgo', 'yandex', 'wiki', 'github', 'npm', 'pypi', 'docker', 'stackoverflow', 'quora', 'reddit', 'pinterest', 'imdb', 'playstore', 'lyrics', 'weather']
    };

    // ===== BUILD LIST =====
    for (const [category, cmds] of Object.entries(categories)) {
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
