const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// Command configuration
async function stickerCommand(sock, from, msg, isAdmin, q) {
        try {
            // Check current or quoted message for media
            const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const messageContent = quotedMessage || msg.message;
            const mediaKey = ['imageMessage', 'videoMessage'].find((key) => messageContent?.[key]);

            if (!mediaKey) {
                return await sock.sendMessage(from, { 
                    text: '⚠️ Please reply to an image or video!' 
                }, { quoted: msg });
            }

            // Send processing message
            await sock.sendMessage(from, { 
                text: '✨ Converting to sticker...' 
            }, { quoted: msg });

            // Determine media type
            const type = mediaKey === 'imageMessage' ? 'image' : 'video';
            const mediaMessage = messageContent[mediaKey];

            if (type === 'video') {
                throw new Error('Video stickers are not supported yet');
            }
            
            // Download media
            const stream = await downloadContentFromMessage(mediaMessage, type);
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Create temp file
            const tmpFile = path.join(__dirname, '..', 'data', `sticker_${Date.now()}.webp`);

            // Process image or video
            if (type === 'image') {
                await sharp(buffer)
                    .resize(512, 512, { 
                        fit: 'contain', 
                        background: { r: 0, g: 0, b: 0, alpha: 0 } 
                    })
                    .webp({ 
                        quality: 80,
                        effort: 6 
                    })
                    .toFile(tmpFile);
            }

            // Read and send sticker
            const stickerBuffer = await fs.readFile(tmpFile);
            await sock.sendMessage(from, { 
                sticker: stickerBuffer 
            }, { quoted: msg });

            // Cleanup
            await fs.remove(tmpFile);

        } catch (error) {
            console.error('Sticker Error:', error);
            await sock.sendMessage(from, { 
                text: `❌ Error: ${error.message}` 
            }, { quoted: msg });
        }
}

module.exports = stickerCommand;