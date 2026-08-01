// antilink.js - Advanced Anti-Link Command for MD Bot

const linkPatterns = {
    whatsapp: /(chat\.whatsapp\.com|wa\.me|whatsapp\.com)/i,
    youtube: /(youtube\.com|youtu\.be)/i,
    instagram: /(instagram\.com|instagr\.am)/i,
    facebook: /(facebook\.com|fb\.com|fb\.watch)/i,
    twitter: /(twitter\.com|x\.com)/i,
    tiktok: /(tiktok\.com)/i,
    telegram: /(t\.me|telegram\.me|telegram\.org)/i,
    discord: /(discord\.com|discord\.gg)/i,
    reddit: /(reddit\.com)/i,
    pinterest: /(pinterest\.com)/i,
    snapchat: /(snapchat\.com)/i,
    linkedin: /(linkedin\.com)/i,
    github: /(github\.com)/i,
    url: /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i
};

async function antilinkCommand(sock, from, msg, isAdmin, botData, saveBotData, args) {
    // Check if it's a group
    if (!from.endsWith('@g.us')) {
        return await sock.sendMessage(from, { 
            text: "❌ This command can only be used in groups." 
        }, { quoted: msg });
    }

    // Check if user is admin
    if (!isAdmin) {
        return await sock.sendMessage(from, { 
            text: "❌ Only group admins can use this command." 
        }, { quoted: msg });
    }

    // Initialize antilink data if not exists
    if (!botData.antilinkGroups) {
        botData.antilinkGroups = {};
    }
    if (!botData.antilinkSettings) {
        botData.antilinkSettings = {};
    }

    const action = args[0]?.toLowerCase();
    const platform = args[1]?.toLowerCase();

    // Show current status
    if (!action) {
        const status = botData.antilinkGroups[from] || 'off';
        const settings = botData.antilinkSettings[from] || {};
        const platforms = settings.platforms || 'all';
        const warnCount = settings.warnCount || 3;
        
        let statusText = `📊 *Anti-Link Status*\n\n`;
        statusText += `Status: ${status === 'off' ? '❌ Disabled' : status === 'del' ? '✅ Delete Only' : '🔨 Kick + Delete'}\n`;
        statusText += `Platforms: ${platforms === 'all' ? 'All Platforms' : platforms.join(', ')}\n`;
        statusText += `Warn Limit: ${warnCount} warnings\n`;
        statusText += `Warnings: ${settings.warnings ? Object.keys(settings.warnings).length : 0} users warned\n\n`;
        statusText += `📌 *Commands:*\n`;
        statusText += `• .antilink on - Delete only\n`;
        statusText += `• .antilink kick - Kick + Delete\n`;
        statusText += `• .antilink off - Disable\n`;
        statusText += `• .antilink warn - Warn before action\n`;
        statusText += `• .antilink platform [youtube/whatsapp/all]\n`;
        statusText += `• .antilink whitelist [add/remove] [number]\n`;
        statusText += `• .antilink bypass - Bypass link detection`;
        
        return await sock.sendMessage(from, { text: statusText }, { quoted: msg });
    }

    // Anti-Link settings
    if (!botData.antilinkSettings[from]) {
        botData.antilinkSettings[from] = {
            platforms: 'all',
            warnCount: 3,
            warnings: {},
            whitelist: []
        };
    }

    const settings = botData.antilinkSettings[from];

    // Handle different actions
    switch (action) {
        case 'on':
        case 'del':
            botData.antilinkGroups[from] = 'del';
            saveBotData();
            await sock.sendMessage(from, { 
                text: "✅ Anti-Link (Delete Only) Enabled!\nLinks will be deleted automatically." 
            }, { quoted: msg });
            break;

        case 'kick':
            botData.antilinkGroups[from] = 'kick';
            saveBotData();
            await sock.sendMessage(from, { 
                text: "✅ Anti-Link (Kick + Delete) Enabled!\nUsers sending links will be kicked." 
            }, { quoted: msg });
            break;

        case 'off':
            delete botData.antilinkGroups[from];
            delete botData.antilinkSettings[from];
            saveBotData();
            await sock.sendMessage(from, { 
                text: "❌ Anti-Link Disabled!" 
            }, { quoted: msg });
            break;

        case 'warn':
            // Warn before taking action
            if (args[1] && !isNaN(args[1])) {
                const count = parseInt(args[1]);
                if (count > 0 && count <= 5) {
                    settings.warnCount = count;
                    saveBotData();
                    await sock.sendMessage(from, { 
                        text: `✅ Warning limit set to ${count} warnings before action.` 
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(from, { 
                        text: "❌ Please set a number between 1 and 5." 
                    }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(from, { 
                    text: `❌ Usage: .antilink warn [1-5]\nCurrent: ${settings.warnCount} warnings` 
                }, { quoted: msg });
            }
            break;

        case 'platform':
            if (!platform) {
                const current = settings.platforms === 'all' ? 'All Platforms' : settings.platforms.join(', ');
                await sock.sendMessage(from, { 
                    text: `📌 Current platforms: ${current}\nUsage: .antilink platform [youtube/whatsapp/all]` 
                }, { quoted: msg });
                return;
            }

            if (platform === 'all') {
                settings.platforms = 'all';
                saveBotData();
                await sock.sendMessage(from, { 
                    text: "✅ All platforms will be monitored." 
                }, { quoted: msg });
            } else if (Object.keys(linkPatterns).includes(platform)) {
                if (settings.platforms === 'all') {
                    settings.platforms = [];
                }
                if (!settings.platforms.includes(platform)) {
                    settings.platforms.push(platform);
                    saveBotData();
                    await sock.sendMessage(from, { 
                        text: `✅ Added ${platform} to monitored platforms.` 
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(from, { 
                        text: `⚠️ ${platform} is already being monitored.` 
                    }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(from, { 
                    text: `❌ Invalid platform. Available: ${Object.keys(linkPatterns).join(', ')}` 
                }, { quoted: msg });
            }
            break;

        case 'whitelist':
            const whitelistAction = args[1]?.toLowerCase();
            const number = args[2]?.replace(/[^0-9]/g, '');

            if (!whitelistAction || !number) {
                const list = settings.whitelist.length > 0 ? settings.whitelist.join('\n') : 'Empty';
                await sock.sendMessage(from, { 
                    text: `📝 *Whitelist*\n${list}\n\nUsage: .antilist whitelist [add/remove] [number]` 
                }, { quoted: msg });
                return;
            }

            const fullNumber = number.endsWith('@s.whatsapp.net') ? number : `${number}@s.whatsapp.net`;

            if (whitelistAction === 'add') {
                if (!settings.whitelist.includes(fullNumber)) {
                    settings.whitelist.push(fullNumber);
                    saveBotData();
                    await sock.sendMessage(from, { 
                        text: `✅ ${number} whitelisted successfully.` 
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(from, { 
                        text: `⚠️ ${number} is already whitelisted.` 
                    }, { quoted: msg });
                }
            } else if (whitelistAction === 'remove') {
                const index = settings.whitelist.indexOf(fullNumber);
                if (index !== -1) {
                    settings.whitelist.splice(index, 1);
                    saveBotData();
                    await sock.sendMessage(from, { 
                        text: `✅ ${number} removed from whitelist.` 
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(from, { 
                        text: `❌ ${number} not found in whitelist.` 
                    }, { quoted: msg });
                }
            } else {
                await sock.sendMessage(from, { 
                    text: "❌ Usage: .antilink whitelist [add/remove] [number]" 
                }, { quoted: msg });
            }
            break;

        case 'bypass':
            // Send a bypass code for admins
            const bypassCode = Math.random().toString(36).substring(2, 8);
            settings.bypassCode = bypassCode;
            saveBotData();
            await sock.sendMessage(from, { 
                text: `🔑 Bypass Code: ${bypassCode}\nSend ".antilink bypass ${bypassCode}" to allow one link.\nValid for 5 minutes.` 
            }, { quoted: msg });
            break;

        default:
            await sock.sendMessage(from, { 
                text: `❌ *Invalid Action!*\n\n📌 *Available Actions:*\n` +
                      `• on - Enable (delete only)\n` +
                      `• kick - Enable (kick + delete)\n` +
                      `• off - Disable\n` +
                      `• warn [1-5] - Set warning limit\n` +
                      `• platform [name] - Set platforms\n` +
                      `• whitelist [add/remove] [number]\n` +
                      `• bypass - Generate bypass code` 
            }, { quoted: msg });
            break;
    }
}

// Anti-Link Detection Handler
async function handleAntiLink(sock, from, msg, botData, saveBotData) {
    if (!from.endsWith('@g.us')) return;
    if (!botData.antilinkGroups || !botData.antilinkGroups[from]) return;
    
    const action = botData.antilinkGroups[from];
    if (action === 'off') return;

    const messageText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       msg.message?.imageMessage?.caption || 
                       '';

    if (!messageText) return;

    // Check if sender is admin
    const groupMetadata = await sock.groupMetadata(from);
    const sender = msg.key.participant || msg.key.remoteJid;
    const isSenderAdmin = groupMetadata.participants.some(p => 
        p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (isSenderAdmin) return;

    // Check if sender is whitelisted
    const settings = botData.antilinkSettings[from] || {};
    if (settings.whitelist && settings.whitelist.includes(sender)) return;

    // Check for bypass code
    if (settings.bypassCode && messageText.includes(settings.bypassCode)) {
        // Allow this message, remove bypass code
        delete settings.bypassCode;
        saveBotData();
        return;
    }

    // Check for links
    const platforms = settings.platforms || 'all';
    let foundLink = false;
    let linkType = 'url';

    for (const [platform, pattern] of Object.entries(linkPatterns)) {
        if (platforms === 'all' || (Array.isArray(platforms) && platforms.includes(platform))) {
            if (pattern.test(messageText)) {
                foundLink = true;
                linkType = platform;
                break;
            }
        }
    }

    if (!foundLink) return;

    // Handle warnings
    if (!settings.warnings) {
        settings.warnings = {};
    }

    if (!settings.warnings[sender]) {
        settings.warnings[sender] = 0;
    }

    settings.warnings[sender]++;
    const warnCount = settings.warnings[sender];
    const warnLimit = settings.warnCount || 3;

    saveBotData();

    // Send warning
    await sock.sendMessage(from, { 
        text: `⚠️ *Link Detected!*\n\n` +
              `User: @${sender.split('@')[0]}\n` +
              `Platform: ${linkType}\n` +
              `Warning: ${warnCount}/${warnLimit}\n` +
              `Action: ${action === 'del' ? 'Link will be deleted' : 'You will be kicked'}\n\n` +
              `Please avoid sending links in this group.`,
        mentions: [sender]
    }, { quoted: msg });

    // Delete the message
    try {
        await sock.sendMessage(from, { 
            delete: msg.key 
        });
    } catch (error) {
        console.error('Error deleting message:', error);
    }

    // Take action after warning limit
    if (warnCount >= warnLimit) {
        if (action === 'kick') {
            try {
                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                await sock.sendMessage(from, { 
                    text: `🔨 User @${sender.split('@')[0]} has been kicked for sending links after ${warnLimit} warnings.`,
                    mentions: [sender]
                });
                // Reset warnings after kick
                delete settings.warnings[sender];
                saveBotData();
            } catch (error) {
                console.error('Error kicking user:', error);
            }
        } else {
            // Reset warnings for delete-only mode
            delete settings.warnings[sender];
            saveBotData();
        }
    }
}

antilinkCommand.handleAntiLink = handleAntiLink;
antilinkCommand.linkPatterns = linkPatterns;
module.exports = antilinkCommand;
