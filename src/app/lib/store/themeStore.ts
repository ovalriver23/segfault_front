import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'theme-store.json');

export function getTheme(): 'DEFAULT' | 'MODERN' | 'ELEGANT' {
    try {
        if (fs.existsSync(STORE_FILE)) {
            const data = fs.readFileSync(STORE_FILE, 'utf-8');
            const json = JSON.parse(data);
            return json.theme || 'DEFAULT';
        }
    } catch (error) {
        console.error('Error reading theme store:', error);
    }
    return 'DEFAULT';
}

export function setTheme(theme: 'DEFAULT' | 'MODERN' | 'ELEGANT') {
    try {
        fs.writeFileSync(STORE_FILE, JSON.stringify({ theme }));
    } catch (error) {
        console.error('Error writing theme store:', error);
    }
}
