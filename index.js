import express from 'express';
import { fetchAllOrders } from './services/fetchOrders.js';
import { Parser } from 'json2csv';
import basicAuth from 'express-basic-auth'
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

let allOrdersData = [];
let finishedOrdersSummary = [];

app.use(basicAuth({
    users: { 'admin': 'password' },
    challenge: true,
    realm: 'Protected API'
}))

app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);

    await summarizeOrders();

    const interval_24h = 24 * 60 * 60 * 1000;
    setInterval(updateOrders, interval_24h);
});

app.get('/orders/csv', (req, res) => {
    const { minWorth, maxWorth } = req.query;

    let filteredOrders = finishedOrdersSummary;

    if (minWorth) {
        filteredOrders = filteredOrders.filter(order => order.orderWorth >= parseFloat(minWorth));
    }

    if (maxWorth) {
        filteredOrders = filteredOrders.filter(order => order.orderWorth <= parseFloat(maxWorth));
    }

    const flatData = filteredOrders.map(order => ({
        orderID: order.orderID,
        orderWorth: order.orderWorth,
        products: order.products.map(p => `${p.productID}:${p.quantity}`).join('; ')
    }));

    const parser = new Parser({ fields: ['orderID', 'orderWorth', 'products'] });
    const csv = parser.parse(flatData);

    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    res.send(csv);
});

app.get('/orders/:id', (req, res) => {
    const order = finishedOrdersSummary.find(o => o.orderID === req.params.id);

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
});

async function updateOrders() {
    try {
        allOrdersData = await fetchAllOrders();
        finishedOrdersSummary = getFinishedOrdersSummary(allOrdersData);
        console.log(`[${new Date().toISOString()}] Orders fetched`);
    } catch (err) {
        console.error('Failed to fetch orders', err);
    }
}

async function summarizeOrders() {
    try {
        allOrdersData = await fetchAllOrders();
        console.log('Orders fetched');

        finishedOrdersSummary = getFinishedOrdersSummary(allOrdersData);

        console.log('Podsumowanie ZAMKNIĘTYCH zamówień:');
        console.dir(finishedOrdersSummary, { depth: null });
    } catch (err) {
        console.error('Failed to fetch orders', err);
    }
}

function getFinishedOrdersSummary(data) {
    const orders = data.Results || []

    return orders
        // .filter(order => order.orderDetails?.orderStatus === 'finished')
        .map(order => {
            const details = order.orderDetails;
            const orderID = order.orderId;
            const orderWorth = details.payments?.orderBaseCurrency?.orderProductsCost || 0;

            const products = (details.productsResults || []).map(product => ({
                productID: product.productId,
                quantity: product.productQuantity
            }));

            return {
                orderID,
                products,
                orderWorth: orderWorth,
            };
        });
}