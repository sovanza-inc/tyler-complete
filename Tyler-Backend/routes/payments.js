const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middleware/auth');
const prisma = require('../lib/prisma');
const router = express.Router();

// Price ID from your boss
const STATIC_PRICE_ID = 'price_1R6yt5B7S6nOH9hatf25uBHR';
const PRODUCT_ID = 'prod_S10uAoD951d49r';

// Get price details
router.get('/price-details', authMiddleware, async (req, res) => {
    try {
        // Fetch price details from Stripe
        const price = await stripe.prices.retrieve(STATIC_PRICE_ID);
        const product = await stripe.products.retrieve(PRODUCT_ID);

        res.json({
            amount: price.unit_amount,
            currency: price.currency,
            productName: product.name
        });
    } catch (error) {
        console.error('Failed to fetch price details:', error);
        res.status(500).json({ error: 'Failed to fetch payment details' });
    }
});

// Create Payment Intent
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
    try {
        const { customer } = req.body;

        if (!req.userId) {
            console.error('No userId found in request:', req.userId);
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!customer?.name || !customer?.address?.line1) {
            return res.status(400).json({ 
                error: 'Customer name and address are required for Indian export transactions' 
            });
        }

        // Fetch price details
        const price = await stripe.prices.retrieve(STATIC_PRICE_ID);

        // Create or update Stripe customer
        let stripeCustomer;
        try {
            stripeCustomer = await stripe.customers.create({
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address
            });
        } catch (error) {
            console.error('Error creating Stripe customer:', error);
            throw new Error('Failed to create customer profile');
        }

        // Create payment intent with static price
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price.unit_amount,
            currency: price.currency,
            customer: stripeCustomer.id,
            metadata: {
                userId: req.userId,
                priceId: STATIC_PRICE_ID,
                productId: PRODUCT_ID
            },
            description: 'Software development and consulting services',
            statement_descriptor: 'Tyler Tech Services',
            statement_descriptor_suffix: 'Dev',
            shipping: {
                name: customer.name,
                address: customer.address
            }
        });

        console.log('Payment Intent Created:', {
            intentId: paymentIntent.id,
            userId: req.userId,
            amount: price.unit_amount,
            customerId: stripeCustomer.id
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({ 
            error: error.message,
            userId: req.userId 
        });
    }
});

// Rest of your existing webhook and history routes remain the same...
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                
                await prisma.payment.updateMany({
                    where: { paymentIntentId: paymentIntent.id },
                    data: {
                        status: 'completed',
                        metadata: {
                            ...paymentIntent,
                            stripeEvent: event.type
                        }
                    }
                });
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                
                await prisma.payment.updateMany({
                    where: { paymentIntentId: failedPayment.id },
                    data: {
                        status: 'failed',
                        metadata: {
                            ...failedPayment,
                            stripeEvent: event.type,
                            failureMessage: failedPayment.last_payment_error?.message
                        }
                    }
                });
                break;
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

router.get('/history', authMiddleware, async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(payments);
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
});

module.exports = router;