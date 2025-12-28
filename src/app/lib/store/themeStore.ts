import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'theme-store.json');

export function getTheme(restaurantId?: string | number): 'DEFAULT' | 'MODERN' | 'ELEGANT' {
    try {
        if (fs.existsSync(STORE_FILE)) {
            const data = fs.readFileSync(STORE_FILE, 'utf-8');
            const json = JSON.parse(data);
            // If restaurantId is provided, look it up. Otherwise fallback to old behavior (or global default)
            // We cast to string to ensure consistent keying
            if (restaurantId) {
                return json[String(restaurantId)] || 'DEFAULT';
            }
            // Fallback for global store if no ID provided (legacy/single user mode)
            return json.theme || 'DEFAULT';
        }
    } catch (error) {
        console.error('Error reading theme store:', error);
    }
    return 'DEFAULT';
}

export function setTheme(theme: 'DEFAULT' | 'MODERN' | 'ELEGANT', restaurantId?: string | number) {
    try {
        let store: any = {};
        if (fs.existsSync(STORE_FILE)) {
            const data = fs.readFileSync(STORE_FILE, 'utf-8');
            try {
                store = JSON.parse(data);
            } catch (e) {
                store = {};
            }
        }

        if (restaurantId) {
            store[String(restaurantId)] = theme;
        } else {
            store.theme = theme; // Legacy/Global fallback
        }

        fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
    } catch (error) {
        console.error('Error writing theme store:', error);
    }
}
