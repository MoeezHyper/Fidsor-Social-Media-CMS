const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

const targets = [
  { name: 'root', path: rootDir },
  { name: 'server', path: path.join(rootDir, 'server') },
  { name: 'client', path: path.join(rootDir, 'client') }
];

targets.forEach((target) => {
  const nodeModulesPath = path.join(target.path, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`\x1b[36m[setup]\x1b[0m 📦 node_modules missing in ${target.name}. Installing dependencies...`);
    try {
      execSync('npm install', { cwd: target.path, stdio: 'inherit' });
      console.log(`\x1b[32m[setup]\x1b[0m ✅ Successfully installed dependencies for ${target.name}.`);
    } catch (err) {
      console.error(`\x1b[31m[setup]\x1b[0m ❌ Failed to install dependencies for ${target.name}:`, err.message);
      process.exit(1);
    }
  }
});
