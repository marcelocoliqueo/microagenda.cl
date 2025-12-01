// Using native fetch (Node.js 18+)

const WEBHOOK_URL = 'http://localhost:3000/api/mercadopago-webhook';

// Mock payment data simulating a successful payment from MercadoPago
const mockPaymentData = {
    action: 'payment.created',
    api_version: 'v1',
    data: {
        id: '1234567890', // Mock Payment ID
    },
    date_created: new Date().toISOString(),
    id: 1234567890,
    live_mode: false,
    type: 'payment',
    user_id: '123456789',
};

async function testWebhook() {
    console.log('🚀 Sending mock webhook request to:', WEBHOOK_URL);

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockPaymentData),
        });

        const data = await response.json();

        console.log('📡 Response Status:', response.status);
        console.log('📦 Response Body:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ Webhook test successful!');
        } else {
            console.error('❌ Webhook test failed.');
        }
    } catch (error) {
        console.error('❌ Error sending request:', error);
        console.log('\n⚠️  Make sure your Next.js server is running on http://localhost:3000');
    }
}

testWebhook();
