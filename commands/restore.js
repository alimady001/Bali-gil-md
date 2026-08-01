const fs = require('fs-extra');
const path = require('path');

module.exports = async function(sock, chatId, msg, isOwner) {
    if (!isOwner) return await sock.sendMessage(chatId, { text: '\u274C Owner only!' }, { quoted: msg });
    
    try {
        const backupDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupDir)) {
            return await sock.sendMessage(chatId, { text: '❌ No backups found!' }, { quoted: msg });
        }
        
        const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();
        if (!files.length) {
            return await sock.sendMessage(chatId, { text: '❌ No backup files found!' }, { quoted: msg });
        }
        
        const latestBackup = files[0];
        const backupData = await fs.readJson(path.join(backupDir, latestBackup));
        
        // In a real scenario, you'd merge this with the current botData
        // For now, we'll just acknowledge the backup was found and read
        await sock.sendMessage(chatId, { 
            text: `✅ Found latest backup: *${latestBackup}*\n` +
                  `📅 Created: ${backupData.timestamp}\n` +
                  `🤖 Sessions: ${backupData.sessions?.length || 0}\n\n` +
                  `_Note: Automatic data restoration is partially implemented._`
        }, { quoted: msg });
        
    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Restore Error: ' + e.message }, { quoted: msg });
    }
};
