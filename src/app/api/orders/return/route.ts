import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return handleReturn(request);
}

export async function POST(request: Request) {
  return handleReturn(request);
}

async function handleReturn(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const orderId = searchParams.get('order_id');
    
    // Also check if Cashfree sent it via formData (in case of POST)
    let bodyOrderId = null;
    if (request.method === 'POST') {
      try {
        if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
           const formData = await request.formData();
           bodyOrderId = formData.get('order_id');
        }
      } catch (e) {}
    }
    
    const finalOrderId = orderId || bodyOrderId;

    if (!projectId) {
      // Redirect to home if no project ID
      return NextResponse.redirect(new URL('/', request.url), 302);
    }

    // Redirect to the success page with success params
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes('localhost') 
      ? process.env.NEXT_PUBLIC_BASE_URL 
      : `${protocol}://${host}`;
      
    return NextResponse.redirect(`${baseUrl}/success?projectId=${projectId}&order_id=${finalOrderId || ''}`, 302);
  } catch (err) {
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes('localhost') 
      ? process.env.NEXT_PUBLIC_BASE_URL 
      : `${protocol}://${host}`;
      
    return NextResponse.redirect(`${baseUrl}/`, 302);
  }
}
