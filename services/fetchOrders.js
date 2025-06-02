export async function fetchAllOrders() {
    if (!process.env.API_KEY) {
        console.error("ERROR: Missing API_KEY in environment variables.");
        process.exit(1);
    }

    const url = 'https://zooart6.yourtechnicaldomain.com/api/admin/v5/orders/orders/search';
    const API_KEY = process.env.API_KEY;
    const headers = {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-API-KEY': API_KEY,
    };

    const allResults = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    try {
        while (hasMore) {
            const body = {
                params: {
                    "resultsLimit": pageSize,
                    "resultsPage": page,
                }
            };

            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                throw new Error(`API error at page ${page}: ${res.status} ${res.statusText}`);
            }

            const json = await res.json();
            const results = json?.Results || [];
            allResults.push(...results);
            console.log(`Fetched page ${page}, got ${results.length} results`);

            hasMore = results.length === pageSize;
            page++;
        }

        console.log(`Total orders fetched: ${allResults.length}`);

        return { Results: allResults };

    } catch (err) {
        console.error('Failed to fetch all orders:', err);
        throw err;
    }
}
