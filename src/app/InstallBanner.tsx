'use client';

import { useEffect, useState } from 'react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 z-50 flex items-center justify-between animate-bounce">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00a651] flex items-center justify-center text-xl font-bold text-white">
          📲
        </div>
        <div>
          <h4 className="font-bold text-sm">দাওয়াতুস সুন্নাহ অ্যাপ</h4>
          <p className="text-xs text-gray-300">মোবাইলে অ্যাপ হিসেবে ইনস্টল করুন</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowBanner(false)} 
          className="text-gray-400 hover:text-white text-xs px-2 py-1"
        >
          পরে
        </button>
        <button 
          onClick={handleInstallClick} 
          className="bg-[#00a651] hover:bg-green-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-md"
        >
          ইনস্টল করুন
        </button>
      </div>
    </div>
  );
}