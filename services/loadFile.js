import fs from 'fs/promises';

export async function saveOrdersToJson(data) {
    await fs.writeFile('orders.json', JSON.stringify(data, null, 2));
}

export async function loadOrdersFromFile() {
    try {
        const content = await fs.readFile('orders.json', 'utf-8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}
