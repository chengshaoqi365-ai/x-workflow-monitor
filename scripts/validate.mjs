import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const required = ['name', 'version', 'type', 'exports', 'dsh'];
for (const key of required) {
  if (!pkg[key]) throw new Error(`package.json missing ${key}`);
}
if (!pkg.dsh.bundle?.patch) throw new Error('package.json dsh.bundle.patch missing');
if (!pkg.dsh.client?.inject?.includes('@deepseek-ai/dsh-client-ui-conversation')) {
  throw new Error('dsh.client.inject must include @deepseek-ai/dsh-client-ui-conversation');
}
if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) throw new Error('package.json version must be semver');

for (const lang of ['zh', 'en']) {
  const file = path.join(root, 'locale', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.meta?.title || !data.meta?.description) {
    throw new Error(`${lang} locale missing meta.title/meta.description`);
  }
  if (!fs.existsSync(path.join(root, data.meta.detail || ''))) {
    throw new Error(`${lang} locale detail file missing`);
  }
}

const icon = path.join(root, 'icon.svg');
if (!fs.existsSync(icon)) throw new Error('icon.svg missing');

for (const file of ['client.js', 'index.js', 'scripts/validate.mjs']) {
  execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' });
}

const client = fs.readFileSync(path.join(root, 'client.js'), 'utf8');
const manifest = JSON.stringify(pkg);
const forbidden = [
  'playwright',
  'puppeteer',
  'chrome-remote-interface',
  '--remote-debugging',
  '--enable-automation',
  '--no-sandbox',
  '--disable-blink-features=AutomationControlled',
];
const haystack = `${client}\n${manifest}`.toLowerCase();
for (const token of forbidden) {
  if (haystack.includes(token.toLowerCase())) {
    throw new Error(`forbidden automation dependency or flag found: ${token}`);
  }
}
if (/require\(['"]child_process['"]\)|from\s+['"]node:child_process['"]/.test(client)) {
  throw new Error('client.js must not spawn local processes');
}
for (const endpoint of [
  'http://127.0.0.1:8787/status',
  'http://127.0.0.1:8788/control/status',
  'http://127.0.0.1:8788/control/run',
  'http://127.0.0.1:8788/control/stop',
]) {
  if (!client.includes(endpoint)) throw new Error(`client.js missing endpoint ${endpoint}`);
}
for (const marker of ['sidebar.panellist', "name: 'main'"]) {
  if (!client.includes(marker)) throw new Error(`client.js missing slot registration marker: ${marker}`);
}
console.log('plugin manifest ok');
console.log('client.js / index.js / validate.mjs syntax ok');
console.log('no Playwright / CDP / remote-debugging dependency or flag');
console.log('control service endpoints present');
