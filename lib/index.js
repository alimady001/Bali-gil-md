const fs = require('fs-extra');
const path = require('path');

const WELCOME_FILE = path.join(__dirname, '../data/welcome_settings.json');
const GOODBYE_FILE = path.join(__dirname, '../data/goodbye_settings.json');
const ANTILINK_FILE = path.join(__dirname, '../data/antilink_settings.json');
const WARNINGS_FILE = path.join(__dirname, '../data/warnings.json');

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
    try { fs.writeJsonSync(WELCOME_FILE, data, { spaces: 2 }); } catch (e) { /* ignore write errors */ }
}

async function delWelcome(chatId) {
    if (!fs.existsSync(WELCOME_FILE)) return;
    const data = safeReadJson(WELCOME_FILE);
    delete data[chatId];
    try { fs.writeJsonSync(WELCOME_FILE, data, { spaces: 2 }); } catch (e) { /* ignore write errors */ }
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
    try { fs.writeJsonSync(GOODBYE_FILE, data, { spaces: 2 }); } catch (e) { /* ignore write errors */ }
}

async function delGoodbye(chatId) {
    if (!fs.existsSync(GOODBYE_FILE)) return;
    const data = safeReadJson(GOODBYE_FILE);
    delete data[chatId];
    try { fs.writeJsonSync(GOODBYE_FILE, data, { spaces: 2 }); } catch (e) { /* ignore write errors */ }
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

// Minimal ownership helper
// normalizeNumber: strip JID @domain part and remove non-digits
function normalizeNumber(value) {
    if (!value) return '';
    const beforeAt = String(value).split('@')[0];
    return beforeAt.replace(/\D+/g, '');
}

// isOwner: simple check that compares the normalized BOT_OWNER env var to the sender
// Returns true if BOT_OWNER is set and matches the sender (after normalization)
async function isOwner(sender) {
    try {
        if (!sender) return false;
        const botOwner = process.env.BOT_OWNER;
        if (!botOwner) return false;
        const senderNorm = normalizeNumber(sender);
        const ownerNorm = normalizeNumber(botOwner);
        if (!senderNorm || !ownerNorm) return false;
        return senderNorm === ownerNorm;
    } catch (e) {
        return false;
    }
}

// Warning count helpers
async function incrementWarningCount(id) {
    if (!id) return 0;
    ensureDataDir();
    const data = safeReadJson(WARNINGS_FILE);
    const key = String(id);
    const current = Number(data[key] || 0) + 1;
    data[key] = current;
    try { fs.writeJsonSync(WARNINGS_FILE, data, { spaces: 2 }); } catch (e) { /* ignore write errors */ }
    return current;
}

async function resetWarningCount(id) {
    if (!id) return;
    ensureDataDir();
    const data = safeReadJson(WARNINGS_FILE);
    const key = String(id);
    if (key in data) delete data[key];
    try { fs.writeJsonSync(WARNINGS_FILE, data, { spaces: 2 }); } catch (e) { /* ignore write errors */ }
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
    isOwner,
    incrementWarningCount,
    resetWarningCount,
};
