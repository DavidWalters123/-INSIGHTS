import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createStripeCheckoutSession = functions.firestore
  .document('stripe_checkout_sessions/{sessionId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: data.price,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: data.success_url,
        cancel_url: data.cancel_url,
        customer_email: data.user_email,
      });

      await snap.ref.update({
        sessionId: session.id,
        status: 'created'
      });

      return session;
    } catch (error) {
      await snap.ref.update({ status: 'error', error: error.message });
      throw error;
    }
  });

export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig!,
      webhookSecret!
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleSuccessfulPayment(session);
        break;
      // Add other event handlers as needed
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const { customer_email, client_reference_id } = session;

  // Update the order status in Firestore
  const orderRef = admin.firestore().doc(`orders/${client_reference_id}`);
  await orderRef.update({
    status: 'paid',
    stripeSessionId: session.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Grant access to the purchased product
  // Add your logic here
}