import { loadStripe } from '@stripe/stripe-js';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';

// Initialize Stripe with the public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export async function createCheckoutSession(productId: string, priceId: string) {
  if (!auth.currentUser) {
    toast.error('Please sign in to make a purchase');
    return;
  }

  try {
    // Create a checkout session in Firestore
    const docRef = await addDoc(collection(db, 'stripe_checkout_sessions'), {
      price: priceId,
      product_id: productId,
      user_id: auth.currentUser.uid,
      success_url: `${window.location.origin}/products/${productId}?success=true`,
      cancel_url: `${window.location.origin}/products/${productId}?canceled=true`,
      created_at: serverTimestamp(),
    });

    // Get the session ID from the document
    const docSnap = await getDoc(docRef);
    const { sessionId } = docSnap.data() as { sessionId: string };

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) throw error;
  } catch (err) {
    console.error('Error creating checkout session:', err);
    toast.error('Failed to process payment');
  }
}

export async function createStripeAccount() {
  if (!auth.currentUser) {
    toast.error('Please sign in to create a Stripe account');
    return;
  }

  try {
    // Create a Stripe Connect account request in Firestore
    const docRef = await addDoc(collection(db, 'stripe_account_links'), {
      user_id: auth.currentUser.uid,
      type: 'express',
      created_at: serverTimestamp(),
    });

    // Get the account link URL
    const docSnap = await getDoc(docRef);
    const { url } = docSnap.data() as { url: string };

    // Redirect to Stripe Connect onboarding
    window.location.href = url;
  } catch (err) {
    console.error('Error creating Stripe account:', err);
    toast.error('Failed to create Stripe account');
  }
}

export async function getStripeAccountStatus(userId: string) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data();
    
    if (!userData?.stripeAccountId) return 'not_connected';
    
    // Check if the account is fully onboarded
    const accountRef = doc(db, 'stripe_accounts', userData.stripeAccountId);
    const accountSnap = await getDoc(accountRef);
    const accountData = accountSnap.data();
    
    return accountData?.charges_enabled ? 'active' : 'pending';
  } catch (err) {
    console.error('Error getting Stripe account status:', err);
    return 'error';
  }
}