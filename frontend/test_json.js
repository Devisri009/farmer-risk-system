import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const data = JSON.parse(fs.readFileSync(join(__dirname, 'src/locales/en.json'), 'utf-8'));
console.log(Object.keys(data));
