import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as any,
      httpClient: Stripe.createFetchHttpClient(),
    });

    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;

    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed.', err.message);
        return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
      }
    } else {
      // In dev environment or if no secret provided, parse directly
      event = JSON.parse(rawBody);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Parse shipping details
      const sessionAny = session as any;
      const customerEmail = session.customer_details?.email || sessionAny.customer_email;
      const customerName = sessionAny.shipping_details?.name || session.customer_details?.name;
      const shippingAddress = sessionAny.shipping_details?.address || session.customer_details?.address;
      
      // Parse metadata for printful variant IDs
      const cartItemsMetadata = session.metadata?.cartItems;
      const items = cartItemsMetadata ? JSON.parse(cartItemsMetadata) : [];

      // 1. Submit Order to Printful
      let printfulOrderId = null;
      
      if (items.length > 0 && process.env.PRINTFUL_API_KEY) {
        const printfulPayload = {
          recipient: {
            name: customerName,
            address1: shippingAddress?.line1,
            address2: shippingAddress?.line2,
            city: shippingAddress?.city,
            state_code: shippingAddress?.state,
            country_code: shippingAddress?.country,
            zip: shippingAddress?.postal_code,
            email: customerEmail,
          },
          items: items.map((item: any) => ({
            sync_variant_id: item.sku,
            quantity: item.quantity,
          })),
        };

        try {
          const pfRes = await fetch('https://api.printful.com/orders', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(printfulPayload),
          });
          
          if (pfRes.ok) {
            const pfData = await pfRes.json();
            printfulOrderId = pfData.result?.id?.toString();
            console.log('Successfully created Printful order:', printfulOrderId);
          } else {
            console.error('Printful API Error:', await pfRes.text());
          }
        } catch (pfErr) {
          console.error('Failed to submit order to Printful:', pfErr);
        }
      }

      // 2. Insert into Supabase 'orders' table
      const { error: dbError } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: session.id,
          customer_email: customerEmail,
          customer_name: customerName,
          shipping_address: shippingAddress,
          order_total: session.amount_total ? session.amount_total / 100 : 0,
          printful_order_id: printfulOrderId,
        });

      if (dbError) {
        console.error('Supabase DB Insert Error:', dbError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}