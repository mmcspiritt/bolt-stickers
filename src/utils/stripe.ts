interface CheckoutItem {
  price: number;
  quantity: number;
  size: string;
  finish: string;
  shape: string;
  name: string;
}

export const initiateCheckout = async (items: CheckoutItem[]) => {
  try {
    const response = await fetch(import.meta.env.VITE_WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        items,
        origin: window.location.origin 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Checkout error:', errorData);
      throw new Error(errorData.error || 'Network response was not ok');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error during checkout:', error);
    throw error;
  }
}