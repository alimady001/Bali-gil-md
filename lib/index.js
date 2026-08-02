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

// Truthy env flag helper (accepts 1/true/yes/on)
function envFlag(name) {
    const v = process.env[name];
    if (!v) return false;
    return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
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

// Sudo parsing & caching helpers
let _sudoCache = {
    raw: null,
    list: [],
};

function normalizeNumber(value) {
    if (!value) return '';
    // If value contains an '@' (e.g., WhatsApp JID), take the part before it
    const beforeAt = String(value).split('@')[0];
    // Remove all non-digit characters
    const digits = beforeAt.replace(/\D+/g, '');
    return digits;
}

function parseSudoEnv(raw) {
    const verbose = envFlag('SUDO_VERBOSE') || envFlag('DEBUG_SUDO');
    if (verbose) console.debug('[sudo] parseSudoEnv called with raw:', raw);

    // Treat falsy raw as empty string but still consider BOT_OWNER env
    if (!raw && verbose) console.debug('[sudo] raw is empty — will still check BOT_OWNER');

    const trimmed = String(raw || '').trim();
    let items = [];

    // Try JSON array first
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) items = parsed.map(String);
            if (verbose) console.debug('[sudo] parsed JSON array ->', items);
        } catch (e) {
            if (verbose) console.debug('[sudo] JSON parse failed, falling back to split parsing:', e && e.message);
            // fall back to split parsing below
        }
    }

    if (items.length === 0) {
        // Accept comma, semicolon, newline separated lists
        items = trimmed.split(/[,;\n\r]+/).map(s => s.trim()).filter(Boolean);
        if (verbose) console.debug('[sudo] split items ->', items);
    }

    // Normalize and validate: keep only digit strings of reasonable length
    const normalized = items
        .map(normalizeNumber)
        .filter(n => n && n.length >= 6 && n.length <= 15);

    if (verbose) console.debug('[sudo] normalized items ->', normalized);

    // Include BOT_OWNER env var if present
    if (process.env.BOT_OWNER) {
        const ownerNorm = normalizeNumber(process.env.BOT_OWNER);
        if (ownerNorm && !normalized.includes(ownerNorm)) {
            normalized.push(ownerNorm);
            if (verbose) console.debug('[sudo] included BOT_OWNER ->', ownerNorm);
        }
    }

    // Deduplicate
    const deduped = Array.from(new Set(normalized));
    if (verbose) console.debug('[sudo] deduped ->', deduped);
    return deduped;
}

// Hardened isSudo implementation
async function isSudo(sender) {
    try {
        if (!sender) return false;
        const raw = process.env.SUDO || '';
        const verbose = envFlag('SUDO_VERBOSE') || envFlag('DEBUG_SUDO');

        // Reparse only when env var changes to avoid work on every call
        if (_sudoCache.raw !== raw) {
            if (verbose) console.debug('[sudo] SUDO env changed, reparsing (oldRaw=%s, newRaw=%s)', _sudoCache.raw, raw);
            _sudoCache.raw = raw;
            _sudoCache.list = parseSudoEnv(raw);
        }
        if (_sudoCache.list.length === 0) {
            if (verbose) console.debug('[sudo] parsed sudo list is empty -> denying');
            return false;
        }
        const senderNorm = normalizeNumber(sender);
        if (!senderNorm) {
            if (verbose) console.debug('[sudo] sender normalization produced empty -> denying');
            return false;
        }
        const result = _sudoCache.list.includes(senderNorm);
        if (verbose) console.debug('[sudo] isSudo check: sender=%s normalized=%s result=%s', sender, senderNorm, result);
        return result;
    } catch (e) {
        // On any unexpected error, fail safe and deny sudo
        const verbose = envFlag('SUDO_VERBOSE') || envFlag('DEBUG_SUDO');
        if (verbose) console.debug('[sudo] isSudo unexpected error:', e && e.message);
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
    isSudo,
    incrementWarningCount,
    resetWarningCount,
};
