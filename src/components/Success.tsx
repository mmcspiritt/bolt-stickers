import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../context/AnalyticsContext';
import { trackEvents } from '../utils/analytics';

export default function Success() {
  const { analytics } = useAnalytics();

  useEffect(() => {
    if (analytics) {
      analytics.track(trackEvents.CHECKOUT_COMPLETED, {
        status: 'success',
        timestamp: new Date().toISOString()
      });
    }
  }, [analytics]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Order Successful!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Thank you for your order. We'll start processing it right away.
          </p>
        </div>
        <div className="mt-8">
          <Link
            to="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Another Design
          </Link>
        </div>
      </div>
    </div>
  );
}