export async function fetchAllOrders() {
    const url = 'https://zooart6.yourtechnicaldomain.com/api/admin/v5/orders/orders/search';
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-API-KEY': 'YXBwbGljYXRpb24xNjpYeHI1K0MrNVRaOXBaY2lEcnpiQzBETUZROUxrRzFFYXZuMkx2L0RHRXZRdXNkcmF5R0Y3ZnhDMW1nejlmVmZP'
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