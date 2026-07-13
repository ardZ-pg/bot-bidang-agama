const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Menentukan lokasi penyimpanan folder Google Chrome di dalam server Render
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
