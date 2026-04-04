require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = 5001; // Forced to 5001 to prevent main backend conflict

app.use(cors());
app.use(express.json());

// ── Unified Payment Interface ────────────────────────────────────────────────
// This endpoint initiates a payment and returns the necessary data/redirect
app.post('/api/payment/initiate', async (req, res) => {
    const { provider, orderId, amount, customerName } = req.body;

    if (!provider || !orderId || !amount) {
        return res.status(400).json({ success: false, error: 'Provider, orderId, and amount are required.' });
    }

    try {
        let result;
        switch (provider.toLowerCase()) {
            case 'esewa':
                result = await initiateEsewa(orderId, amount);
                break;
            case 'khalti':
                result = await initiateKhalti(orderId, amount, customerName);
                break;
            case 'mock':
                result = await initiateMock(orderId, amount);
                break;
            default:
                throw new Error('Unsupported payment provider.');
        }

        res.json({ success: true, ...result });
    } catch (err) {
        console.error(`[PAYMENT ERROR] ${provider}:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── eSewa Implementation ─────────────────────────────────────────────────────
async function initiateEsewa(orderId, amount) {
    const merchantId = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    const secretKey = process.env.ESEWA_SECRET_KEY || '8g8M89dg8748lcS8';
    
    // eSewa signature: total_amount,transaction_uuid,product_code
    // Note: This is for eSewa v2 (latest)
    const signatureString = `total_amount=${amount},transaction_uuid=${orderId},product_code=${merchantId}`;
    const signature = crypto.createHmac('sha256', secretKey).update(signatureString).digest('base64');

    return {
        provider: 'esewa',
        formUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        formData: {
            amount: amount,
            tax_amount: '0',
            total_amount: amount,
            transaction_uuid: orderId,
            product_code: merchantId,
            product_service_charge: '0',
            product_delivery_charge: '0',
            success_url: `${process.env.MAIN_BACKEND_URL}/api/payment/verify/esewa`,
            failure_url: `${process.env.MOCK_FAILURE_URL}`,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature: signature
        }
    };
}

// ── Khalti Implementation ────────────────────────────────────────────────────
async function initiateKhalti(orderId, amount, customerName) {
    const KHALTI_API_URL = 'https://a.khalti.com/api/v2/epayment/initiate/';
    
    try {
        const response = await axios.post(KHALTI_API_URL, {
            return_url: `${process.env.MAIN_BACKEND_URL}/api/payment/verify/khalti`,
            website_url: 'http://localhost:5173',
            amount: amount * 100, // Khalti amount is in paisa
            purchase_order_id: orderId,
            purchase_order_name: `Order #${orderId}`,
            customer_info: {
                name: customerName || 'Valued Customer'
            }
        }, {
            headers: {
                'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`
            }
        });

        return {
            provider: 'khalti',
            payment_url: response.data.payment_url,
            pidx: response.data.pidx
        };
    } catch (err) {
        throw new Error('Khalti initiation failed: ' + (err.response?.data?.detail || err.message));
    }
}

// ── Mock Implementation ──────────────────────────────────────────────────────
async function initiateMock(orderId, amount) {
    return {
        provider: 'mock',
        payment_url: `${process.env.MAIN_BACKEND_URL}/api/payment/mock-gateway?orderId=${orderId}&amount=${amount}`,
        message: 'Mock payment gateway initiated.'
    };
}

// ── Server Listen ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n\x1b[32m[PAYMENT GATEWAY] Unified Service Running\x1b[0m`);
    console.log(`ENDPOINT: http://localhost:${PORT}/api/payment/initiate`);
    console.log(`PROVIDERS: eSewa, Khalti, Mock\n`);
});
