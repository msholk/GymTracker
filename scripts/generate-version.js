// This script writes the version and build time to a file for Vite to inject
const fs = require('fs');
const pkg = require('../package.json');

const version = pkg.version;
const buildTime = new Date().toISOString();

const content = `export const APP_VERSION = '${version}';\nexport const APP_BUILD_TIME = '${buildTime}';\n`;

fs.writeFileSync('./src/version.ts', content);
console.log('Generated src/version.ts:', content);
