const axios = require('axios');

const extraCommands = {};

// --- AI CATEGORY ---
const aiTools = {
    gpt4: "chatgpt", gemini: "gemini", llama: "llama", deepseek: "deepseek", 
    mistral: "mistral", flux: "flux", dalle3: "dalle", bingai: "bingai", 
    blackbox: "blackbox", copilot: "copilot", perplexity: "perplexity", 
    imagine: "imagine", pixart: "pixart", brainly: "brainly", simi: "simi"
};

Object.entries(aiTools).forEach(([cmd, model]) => {
    extraCommands[cmd] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: `❌ Please provide a prompt for ${cmd}!` }, { quoted: msg });
        await sock.sendMessage(from, { text: `🔍 ${cmd.toUpperCase()} is processing...` }, { quoted: msg });
        try {
            const res = await axios.get(`https://api.siputzx.my.id/api/ai/chatgpt?prompt=You are ${model}&text=${encodeURIComponent(q)}`);
            await sock.sendMessage(from, { text: `*[${cmd.toUpperCase()}]*\n\n${res.data.data}` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: `❌ ${cmd} error: ${e.message}` }, { quoted: msg });
        }
    };
});

// --- ANIME & REACTIONS ---
const animeReactions = [
    'waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 
    'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 
    'highfive', 'handhold', 'nom', 'bite', 'slap', 'kill', 'happy', 'wink', 
    'poke', 'dance', 'cringe', 'fox_girl', 'maid', 'uniform', 'oppai', 'hentai', 'trap'
];

animeReactions.forEach(react => {
    extraCommands[react] = async (sock, from, msg) => {
        try {
            const res = await axios.get(`https://api.waifu.pics/sfw/${react}`);
            await sock.sendMessage(from, { image: { url: res.data.url }, caption: `✨ *${react.toUpperCase()}*` }, { quoted: msg });
        } catch (e) {
            try {
                const res = await axios.get(`https://api.waifu.pics/nsfw/${react}`);
                await sock.sendMessage(from, { image: { url: res.data.url }, caption: `🔥 *${react.toUpperCase()} (NSFW)*` }, { quoted: msg });
            } catch (err) {
                await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
            }
        }
    };
});

// --- SEARCH TOOLS ---
const searchCommands = {
    google: 'google', bing: 'bing', yahoo: 'yahoo', duckduckgo: 'duckduckgo',
    wiki: 'wikipedia', github: 'github', npm: 'npm', pypi: 'pypi', 
    docker: 'docker', stackoverflow: 'stackoverflow', quora: 'quora', 
    reddit: 'reddit', pinterest: 'pinterest', imdb: 'imdb', playstore: 'playstore'
};

Object.entries(searchCommands).forEach(([cmd, site]) => {
    extraCommands[cmd] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: `❌ What do you want to search on ${cmd}?` }, { quoted: msg });
        const url = `https://www.google.com/search?q=site:${site}.com+${encodeURIComponent(q)}`;
        await sock.sendMessage(from, { text: `🔍 *${cmd.toUpperCase()} SEARCH*\n\nResults for: ${q}\nLink: ${url}` }, { quoted: msg });
    };
});

extraCommands.lyrics = async (sock, from, msg, q) => {
    if (!q) return sock.sendMessage(from, { text: "❌ Provide song name!" }, { quoted: msg });
    try {
        const res = await axios.get(`https://api.siputzx.my.id/api/tools/lyrics?s=${encodeURIComponent(q)}`);
        await sock.sendMessage(from, { text: `🎵 *LYRICS: ${q.toUpperCase()}*\n\n${res.data.data.lyrics}` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(from, { text: "❌ Lyrics not found!" }, { quoted: msg }); }
};

extraCommands.weather = async (sock, from, msg, q) => {
    if (!q) return sock.sendMessage(from, { text: "❌ Provide city name!" }, { quoted: msg });
    try {
        const res = await axios.get(`https://api.siputzx.my.id/api/tools/weather?city=${encodeURIComponent(q)}`);
        const w = res.data.data;
        await sock.sendMessage(from, { text: `🌡️ *WEATHER: ${q.toUpperCase()}*\n\nTemp: ${w.temp}°C\nCondition: ${w.condition}\nHumidity: ${w.humidity}%` }, { quoted: msg });
    } catch (e) { await sock.sendMessage(from, { text: "❌ Weather data unavailable!" }, { quoted: msg }); }
};

// --- FUN & INTERACTIVE ---
const funTools = {
    advice: "https://api.adviceslip.com/advice",
    fact: "https://uselessfacts.jsph.pl/random.json?language=en",
    joke: "https://official-joke-api.appspot.com/random_joke",
    insult: "https://evilinsult.com/generate_insult.php?lang=en&type=json"
};

Object.entries(funTools).forEach(([cmd, url]) => {
    extraCommands[cmd] = async (sock, from, msg) => {
        try {
            const res = await axios.get(url);
            let text = "";
            if (cmd === 'advice') text = res.data.slip.advice;
            else if (cmd === 'fact') text = res.data.text;
            else if (cmd === 'joke') text = `${res.data.setup}\n\n${res.data.punchline}`;
            else if (cmd === 'insult') text = res.data.insult;
            await sock.sendMessage(from, { text: `🎉 *${cmd.toUpperCase()}*\n\n${text}` }, { quoted: msg });
        } catch (e) { await sock.sendMessage(from, { text: `❌ ${cmd} failed!` }, { quoted: msg }); }
    };
});

const ratings = ['gay', 'lesbian', 'stupid', 'handsome', 'beautiful', 'rich', 'poor', 'honest', 'fake'];
ratings.forEach(rate => {
    extraCommands[rate] = async (sock, from, msg) => {
        const percent = Math.floor(Math.random() * 101);
        await sock.sendMessage(from, { text: `📈 *${rate.toUpperCase()} CHECK*\n\nYou are *${percent}%* ${rate}!` }, { quoted: msg });
    };
});

// --- LOGO & TEXT EFFECTS (TEXTPRO) ---
const logoEffects = [
    'neon', 'glitch', 'gold', 'fire', 'water', 'shadow', 'cloud', 'smoke', 'blood', 
    'horror', 'scary', 'christmas', 'birthday', 'love', 'heart', 'marvel', 
    'avengers', 'transformer', 'blackpink', 'gradient', 'luxury', 'royal', 
    'metal', 'steel', 'chrome', 'glossy', 'magma', 'sand', 'magical', 'toxic', 
    'circuit', 'matrix', 'thunder', 'ice', 'snow', 'leaf', 'wood', 'stone', 
    'fabric', 'denim', 'leather', 'carbon', 'fiber', 'paper', 'cardboard', 
    'old', 'retro', 'vintage', 'sky', 'ocean',
    'black', 'white', 'purple', 'green', 'blue', 'red', 'yellow', 'orange', 'pink', 'brown',
    'diamond', 'pearl', 'crystal', 'glass', 'mirror', 'liquid', 'fire2', 'water2', 'neon4', 'neon5',
    'comic', 'cartoon', 'anime', 'manga', 'sketch', 'pencil', 'oil', 'watercolor', 'ink', 'graffiti',
    'cyber', 'punk', 'steam', 'space', 'galaxy2', 'nebula', 'star', 'moon', 'sun', 'planet',
    'lion', 'tiger', 'wolf', 'eagle', 'dragon', 'snake', 'spider', 'scorpion', 'shark', 'whale'
];

logoEffects.forEach(effect => {
    extraCommands[effect] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: `❌ Provide text for ${effect} effect!` }, { quoted: msg });
        await sock.sendMessage(from, { text: `🎨 Generating ${effect} logo...` }, { quoted: msg });
        try {
            const url = `https://api.siputzx.my.id/api/maker/textpro?url=https://textpro.me/search?q=${effect}&text=${encodeURIComponent(q)}`;
            await sock.sendMessage(from, { image: { url: url }, caption: `✅ *${effect.toUpperCase()} LOGO*` }, { quoted: msg });
        } catch (e) { await sock.sendMessage(from, { text: `❌ ${effect} failed!` }, { quoted: msg }); }
    };
});

// --- NEWS CATEGORIES ---
const newsTypes = ['tech', 'sports', 'finance', 'world', 'health', 'science', 'business', 'crypto', 'gaming', 'politics'];
newsTypes.forEach(type => {
    extraCommands[`news_${type}`] = async (sock, from, msg) => {
        try {
            const res = await axios.get(`https://api.siputzx.my.id/api/news/cnn?type=${type}`);
            const art = res.data.data[0];
            await sock.sendMessage(from, { text: `📰 *${type.toUpperCase()} NEWS*\n\n*${art.title}*\n\n${art.description}\n\nLink: ${art.url}` }, { quoted: msg });
        } catch (e) { await sock.sendMessage(from, { text: `❌ ${type} news unavailable!` }, { quoted: msg }); }
    };
});

// --- BUG & CRASH (UNIQUE NAMES) ---
const bugTypes = {
    'system-lag': '󾔒'.repeat(1000),
    'ui-freeze': '󾓴'.repeat(1000),
    'wa-crash': 'ꦾ'.repeat(2000),
    'data-drain': '҈'.repeat(2000),
    'memory-bug': '░'.repeat(3000),
    'infinity-bug': '🔥'.repeat(5000),
    'ghost-crash': '👻'.repeat(1000),
    'nuke-bug': '☢️'.repeat(1000),
    'dark-payload': '💀'.repeat(1000),
    'void-crash': '🕳️'.repeat(1000)
};

Object.entries(bugTypes).forEach(([cmd, payload]) => {
    extraCommands[cmd] = async (sock, from, msg, q, isOwner) => {
        if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only!" }, { quoted: msg });
        let target = q ? q.split(' ')[0] : null;
        if (!target) return sock.sendMessage(from, { text: "❌ Target required!" }, { quoted: msg });
        if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';
        await sock.sendMessage(from, { text: `🔥 Sending ${cmd} to ${target.split('@')[0]}...` }, { quoted: msg });
        for(let i=0; i<5; i++) await sock.sendMessage(target, { text: payload });
    };
});

// --- DYNAMIC EXTRA FUN ---
const games = ['tictactoe', 'hangman', 'chess', '8ball', 'truth', 'dare', 'wyr', 'riddle', 'trivia', 'coinflip', 'roll', 'blackjack', 'poker', 'slots', 'roulette', 'mines', 'snake-game', 'tetris', 'sudoku', '2048', 'flappy-bird'];
games.forEach(game => {
    extraCommands[game] = async (sock, from, msg) => {
        await sock.sendMessage(from, { text: `🎮 *${game.toUpperCase()}*\n\nThis feature is under development! Stay tuned.` }, { quoted: msg });
    };
});

// --- MORE FUN & RATINGS ---
const moreRatings = ['cool', 'hot', 'smart', 'dumb', 'kind', 'evil', 'loyal', 'brave', 'scared', 'funny', 'boring', 'weird', 'normal'];
moreRatings.forEach(rate => {
    extraCommands[rate] = async (sock, from, msg) => {
        const percent = Math.floor(Math.random() * 101);
        await sock.sendMessage(from, { text: `📈 *${rate.toUpperCase()} CHECK*\n\nYou are *${percent}%* ${rate}!` }, { quoted: msg });
    };
});

// --- MORE TOOLS ---
const moreTools = ['ebinary', 'dbinary', 'ehex', 'dhex', 'eoctal', 'doctal', 'url-encode', 'url-decode', 'json-format', 'xml-format'];
moreTools.forEach(tool => {
    extraCommands[tool] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: `❌ Provide text for ${tool}!` }, { quoted: msg });
        await sock.sendMessage(from, { text: `🛠️ *${tool.toUpperCase()}*\n\nResult: [Converted Content]` }, { quoted: msg });
    };
});

module.exports = extraCommands;
