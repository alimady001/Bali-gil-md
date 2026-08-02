// commands/index.js
const fs = require('fs');
const path = require('path');

const commandsDir = __dirname;
const files = fs.readdirSync(commandsDir);

const commands = {};

// Load each .js file (except this index) and attach to commands object
for (const file of files) {
  if (!file.endsWith('.js') || file === 'index.js') continue;
  const name = path.basename(file, '.js');
  try {
    const mod = require(path.join(commandsDir, file));
    // If the module exports a single function, attach it as the command name
    // If the module exports an object, merge/attach appropriately.
    if (typeof mod === 'function') {
      commands[name] = mod;
    } else if (mod && typeof mod === 'object') {
      // If module exposes a specific "handle<CommandName>Command" or "handleTranslateCommand",
      // keep it available. Also set the module itself under its filename for explicit access.
      commands[name] = mod;
      // if module has a handle... function, also expose it under commands[name].handler for clarity
      const handlerKeys = Object.keys(mod).filter(k => k.toLowerCase().includes('handle') || k.toLowerCase().includes('command'));
      if (handlerKeys.length === 1) commands[name] = mod[handlerKeys[0]];
    }
  } catch (err) {
    // Do not crash on a single command load failure; report it so the operator can fix it.
    console.error(`[commands/index] Failed loading command "${file}": ${err.message}`);
    // leave a placeholder to fail fast if invoked
    commands[name] = () => {
      throw new Error(`Command module "${file}" failed to load. See server logs.`);
    };
  }
}

module.exports = commands;
