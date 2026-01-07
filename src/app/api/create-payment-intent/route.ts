import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { patientData } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000,
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        patientName: patientData.name,
        patientPhone: patientData.phone,
        department: patientData.department,
        medicineInfo: patientData.medicineInfo,
        doctorId: patientData.doctorId || '',
        reservationTime: patientData.reservationTime || 'Immediate',
      },
    });


    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Payment Intent creation failed:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
