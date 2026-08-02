const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const WELCOME_FILE = path.join(DATA_DIR, 'welcome_settings.json');
const GOODBYE_FILE = path.join(DATA_DIR, 'goodbye_settings.json');
const ANTILINK_FILE = path.join(DATA_DIR, 'antilink_settings.json');

// Helper to ensure data directory exists
const ensureDataDir = () => {
    fs.ensureDirSync(DATA_DIR);
};

// Robust JSON read/write helpers
function readJsonSafe(file) {
    if (!fs.existsSync(file)) return {};
    try {
        return fs.readJsonSync(file);
    } catch (e) {
        // If file is invalid/corrupted, return empty object to avoid crashing
        return {};
    }
}

function writeJsonSafe(file, data) {
    ensureDataDir();
    fs.writeJsonSync(file, data, { spaces: 2 });
}

// Welcome Functions
async function addWelcome(chatId, status, message) {
    const data = readJsonSafe(WELCOME_FILE);
    data[chatId] = { status, message };
    writeJsonSafe(WELCOME_FILE, data);
}

async function delWelcome(chatId) {
    const data = readJsonSafe(WELCOME_FILE);
    if (data[chatId]) {
        delete data[chatId];
        writeJsonSafe(WELCOME_FILE, data);
    }
}

async function isWelcomeOn(chatId) {
    const data = readJsonSafe(WELCOME_FILE);
    return !!(data[chatId] && data[chatId].status);
}

async function getWelcomeMessage(chatId) {
    const data = readJsonSafe(WELCOME_FILE);
    return data[chatId] ? data[chatId].message : null;
}

// Goodbye Functions
async function addGoodbye(chatId, status, message) {
    const data = readJsonSafe(GOODBYE_FILE);
    data[chatId] = { status, message };
    writeJsonSafe(GOODBYE_FILE, data);
}

// Note: standardized function name to `delGoodbye` (lowercase 'b')
async function delGoodbye(chatId) {
    const data = readJsonSafe(GOODBYE_FILE);
    if (data[chatId]) {
        delete data[chatId];
        writeJsonSafe(GOODBYE_FILE, data);
    }
}

// Standardized function name `isGoodbyeOn`
async function isGoodbyeOn(chatId) {
    const data = readJsonSafe(GOODBYE_FILE);
    return !!(data[chatId] && data[chatId].status);
}

async function getGoodbyeMessage(chatId) {
    const data = readJsonSafe(GOODBYE_FILE);
    return data[chatId] ? data[chatId].message : null;
}

// Antilink Functions
async function getAntilink(chatId) {
    const data = readJsonSafe(ANTILINK_FILE);
    return data[chatId] || null;
}

// Sudo check
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
