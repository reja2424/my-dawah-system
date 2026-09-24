'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('mobile', mobile.trim())
        .eq('pin', pin.trim())
        .maybeSingle();

      if (fetchError || !user) {
        setError('ভুল মোবাইল নাম্বার অথবা পাসওয়ার্ড! আবার চেষ্টা করুন।');
        setLoading(false);
        return;
      }

      localStorage.setItem('user_session', JSON.stringify(user));

      if (user.role === 'superadmin') {
        router.push(`/admin-dashboard`);
      } else if (user.role === 'daee') {
        router.push(`/dashboard?id=${user.user_id}`);
      } else {
        setError('মাদউদের জন্য ড্যাশবোর্ড সুবিধা নেই।');
        setLoading(false);
      }

    } catch (err: any) {
      console.error(err);
      setError('লগইনে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-7 rounded-2xl shadow-lg border-t-4 border-[#00a651] max-w-sm w-full">
        
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">লগইন করুন</h2>
        <p className="text-gray-500 text-xs text-center mb-6">দাওয়াতুস সুন্নাহ সিস্টেমে স্বাগতম</p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">
              মোবাইল নাম্বার
            </label>
            <input 
              type="tel" 
              value={mobile} 
              onChange={(e) => setMobile(e.target.value)} 
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a651]" 
              placeholder="01XXXXXXXXX" 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">
              পাসওয়ার্ড
            </label>
            <input 
              type="password" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a651] tracking-widest text-base" 
              placeholder="আপনার পাসওয়ার্ড দিন" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full text-white py-2.5 rounded-lg font-bold text-sm transition ${loading ? 'bg-gray-400' : 'bg-[#00a651] hover:bg-green-700'}`}>
            {loading ? 'যাচাই করা হচ্ছে...' : 'প্রবেশ করুন'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-gray-600">
          নতুন দাঈ হতে চান?{' '}
          <Link href="/register" className="text-[#00a651] font-bold hover:underline">
            নিবন্ধন করুন
          </Link>
        </div>

      </div>
    </div>
  );
}