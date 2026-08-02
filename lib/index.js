const fs = require('fs-extra');
const path = require('path');

const WELCOME_FILE = path.join(__dirname, '../data/welcome_settings.json');
const GOODBYE_FILE = path.join(__dirname, '../data/goodbye_settings.json');
const ANTILINK_FILE = path.join(__dirname, '../data/antilink_settings.json');

// Helper to ensure data directory exists
const ensureDataDir = () => {
    fs.ensureDirSync(path.join(__dirname, '../data'));
};

// Safe JSON read that tolerates missing files and invalid JSON
function safeReadJson(filePath) {
    try {
        if (!fs.existsSync(filePath)) return {};
        const data = fs.readJsonSync(filePath);
        if (typeof data !== 'object' || data === null) return {};
        return data;
    } catch (e) {
        // If the file is corrupt or unreadable, don't crash — return empty object
        return {};
    }
}

// Welcome Functions
async function addWelcome(chatId, status, message) {
    ensureDataDir();
    const data = safeReadJson(WELCOME_FILE);
    data[chatId] = { status, message };
    fs.writeJsonSync(WELCOME_FILE, data, { spaces: 2 });
}

async function delWelcome(chatId) {
    if (!fs.existsSync(WELCOME_FILE)) return;
    const data = safeReadJson(WELCOME_FILE);
    delete data[chatId];
    fs.writeJsonSync(WELCOME_FILE, data, { spaces: 2 });
}

async function isWelcomeOn(chatId) {
    if (!fs.existsSync(WELCOME_FILE)) return false;
    const data = safeReadJson(WELCOME_FILE);
    return data[chatId] ? data[chatId].status : false;
}

async function getWelcomeMessage(chatId) {
    if (!fs.existsSync(WELCOME_FILE)) return null;
    const data = safeReadJson(WELCOME_FILE);
    return data[chatId] ? data[chatId].message : null;
}

// Goodbye Functions (consistent naming)
async function addGoodbye(chatId, status, message) {
    ensureDataDir();
    const data = safeReadJson(GOODBYE_FILE);
    data[chatId] = { status, message };
    fs.writeJsonSync(GOODBYE_FILE, data, { spaces: 2 });
}

async function delGoodbye(chatId) {
    if (!fs.existsSync(GOODBYE_FILE)) return;
    const data = safeReadJson(GOODBYE_FILE);
    delete data[chatId];
    fs.writeJsonSync(GOODBYE_FILE, data, { spaces: 2 });
}

async function isGoodbyeOn(chatId) {
    if (!fs.existsSync(GOODBYE_FILE)) return false;
    const data = safeReadJson(GOODBYE_FILE);
    return data[chatId] ? data[chatId].status : false;
}

async function getGoodbyeMessage(chatId) {
    if (!fs.existsSync(GOODBYE_FILE)) return null;
    const data = safeReadJson(GOODBYE_FILE);
    return data[chatId] ? data[chatId].message : null;
}

// Antilink Functions
async function getAntilink(chatId) {
    const data = safeReadJson(ANTILINK_FILE);
    return data[chatId] || null;
}

// Sudo check - FIXED VERSION with proper validation
async function isSudo(sender) {
    // Allow configuring sudo numbers via the SUDO env var (comma-separated)
    const configured = (process.env.SUDO || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    if (configured.length === 0) return false;
    return configured.includes(sender);
}

module.exports = {
    addWelcome,
    delWelcome,
    isWelcomeOn,
    getWelcomeMessage,
    addGoodbye,
    delGoodbye,
    isGoodbyeOn,
    getGoodbyeMessage,
    getAntilink,
    isSudo,
    incrementWarningCount: async () => 1, // Placeholders to prevent crashes
    resetWarningCount: async () => {},
};
