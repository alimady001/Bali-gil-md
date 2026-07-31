const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function vvCommand(sock, from, msg) {
    try {
        // Check if it's a quoted message
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            await sock.sendMessage(from, { 
                text: "❌ Please reply to a View-Once message." 
            }, { quoted: msg });
            return;
        }

        // Extract the actual message content
        let messageContent = quoted;
        
        // Handle different View-Once message structures
        if (quoted.viewOnceMessageV2) {
            messageContent = quoted.viewOnceMessageV2.message;
        } else if (quoted.viewOnceMessage) {
            messageContent = quoted.viewOnceMessage.message;
        } else if (quoted.viewOnceMessageV2Extension) {
            messageContent = quoted.viewOnceMessageV2Extension.message;
        }

        // Get the message type
        const messageKeys = Object.keys(messageContent);
        const messageType = messageKeys.find(key => 
            ['imageMessage', 'videoMessage', 'audioMessage'].includes(key)
        );

        if (!messageType) {
            await sock.sendMessage(from, { 
                text: "❌ Not a View-Once media message." 
            }, { quoted: msg });
            return;
        }

        // Send loading reactions
        const loadEmojis = ['⏳', '🔓', '👁️'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { 
                react: { text: emoji, key: msg.key } 
            });
        }

        // Download the media
        const mediaMessage = messageContent[messageType];
        const mediaType = messageType.replace('Message', '');
        
        try {
            const stream = await downloadContentFromMessage(mediaMessage, mediaType);
            let buffer = Buffer.from([]);
            
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Send based on media type
            const caption = "✅ View-Once Media Downloaded Successfully!";
            
            if (messageType === 'imageMessage') {
                await sock.sendMessage(from, { 
                    image: buffer, 
                    caption: caption 
                }, { quoted: msg });
            } 
            else if (messageType === 'videoMessage') {
                await sock.sendMessage(from, { 
                    video: buffer, 
                    caption: caption 
                }, { quoted: msg });
            } 
            else if (messageType === 'audioMessage') {
                await sock.sendMessage(from, { 
                    audio: buffer, 
                    mimetype: 'audio/mp4' 
                }, { quoted: msg });
            }

        } catch (downloadError) {
            console.error('Download error:', downloadError);
            await sock.sendMessage(from, { 
                text: "❌ Failed to download View-Once media. Please try again." 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error('VV Command Error:', error);
        await sock.sendMessage(from, { 
            text: "❌ An error occurred while processing your request." 
        }, { quoted: msg });
    }
}

module.exports = vvCommand;
