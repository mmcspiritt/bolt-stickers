import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import DesignOptionsToolbar from './components/DesignOptionsToolbar';
import { StickerProvider } from './context/StickerContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Success from './components/Success';
import Cancel from './components/Cancel';
import { AnalyticsProvider } from './context/AnalyticsContext';

function MainContent() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <div className="flex-1 flex overflow-hidden relative mt-14">
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative w-[85vw] lg:w-80 h-[calc(100vh-3.5rem)] lg:h-full top-14 lg:top-0 z-40 lg:translate-x-0 transition-transform duration-300 ease-in-out bg-background border-r overflow-hidden`}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </aside>

        <main className="flex-1 overflow-hidden w-full" style={{
          background: `radial-gradient(#e5e7eb 1px, transparent 0) 0 0 / 20px 20px,
                      radial-gradient(#e5e7eb 1px, transparent 0) 10px 10px / 20px 20px`
        }}>
          <Canvas />
        </main>

        <DesignOptionsToolbar isSidebarOpen={isSidebarOpen} isModalOpen={isModalOpen} />

        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-30"
               onClick={() => setIsSidebarOpen(false)} />
        )}
      </div>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, className: 'text-sm' }} />
    </div>
  );
}

function App() {
  const segmentKey = import.meta.env.VITE_SEGMENT_WRITE_KEY;
  
  if (!segmentKey) {
    console.warn('Segment write key is not configured in environment variables');
  }

  return (
    <Router>
      <AnalyticsProvider writeKey={segmentKey || ''}>
        <StickerProvider>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
          </Routes>
        </StickerProvider>
      </AnalyticsProvider>
    </Router>
  );
}

export default App;