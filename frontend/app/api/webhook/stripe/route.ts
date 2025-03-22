import { createOrder } from "@/lib/actions/order.actions"
import { NextResponse } from "next/server"
import stripe from "stripe"

export async function POST(request: Request) {
  const body = await request.text()

  const sig = request.headers.get('stripe-signature') as string
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    return NextResponse.json({ message: 'Webhook error', error: err })
  }
 
  // Get the ID and type
  const eventType = event.type

  // CREATE
  if (eventType === 'checkout.session.completed') {
    const { id, amount_total, metadata } = event.data.object
    
    // Validate that we have a valid id before creating the order
    if (!id) {
      console.error('Missing Stripe ID in webhook event')
      return NextResponse.json({ message: 'Missing Stripe ID in event' }, { status: 400 })
    }

    const order = {
      stripeId: id,
      eventId: metadata?.eventId || '',
      buyerId: metadata?.buyerId || '',
      totalAmount: amount_total ? (amount_total / 100).toString() : '0',
      createdAt: new Date(),
    }

    try {
      const newOrder = await createOrder(order)
      console.log('New order:', newOrder)
      return NextResponse.json({ message: 'OK', order: newOrder })
    } catch (error) {
      console.error('Error creating order:', error)
      return NextResponse.json({ message: 'Error creating order', error }, { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}