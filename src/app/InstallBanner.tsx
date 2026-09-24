'use client';

import { useEffect, useState } from 'react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // আগে যদি বাতিল করে থাকে তবে আর আসবে না
    const isDismissed = localStorage.getItem('dawat_app_dismissed');
    if (isDismissed) return;

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

  // 'পরে' বাটনে চাপলে মেমোরিতে সেভ হবে, আর কখনোই আসবে না
  const handleDismiss = () => {
    localStorage.setItem('dawat_app_dismissed', 'true');
    setShowBanner(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('dawat_app_dismissed', 'true');
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 z-50 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">📲</span>
        <div>
          <h4 className="font-bold text-xs">দাওয়াতুস সুন্নাহ</h4>
          <p className="text-[10px] text-gray-300">অ্যাপ হিসেবে ইনস্টল করুন</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleDismiss} 
          className="text-gray-400 hover:text-white text-xs px-2 py-1"
        >
          পরে
        </button>
        <button 
          onClick={handleInstallClick} 
          className="bg-[#00a651] hover:bg-green-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
        >
          ইনস্টল
        </button>
      </div>
    </div>
  );
}