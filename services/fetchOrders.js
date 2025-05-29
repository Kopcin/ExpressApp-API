export async function fetchAllOrders() {
    if (!process.env.API_KEY) {
        console.error("ERROR: Missing API_KEY in environment variables.");
        process.exit(1);
    }

    const url = 'https://zooart6.yourtechnicaldomain.com/api/admin/v5/orders/orders/search';
    const API_KEY = process.env.API_KEY;
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({
            params: {
                ordersStatuses: ['finished']
            }
        })
    };

    try {
        const res = await fetch(url, options);
        const json = await res.json();
        return json;
    } catch (err) {
        console.error(err);
        throw err;
    }
}