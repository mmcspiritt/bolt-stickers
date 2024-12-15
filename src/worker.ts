import Stripe from 'stripe';

interface CheckoutItem {
  name: string;
  price: number;
  quantity: number;
  size: string;
  finish: string;
  shape: string;
  image_url?: string;
}

interface Env {
  STRIPE_SECRET_KEY: string;
  STICKER_BUCKET: any;
}

// Convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Format date as MM-DD-YYYY
function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

// Clean string for filename (remove quotes and special characters)
function cleanForFilename(str: string): string {
  return str.replace(/['"]/g, '').replace(/[^a-zA-Z0-9-]/g, '-');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    try {
      const { items, origin } = await request.json() as { items: CheckoutItem[], origin: string };
      let publicImageUrl = '';
      
      if (items[0].image_url) {
        try {
          // Extract the base64 data from the data URL
          const base64Data = items[0].image_url.split(',')[1];
          const imageData = base64ToUint8Array(base64Data);
          
          // Generate a readable filename
          const date = formatDate(new Date());
          const shape = cleanForFilename(items[0].shape);
          const quantity = items[0].quantity.toString();
          const size = cleanForFilename(items[0].size);
          
          const filename = `stickers/${date}-${shape}-${quantity}-${size}.png`;
          
          // Upload to R2
          await env.STICKER_BUCKET.put(filename, imageData, {
            httpMetadata: {
              contentType: 'image/png',
            },
          });
          
          // Get the public URL using the R2 public endpoint
          publicImageUrl = `https://pub-168ad5e50ccd42cabba436340b7ce6ae.r2.dev/${filename}`;
        } catch (imageError) {
          console.error('Image processing error:', imageError);
          // Continue without the image if upload fails
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${item.quantity} Custom Stickers - ${item.size} ${item.shape}`,
              description: `• Finish: ${item.finish}\n• Size: ${item.size}\n• Shape: ${item.shape}\n• Quantity: ${item.quantity}\n\nNote: We will perform a test print to ensure the quality is up to our standards. We will reach out to you if there are any issues.`,
              images: publicImageUrl ? [publicImageUrl] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${origin}/success`,
        cancel_url: `${origin}/cancel`,
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error: any) {
      console.error('Error details:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        details: error.toString() 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
};