/**
 * COMMAND WRAPPER - Handles error handling, logging, and parameter normalization
 * This wrapper ensures all commands work consistently regardless of input parameters
 */

const fs = require('fs-extra');
const path = require('path');

// Error logging file
const ERROR_LOG = path.join(__dirname, '../data/command_errors.log');

// Ensure data directory exists
fs.ensureDirSync(path.dirname(ERROR_LOG));

/**
 * Log errors to file and console
 */
function logError(commandName, error, context = {}) {
    const timestamp = new Date().toISOString();
    const errorEntry = {
        timestamp,
        command: commandName,
        error: error.message || String(error),
        stack: error.stack,
        context
    };
    
    const logMessage = `[${timestamp}] ${commandName}: ${error.message}\n`;
    fs.appendFileSync(ERROR_LOG, logMessage, { encoding: 'utf8' });
    console.error(`[COMMAND ERROR] ${commandName}:`, error.message);
    
    return errorEntry;
}

/**
 * Wrap a command with error handling and parameter normalization
 */
function wrapCommand(commandFunc, commandName) {
    return async (sock, from, msg, isAdmin, ...args) => {
        try {
            // Validate socket
            if (!sock || typeof sock.sendMessage !== 'function') {
                throw new Error('Invalid socket object');
            }
            
            // Validate message object
            if (!msg || !msg.key) {
                throw new Error('Invalid message object');
            }
            
            // Extract parameters based on command needs
            const params = {
                sock,
                from,
                msg,
                isAdmin,
                chatId: from, // Alias for compatibility
                query: (args[0] || '').toString().trim(),
                q: (args[0] || '').toString().trim(),
                args: args,
                session: args[1], // Some commands need session
                botData: args[2], // For commands that need data persistence
                saveBotData: args[3] // For saving bot data
            };
            
            // Call the original command with normalized parameters
            const result = await commandFunc(
                params.sock,
                params.from,
                params.msg,
                params.isAdmin,
                params.q || params.query,
                params.session,
                params.args
            );
            
            return result;
            
        } catch (error) {
            // Log the error
            logError(commandName, error, { from, isAdmin });
            
            // Send error message to user
            try {
                await sock.sendMessage(from, {
                    text: `❌ *Command Error*\n\nCommand: \`.${commandName}\`\nError: ${error.message || 'Unknown error'}\n\n_This has been logged. Please try again._`,
                }, { quoted: msg });
            } catch (sendError) {
                console.error(`Failed to send error message for ${commandName}:`, sendError.message);
            }
        }
    };
}

/**
 * Safe API caller with retry logic and timeout handling
 */
async function safeApiCall(apiFunc, options = {}) {
    const {
        maxRetries = 3,
        timeout = 30000,
        backoffMs = 1000,
        name = 'API'
    } = options;
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await Promise.race([
                apiFunc(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`${name} timeout after ${timeout}ms`)), timeout)
                )
            ]);
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                const delayMs = backoffMs * Math.pow(2, attempt - 1);
                console.log(`${name} attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }
    
    throw lastError;
}

/**
 * Validate required parameters
 */
function validateParams(params, required = []) {
    const missing = required.filter(param => !params[param]);
    if (missing.length > 0) {
        throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
}

/**
 * Safe message sender
 */
async function safeMessage(sock, chatId, messageContent, quoted = null) {
    try {
        const options = quoted ? { quoted } : {};
        return await sock.sendMessage(chatId, messageContent, options);
    } catch (error) {
        console.error('Failed to send message:', error.message);
        throw error;
    }
}

/**
 * Permission checker
 */
function checkPermission(isAdmin, isOwner, requireAdmin = true, requireOwner = false) {
    if (requireOwner && !isOwner) {
        throw new Error('❌ Only owner can use this command');
    }
    if (requireAdmin && !isAdmin) {
        throw new Error('❌ Only admin can use this command');
    }
}

/**
 * Group only checker
 */
function checkGroupOnly(chatId) {
    if (!chatId.endsWith('@g.us')) {
        throw new Error('❌ This command can only be used in groups');
    }
}

/**
 * Private chat only checker
 */
function checkPrivateOnly(chatId) {
    if (chatId.endsWith('@g.us')) {
        throw new Error('❌ This command can only be used in private chats');
    }
}

/**
 * Get error log
 */
function getErrorLog(lines = 50) {
    if (!fs.existsSync(ERROR_LOG)) {
        return 'No errors logged yet';
    }
    
    const content = fs.readFileSync(ERROR_LOG, 'utf8');
    const logLines = content.split('\n').reverse().slice(0, lines).reverse();
    
    return logLines.join('\n');
}

/**
 * Clear error log
 */
function clearErrorLog() {
    fs.writeFileSync(ERROR_LOG, '', 'utf8');
    return 'Error log cleared';
}

module.exports = {
    wrapCommand,
    safeApiCall,
    validateParams,
    safeMessage,
    checkPermission,
    checkGroupOnly,
    checkPrivateOnly,
    logError,
    getErrorLog,
    clearErrorLog
};
