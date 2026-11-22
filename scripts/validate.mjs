import fs from 'node:fs';
import path from 'node:path';

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
console.log('plugin manifest ok');
