require('dotenv').config();
const { isSudo } = require('./lib');

(async () => {
  console.log('SUDO env:', process.env.SUDO);
  console.log('BOT_OWNER:', process.env.BOT_OWNER);
  console.log('SUDO_VERBOSE:', process.env.SUDO_VERBOSE || process.env.DEBUG_SUDO);

  const tests = ['+923110470403', '+923416181562', '+1234567890', '923416181562'];
  for (const t of tests) {
    try {
      const res = await isSudo(t);
      console.log(`isSudo(${t}) -> ${res}`);
    } catch (e) {
      console.error(`isSudo(${t}) error:`, e.message);
    }
  }
})();
