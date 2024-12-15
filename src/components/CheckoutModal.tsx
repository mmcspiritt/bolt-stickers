import { useState, useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useSticker } from '../context/StickerContext';
import { calculatePrice, formatPrice } from '../utils/pricing';
import { Button } from './ui/button';
import { Label } from './ui/label';
import NumberInput from './NumberInput';
import toast from 'react-hot-toast';
import { initiateCheckout } from '../utils/stripe';
import { getCanvasDataURL } from '../utils/canvas/exportHandlers';
import { useAnalytics } from '../context/AnalyticsContext';
import { trackEvents, trackStickerDesign } from '../utils/analytics';
import { fabric } from 'fabric';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { 
    size, 
    quantity, 
    updateQuantity,
    finish,
    updateFinish,
    canvasShape,
  } = useSticker();
  const { analytics } = useAnalytics();
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const price = calculatePrice(size.width, size.height, quantity);
  const pricePerSticker = price / quantity;

  const handleQuantityBlur = (value: number) => {
    if (value < 50) {
      updateQuantity(50);
      toast.error('Minimum quantity is 50');
      return;
    }

    trackStickerDesign(analytics, trackEvents.QUANTITY_CHANGED, {
      width: size.width,
      height: size.height,
      shape: canvasShape,
      finish,
      quantity: value,
      price
    });
  };

  const handleFinishChange = (newFinish: 'matte' | 'glossy') => {
    updateFinish(newFinish);
    trackStickerDesign(analytics, trackEvents.FINISH_CHANGED, {
      width: size.width,
      height: size.height,
      shape: canvasShape,
      finish: newFinish,
      quantity,
      price
    });
  };

  const handlePurchase = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      const canvas = (window as any).fabricCanvas as fabric.Canvas;
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const finalDesignUrl = await getCanvasDataURL(canvas);
      if (!finalDesignUrl) {
        throw new Error('Failed to generate design preview');
      }

      trackStickerDesign(analytics, trackEvents.CHECKOUT_STARTED, {
        width: size.width,
        height: size.height,
        shape: canvasShape,
        finish,
        quantity,
        price
      });

      const checkoutItem = {
        name: 'Custom Sticker',
        price: pricePerSticker,
        quantity: quantity,
        size: `${size.width}"x${size.height}"`,
        finish: finish,
        shape: canvasShape,
        image_url: finalDesignUrl
      };

      await initiateCheckout([checkoutItem]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process payment';
      console.error('Checkout error:', err);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const canvas = (window as any).fabricCanvas as fabric.Canvas;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const generatePreview = async () => {
      try {
        canvas.renderAll();
        const url = await getCanvasDataURL(canvas);
        if (url) {
          setPreviewUrl(url);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
        toast.error('Failed to generate preview');
      }
    };

    // Small delay to ensure canvas is ready
    const timeoutId = setTimeout(generatePreview, 100);
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl my-4">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold">Order Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4 order-2 lg:order-1">
            <Label className="text-lg">Preview</Label>
            {previewUrl ? (
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border bg-white">
                <img 
                  src={previewUrl} 
                  alt="Sticker Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-square w-full rounded-lg border border-dashed flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading preview...</p>
              </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-base sm:text-lg">Size</Label>
                <div className="text-lg sm:text-xl font-medium mt-1">
                  {size.width}" × {size.height}"
                </div>
              </div>

              <div>
                <Label className="text-base sm:text-lg">Shape</Label>
                <div className="text-lg sm:text-xl font-medium capitalize mt-1">
                  {canvasShape}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <Label className="text-base sm:text-lg">Quantity</Label>
                <NumberInput
                  value={quantity}
                  onChange={updateQuantity}
                  onBlur={handleQuantityBlur}
                  min={1}
                  step={1}
                  helpText="Min: 50"
                />
              </div>
            </div>

            <div>
              <Label className="text-base sm:text-lg mb-2 block">Finish</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={finish === 'matte' ? 'default' : 'outline'}
                  onClick={() => handleFinishChange('matte')}
                  className="w-full text-base py-4 sm:py-6"
                  disabled={isProcessing}
                >
                  Matte
                </Button>
                <Button
                  type="button"
                  variant={finish === 'glossy' ? 'default' : 'outline'}
                  onClick={() => handleFinishChange('glossy')}
                  className="w-full text-base py-4 sm:py-6"
                  disabled={isProcessing}
                >
                  Glossy
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base sm:text-lg font-medium">Total Price:</span>
                <span className="text-2xl sm:text-3xl font-bold">{formatPrice(price)}</span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                We will print a test and confirm with you if there are any quality issues before printing the full batch.
              </p>

              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full py-4 sm:py-6 text-base sm:text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}