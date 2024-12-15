interface CheckoutItem {
  price: number;
  quantity: number;
  size: string;
  finish: string;
  shape: string;
  name: string;
}

const handleCheckout = async (items: CheckoutItem[]) => {
  try {
    const response = await fetch('https://stripe-checkout.your-worker.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error during checkout:', error);
  }
};

// Example usage:
const items = [{
  name: 'Custom Product',
  price: 29.99,
  quantity: 1,
  size: 'Large',
  finish: 'Matte',
  shape: 'Round',
}];

