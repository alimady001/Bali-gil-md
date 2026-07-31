const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// Command configuration
module.exports = {
    name: 'sticker', // Command name
    aliases: ['s', 'sticker', 'st'], // Alternative command names
    description: 'Convert image/video to sticker',
    category: 'media',
    usage: '.sticker (reply to image/video)',

    execute: async function(sock, chatId, msg, args) {
        try {
            // Check for quoted message with media
            const quoted = msg.message?.imageMessage || 
                          msg.message?.videoMessage ||
                          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
            
            if (!quoted) {
                return await sock.sendMessage(chatId, { 
                    text: '⚠️ Please reply to an image or video!' 
                }, { quoted: msg });
            }

            // Send processing message
            await sock.sendMessage(chatId, { 
                text: '✨ Converting to sticker...' 
            }, { quoted: msg });

            // Determine media type
            const type = quoted.imageMessage ? 'image' : 'video';
            
            // Download media
            const stream = await downloadContentFromMessage(
                quoted[type + 'Message'] || quoted, 
                type
            );
            
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
            } else {
                // Video processing (if you want to support video stickers)
                // You'll need additional libraries like ffmpeg for video
                throw new Error('Video stickers are not supported yet');
            }

            // Read and send sticker
            const stickerBuffer = await fs.readFile(tmpFile);
            await sock.sendMessage(chatId, { 
                sticker: stickerBuffer 
            }, { quoted: msg });

            // Cleanup
            await fs.remove(tmpFile);

        } catch (error) {
            console.error('Sticker Error:', error);
            await sock.sendMessage(chatId, { 
                text: `❌ Error: ${error.message}` 
            }, { quoted: msg });
        }
    }
};
