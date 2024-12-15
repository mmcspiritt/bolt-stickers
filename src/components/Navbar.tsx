import React, { useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import DownloadButton from './DownloadButton';
import EditableTitle from './EditableTitle';
import { Button } from './ui/button';
import { useWindow } from '../hooks/useWindow';
import { useSticker } from '../context/StickerContext';

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
}

const SupabaseLogo = () => (
  <svg width="28" height="28" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear)"/>
    <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint1_linear)" fillOpacity="0.2"/>
    <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
    <defs>
      <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
        <stop stopColor="#249361"/>
        <stop offset="1" stopColor="#3ECF8E"/>
      </linearGradient>
      <linearGradient id="paint1_linear" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
        <stop/>
        <stop offset="1" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const PenLogo = () => (
  <svg width="28" height="28" viewBox="0 0 51 21.9" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M24.1 19.3c-4.7 0-7-2.7-7-6.1s3.2-7.7 7.9-7.7 7 2.7 7 6.1-3.2 7.7-7.9 7.7Zm.2-4.3c1.6 0 2.7-1.5 2.7-3.1s-.8-2-2.2-2-2.7 1.5-2.7 3.1.8 2 2.2 2ZM37 19h-4.9l4-18.2H41l-4 18.1Z"/>
    <path d="M9.6 19.3c-1.5 0-3-.5-3.8-1.7L5.5 19 0 21.9.6 19 4.6.8h4.9L8.1 7.2c1.1-1.2 2.2-1.7 3.6-1.7 3 0 4.9 1.9 4.9 5.5s-2.3 8.3-7 8.3Zm1.9-7.3c0 1.7-1.2 3-2.8 3s-1.7-.3-2.2-.9l.8-3.3c.6-.6 1.2-.9 2-.9 1.2 0 2.2.9 2.2 2.2Z"/>
    <path d="M46.1 19.3c-2.8 0-4.9-1-4.9-3.3s0-.7.1-1l1.1-4.9h-2.2l1-4.2h2.2l.8-3.6L49.7 0l-.6 2.3-.8 3.6H51l-1 4.2h-2.7l-.7 3.2v.6c0 .6.4 1.1 1.2 1.1s.6 0 .7-.1v3.9c-.5.4-1.4.5-2.3.5Z"/>
  </svg>
);

export default function Navbar({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  setIsModalOpen 
}: NavbarProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { isMobile } = useWindow();
  const { designName } = useSticker();

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    setIsModalOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14">
        <div className="h-full max-w-[1920px] mx-auto px-4">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex items-center justify-center h-9"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              <div className="flex items-center space-x-2">
                <SupabaseLogo />
                <span className="text-xl font-bold">×</span>
                <PenLogo />
              </div>
            </div>

            {!isMobile && (
              <EditableTitle className="absolute left-1/2 transform -translate-x-1/2" />
            )}
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <DownloadButton />

              <Button
                variant="default"
                size="sm"
                onClick={handleCheckout}
                title="Confirm & Purchase"
                className="h-9 px-2 sm:px-3 flex items-center"
              >
                <ShoppingCart className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Purchase</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
      />
    </>
  );
}