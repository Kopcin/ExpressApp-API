import express from 'express';
import { fetchAllOrders } from './services/fetchOrders.js';
import { saveOrdersToJson, loadOrdersFromFile } from './services/loadFile.js';
import { Parser } from 'json2csv';
import basicAuth from 'express-basic-auth'
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'orders.json';

let allOrdersData = [];
let finishedOrdersSummary = [];

app.use(basicAuth({
    users: { 'admin': 'password' },
    challenge: true,
    realm: 'Protected API'
}))

app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);

    if (fs.existsSync(DATA_FILE)) {
        console.log(`Reading data from file ${DATA_FILE}`);
        allOrdersData = await loadOrdersFromFile() || [];
        finishedOrdersSummary = getFinishedOrdersSummary(allOrdersData);
        console.log('FINISHED orders summary:');
        console.dir(finishedOrdersSummary, { depth: null });
    } else {
        console.log(`Fetching from API`);
        await fetchAndProcessOrders();
    }

    const interval_24h = 24 * 60 * 60 * 1000;
    setInterval(fetchAndProcessOrders, interval_24h);
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

    const flatData = filteredOrders.flatMap(order =>
        order.products.map(product => ({
            orderID: order.orderID,
            productID: product.productID,
            quantity: product.quantity,
            orderWorth: `'${order.orderWorth}` // apostrophe so csv doesnt convert to date
        }))
    );

    const parser = new Parser({ fields: ['orderID', 'productID', 'quantity', 'orderWorth'], delimiter: ';' });
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

async function fetchAndProcessOrders() {
    try {
        allOrdersData = await fetchAllOrders();
        console.log(`[${new Date().toLocaleString('pl-PL', { timeZoneName: 'short' })}] Orders fetched`);
        await saveOrdersToJson(allOrdersData);

        finishedOrdersSummary = getFinishedOrdersSummary(allOrdersData);
        console.log('FINISHED orders summary:');
        console.dir(finishedOrdersSummary, { depth: null });
    } catch (error) {
        console.error('Failed to fetch orders', error);
    }
}

function getFinishedOrdersSummary(data) {
    const orders = data.Results || []

    return orders
        .filter(order => order.orderDetails?.orderStatus === 'finished')
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