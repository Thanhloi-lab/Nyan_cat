import { DEFAULT_SPRITES } from '../src/utils/nyanRenderer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetPath = path.resolve(__dirname, '../public/defaultSprites.json');

fs.writeFileSync(targetPath, JSON.stringify(DEFAULT_SPRITES, null, 2), 'utf8');
console.log('Successfully synced DEFAULT_SPRITES to public/defaultSprites.json!');
