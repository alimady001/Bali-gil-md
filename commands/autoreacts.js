// autoreact.js - Auto React Command for MD Bot

// In your main bot file or command handler, add these imports/variables
const autoReactSessions = new Map(); // Store per-group auto-react settings

async function autoreactsCommand(sock, from, msg, isAdmin, session, args) {
    // Check if user is admin/owner
    if (!isAdmin) {
        return await sock.sendMessage(from, { 
            text: "❌ Only group admins can use this command." 
        }, { quoted: msg });
    }

    // Initialize session if not exists
    if (!session.autoReact) {
        session.autoReact = {
            enabled: false,
            emojis: ['✅','❤️','👏','🔥','🎉'💕'💯'😡']
            reactions: {}
        };
    }

    const action = args[0]?.toLowerCase();
    const reactionEmoji = args[1] || '❤️'; // Default emoji if not specified

    if (action === 'on') {
        session.autoReact.enabled = true;
        session.autoReact.defaultEmoji = reactionEmoji;
        await sock.sendMessage(from, { 
            text: `✅ Auto-React Enabled!\nDefault reaction: ${reactionEmoji}` 
        }, { quoted: msg });
    } 
    else if (action === 'off') {
        session.autoReact.enabled = false;
        await sock.sendMessage(from, { 
            text: "❌ Auto-React Disabled!" 
        }, { quoted: msg });
    } 
    else if (action === 'set') {
        // Set specific emoji for a word/keyword
        const keyword = args[1]?.toLowerCase();
        const emoji = args[2] || '❤️';
        if (!keyword) {
            return await sock.sendMessage(from, { 
                text: "❌ Usage: .autoreact set [keyword] [emoji]" 
            }, { quoted: msg });
        }
        session.autoReact.reactions[keyword] = emoji;
        await sock.sendMessage(from, { 
            text: `✅ Reaction set: "${keyword}" → ${emoji}` 
        }, { quoted: msg });
    }
    else if (action === 'list') {
        const reactions = session.autoReact.reactions;
        if (Object.keys(reactions).length === 0) {
            return await sock.sendMessage(from, { 
                text: "📝 No custom reactions set." 
            }, { quoted: msg });
        }
        let list = "📝 *Custom Reactions:*\n";
        for (const [word, emoji] of Object.entries(reactions)) {
            list += `• "${word}" → ${emoji}\n`;
        }
        await sock.sendMessage(from, { text: list }, { quoted: msg });
    }
    else if (action === 'remove') {
        const keyword = args[1]?.toLowerCase();
        if (!keyword) {
            return await sock.sendMessage(from, { 
                text: "❌ Usage: .autoreact remove [keyword]" 
            }, { quoted: msg });
        }
        if (session.autoReact.reactions[keyword]) {
            delete session.autoReact.reactions[keyword];
            await sock.sendMessage(from, { 
                text: `✅ Removed reaction for: "${keyword}"` 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { 
                text: `❌ No reaction found for: "${keyword}"` 
            }, { quoted: msg });
        }
    }
    else if (action === 'status') {
        const status = session.autoReact.enabled ? '✅ Enabled' : '❌ Disabled';
        const emoji = session.autoReact.defaultEmoji || '❤️';
        const count = Object.keys(session.autoReact.reactions || {}).length;
        await sock.sendMessage(from, { 
            text: `📊 *Auto-React Status*\nStatus: ${status}\nDefault Emoji: ${emoji}\nCustom Reactions: ${count}` 
        }, { quoted: msg });
    }
    else {
        await sock.sendMessage(from, { 
            text: `❌ *Usage:* .autoreact [on/off/set/list/remove/status]\n\n` +
                  `• *on* [emoji] - Enable auto-react (with optional default emoji)\n` +
                  `• *off* - Disable auto-react\n` +
                  `• *set* [keyword] [emoji] - Set custom reaction for keyword\n` +
                  `• *list* - Show all custom reactions\n` +
                  `• *remove* [keyword] - Remove custom reaction\n` +
                  `• *status* - Show current settings\n\n` +
                  `📌 *Example:* .autoreact on 🔥` 
        }, { quoted: msg });
    }
}

// Add this to your message handler to process auto-reactions
async function handleAutoReact(sock, from, msg, session) {
    if (!session || !session.autoReact) return;
    
    // Support both boolean toggle and detailed object config
    const isEnabled = typeof session.autoReact === 'object' ? session.autoReact.enabled : session.autoReact;
    if (!isEnabled) return;
    
    const messageText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.message?.imageMessage?.caption || 
                       '';
    
    if (!messageText) return;

    let reaction = session.autoReact.defaultEmoji || '❤️';
    
    // Check for custom reactions
    const reactions = session.autoReact.reactions || {};
    for (const [keyword, emoji] of Object.entries(reactions)) {
        if (messageText.toLowerCase().includes(keyword)) {
            reaction = emoji;
            break;
        }
    }

    // Send reaction
    try {
        await sock.sendMessage(from, { 
            react: { text: reaction, key: msg.key } 
        });
    } catch (error) {
        console.error('Error sending auto-react:', error);
    }
}

autoreactsCommand.handleAutoReact = handleAutoReact;
module.exports = autoreactsCommand;
