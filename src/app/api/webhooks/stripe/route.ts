import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' as any })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId, userId, projectId } = session.metadata || {};

      console.log(`✅ Payment succeeded for order ${orderId}`, {
        userId,
        projectId,
        amountTotal: session.amount_total,
        customerEmail: session.customer_details?.email,
      });

      // Update order status in Firestore if configured
      if (orderId && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        try {
          const { getAdminDb } = await import('@/lib/firebase-admin');
          const db = getAdminDb();
          await db.collection('orders').doc(orderId).update({
            status: 'completed',
            stripeSessionId: session.id,
            completedAt: new Date().toISOString(),
            customerEmail: session.customer_details?.email || null,
          });
          console.log(`📦 Order ${orderId} marked as completed in Firestore`);
        } catch (firestoreError) {
          console.error('Failed to update order in Firestore:', firestoreError);
          // Don't fail the webhook — Stripe will retry
        }
      }

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId } = session.metadata || {};

      if (orderId && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        try {
          const { getAdminDb } = await import('@/lib/firebase-admin');
          const db = getAdminDb();
          await db.collection('orders').doc(orderId).update({
            status: 'expired',
            expiredAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Failed to update expired order:', error);
        }
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
