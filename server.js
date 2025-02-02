import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';

//load variables
dotenv.config();

//start server
const app = express();

app.use(express.static('public'));
app.use(express.json());


//Home Route
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: 'public'})
});

//success Route
app.get('/success', (req, res) => {
    res.sendFile('success.html', {root: 'public'})
});

//cancel Route
app.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', {root: 'public'})
});

let DOMAIN = process.env.DOMAIN;

//Start Stripe
let stripeGateway = stripe(process.env.stripe_api);
app.post('/stripe-checkout', async (req, res) => {
    const lineItems = req.body.items.map((item) => {
        const unitAmount = parseInt(item.price.replace(/[^0-9.-]+/g, "") * 100);
        console.log('item-price:', item.price);
        console.log('unitAmount:', unitAmount);
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                    images: [item.imageSrc]
                },
                unit_amount: unitAmount
            },
            quantity: item.quantity,
        };

    });
    console.log('lineItems:', lineItems);

    //Create Chechout Session
    const session = await stripeGateway.checkout.sessions.create({
        success_url: `${DOMAIN || process.env.PORT}/success`,
        cancel_url: `${DOMAIN || process.env.PORT}/cancel`,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        mode: 'payment',
    });
    res.json(session.url);
});

app.listen(3000 || process.env.PORT, () => {
    console.log('listening on port 3000')
})