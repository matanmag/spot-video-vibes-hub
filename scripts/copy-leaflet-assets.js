import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const leafletPath = path.join(__dirname, '../node_modules/leaflet/dist/images');
const publicPath = path.join(__dirname, '../public');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
}

// Copy marker files
const files = [
    'marker-icon.png',
    'marker-icon-2x.png',
    'marker-shadow.png'
];

files.forEach(file => {
    fs.copyFileSync(
        path.join(leafletPath, file),
        path.join(publicPath, file)
    );
});

console.log('Leaflet marker assets copied to public directory'); 