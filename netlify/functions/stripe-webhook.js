require('dotenv').config();

// Netlify function to handle Stripe webhook events
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verify the Stripe webhook signature
function verifyStripeSignature(event, signature) {
  try {
    // For local development/testing, allow bypassing signature verification
    if (process.env.NODE_ENV === 'development' && signature === 'test-signature') {
      console.log('⚠️ Using test signature for local development');
      return JSON.parse(event.body);
    }

    // Verify the signature using the webhook secret
    return stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('⚠️ Webhook signature verification failed:', error.message);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

// Handle checkout.session.completed event
async function handleCheckoutSessionCompleted(session) {
  console.log('🔔 Processing checkout.session.completed event');

  try {
    // Get customer and subscription details
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (!customerId || !subscriptionId) {
      console.warn('⚠️ Missing customer or subscription ID in checkout session');
      return;
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Get the price ID from the subscription
    const priceId = subscription.items.data[0].price.id;

    // Update user in database
    await updateUserSubscription(customerId, subscriptionId, subscription, priceId);

    console.log(`✅ Successfully processed checkout session for customer ${customerId}`);
  } catch (error) {
    console.error('❌ Error handling checkout.session.completed:', error);
    throw error;
  }
}

// Handle customer.subscription.created event
async function handleSubscriptionCreated(subscription) {
  console.log('🔔 Processing customer.subscription.created event');

  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const priceId = subscription.items.data[0].price.id;

    // Update user in database
    await updateUserSubscription(customerId, subscriptionId, subscription, priceId);

    console.log(`✅ Successfully processed subscription created for customer ${customerId}`);
  } catch (error) {
    console.error('❌ Error handling customer.subscription.created:', error);
    throw error;
  }
}

// Handle customer.subscription.updated event
async function handleSubscriptionUpdated(subscription) {
  console.log('🔔 Processing customer.subscription.updated event');

  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const priceId = subscription.items.data[0].price.id;
    const status = subscription.status;

    // Update user in database
    await updateUserSubscription(customerId, subscriptionId, subscription, priceId);

    console.log(`✅ Successfully processed subscription update for customer ${customerId}`);
  } catch (error) {
    console.error('❌ Error handling customer.subscription.updated:', error);
    throw error;
  }
}

// Handle customer.subscription.deleted event
async function handleSubscriptionDeleted(subscription) {
  console.log('🔔 Processing customer.subscription.deleted event');

  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;

    // Update user to free plan
    await updateUserToFreePlan(customerId, subscriptionId);

    console.log(`✅ Successfully processed subscription deletion for customer ${customerId}`);
  } catch (error) {
    console.error('❌ Error handling customer.subscription.deleted:', error);
    throw error;
  }
}

// Handle invoice.payment_succeeded event
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('🔔 Processing invoice.payment_succeeded event');

  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      console.log('ℹ️ Invoice is not for a subscription, skipping');
      return;
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;

    // Update user subscription status to active
    await updateSubscriptionStatus(customerId, subscriptionId, 'active');

    // Record payment in subscription history
    await recordPayment(customerId, subscriptionId, invoice, 'paid');

    console.log(`✅ Successfully processed invoice payment for customer ${customerId}`);
  } catch (error) {
    console.error('❌ Error handling invoice.payment_succeeded:', error);
    throw error;
  }
}

// Handle invoice.payment_failed event
async function handleInvoicePaymentFailed(invoice) {
  console.log('🔔 Processing invoice.payment_failed event');

  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      console.log('ℹ️ Invoice is not for a subscription, skipping');
      return;
    }

    // Update user subscription status to past_due
    await updateSubscriptionStatus(customerId, subscriptionId, 'past_due');

    // Record failed payment in subscription history
    await recordPayment(customerId, subscriptionId, invoice, 'failed');

    console.log(`✅ Successfully processed failed invoice payment for customer ${customerId}`);
  } catch (error) {
    console.error('❌ Error handling invoice.payment_failed:', error);
    throw error;
  }
}

// Update user subscription in database
async function updateUserSubscription(stripeCustomerId, subscriptionId, subscription, priceId) {
  // Get plan name based on price ID
  const planName = await getPlanNameFromPriceId(priceId);

  // Get subscription status
  const status = subscription.status;

  // Get subscription end date
  const endDate = new Date(subscription.current_period_end * 1000);

  // Update user record
  const userResult = await pool.query(
    `UPDATE users
     SET subscription_plan = $1,
     WHERE stripe_customer_id = $2
     RETURNING id`,
    [planName, stripeCustomerId]
  );

  if (userResult.rows.length === 0) {
    console.warn(`⚠️ No user found with Stripe customer ID: ${stripeCustomerId}`);
    return;
  }

  const userId = userResult.rows[0].id;

  // Get plan ID
  const planResult = await pool.query(
    `SELECT id FROM subscription_plans WHERE name = $1 LIMIT 1`,
    [planName]
  );

  if (planResult.rows.length === 0) {
    console.warn(`⚠️ No subscription plan found with name: ${planName}`);
    return;
  }

  const planId = planResult.rows[0].id;

  // Check if subscription history record exists
  const historyResult = await pool.query(
    `SELECT id FROM user_subscriptions
     WHERE user_id = $1 AND plan_id = $2`,
    [userId, planId]
  );

  if (historyResult.rows.length === 0) {
    // Create new subscription history record
    await pool.query(
      `INSERT INTO user_subscriptions
       (user_id, plan_id, status, start_date, end_date)
       VALUES ($1, $2, $3, NOW(), $4)`,
      [userId, planId, status, endDate ]
    );
  } else {
    // Update existing subscription history record
    await pool.query(
      `UPDATE user_subscriptions
       SET plan_id = $1, end_date = $2, status = $3
       WHERE user_id = $4`,
      [planId, endDate, status, userId]
    );
  }
}

// Update user to free plan when subscription is canceled
async function updateUserToFreePlan(stripeCustomerId, subscriptionId) {
  // Update user record
  const userResult = await pool.query(
    `UPDATE users
     SET subscription_plan = 'free',
     WHERE stripe_customer_id = $1
     RETURNING id`,
    [stripeCustomerId]
  );

  if (userResult.rows.length === 0) {
    console.warn(`⚠️ No user found with Stripe customer ID: ${stripeCustomerId}`);
    return;
  }

  const userId = userResult.rows[0].id;

  // Update subscription history record
  await pool.query(
    `UPDATE user_subscriptions
     SET status = 'canceled', end_date = NOW()
     WHERE user_id = $1`,
    [userId]
  );
}

// Update subscription status
async function updateSubscriptionStatus(stripeCustomerId, subscriptionId, status) {
  // Update user record
  const userResult = await pool.query(
    `UPDATE users
     SET subscription_status = $1,
         updated_at = NOW()
     WHERE stripe_customer_id = $2
     RETURNING id`,
    [status, stripeCustomerId]
  );

  if (userResult.rows.length === 0) {
    console.warn(`⚠️ No user found with Stripe customer ID: ${stripeCustomerId}`);
    return;
  }

  const userId = userResult.rows[0].id;

  // Update subscription history record
  await pool.query(
    `UPDATE user_subscriptions
     SET status = $1
     WHERE user_id = $2`,
    [status, userId]
  );
}

// Record payment in subscription history
async function recordPayment(stripeCustomerId, subscriptionId, invoice, paymentStatus) {
  // Get user ID
  const userResult = await pool.query(
    `SELECT id FROM users WHERE stripe_customer_id = $1`,
    [stripeCustomerId]
  );

  if (userResult.rows.length === 0) {
    console.warn(`⚠️ No user found with Stripe customer ID: ${stripeCustomerId}`);
    return;
  }

  const userId = userResult.rows[0].id;

  // Update subscription history record with payment information
  await pool.query(
    `UPDATE user_subscriptions
     SET amount = $1
     WHERE user_id = $2`,
    [invoice.amount_paid, userId]
  );
}

// Map Stripe price ID to plan name
async function getPlanNameFromPriceId(priceId) {
  // Map Stripe price IDs to plan names
  switch (priceId) {
    case process.env.STRIPE_PRICE_PRO:
      return 'pro';
    case process.env.STRIPE_PRICE_CORE:
      return 'core';
    default:
      console.warn(`Unknown price ID: ${priceId}, defaulting to free plan`);
      return 'free';
  }
}

// Netlify function handler
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Get the Stripe signature from headers
    const signature = event.headers['stripe-signature'];

    if (!signature) {
      console.error('❌ Missing Stripe signature');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing Stripe signature' })
      };
    }

    // Verify the signature and parse the event
    const stripeEvent = verifyStripeSignature(event, signature);

    console.log(`🔔 Received Stripe event: ${stripeEvent.type}`);

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object);
        break;
      default:
        console.log(`ℹ️ Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('❌ Error processing webhook:', error);

    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};
