'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase';

function MaduRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const daeeId = searchParams.get('daee') || '0001';
  const fromDashboard = searchParams.get('from') === 'dashboard';

  const [formData, setFormData] = useState({
    name: '',
    gender: 'পুরুষ', // ডিফল্ট পুরুষ
    mobile: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    education: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [assignedId, setAssignedId] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: existingMadus, error: countError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('role', 'madu')
        .eq('parent_daee_id', daeeId);

      if (countError) throw countError;

      const nextSerial = (existingMadus?.length || 0) + 1;
      const formattedMaduId = `${daeeId}-${String(nextSerial).padStart(2, '0')}`;

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: formattedMaduId,
            name: formData.name.trim(),
            gender: formData.gender, // মাদউয়ের জেন্ডার
            role: 'madu',
            parent_daee_id: daeeId,
            mobile: formData.mobile.trim(),
            email: formData.email ? formData.email.trim() : null,
            present_address: formData.presentAddress.trim(),
            permanent_address: formData.permanentAddress.trim(),
            education: formData.education.trim()
          }
        ]);

      if (insertError) throw insertError;

      if (fromDashboard) {
        setMessage(`আলহামদুলিল্লাহ! মাদউ (${formattedMaduId}) যুক্ত হয়েছে। ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...`);
        setTimeout(() => {
          router.push(`/dashboard?id=${daeeId}`);
        }, 1200);
      } else {
        setAssignedId(formattedMaduId);
        setIsSuccess(true);
      }

    } catch (error: any) {
      console.error(error);
      alert('সমস্যা হয়েছে: ' + (error?.message || 'আবার চেষ্টা করুন'));
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-green-600 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">নিবন্ধন সম্পন্ন হয়েছে!</h2>
          <p className="text-gray-600 mb-6">আলহামদুলিল্লাহ, আপনার তথ্য সফলভাবে জমা হয়েছে।</p>
          
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
            <span className="text-xs text-gray-500 font-medium uppercase">আপনার মাদউ আইডি</span>
            <div className="text-3xl font-bold text-green-700 mt-1">{assignedId}</div>
          </div>

          <p className="text-xs text-gray-400 mb-6">আপনার দাঈ আপনার সাথে যোগাযোগ করবেন। আপনার কাজ সমাপ্ত।</p>

          <Link href="/">
            <button className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition">
              মূল পাতায় ফিরে যান
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-lg">
        
        {fromDashboard && (
          <Link href={`/dashboard?id=${daeeId}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-600 mb-4 transition">
            ← ড্যাশবোর্ডে ফিরে যান
          </Link>
        )}

        <h2 className="text-2xl font-bold text-gray-800 text-center">মাদউ নিবন্ধন ফর্ম</h2>
        <p className="text-center text-sm text-green-600 font-medium mb-6 mt-1">
          (দাঈ আইডি: {daeeId} এর তত্ত্বাবধানে)
        </p>

        {message && (
          <div className="p-4 mb-6 rounded bg-green-100 text-green-700 font-medium text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">পুরো নাম *</label>
            <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="মাদউয়ের নাম লিখুন" required />
          </div>

          {/* জেন্ডার নির্বাচন */}
          <div>
            <label className="block text-gray-700 text-xs font-bold uppercase mb-1">লিঙ্গ (Gender) *</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer font-medium text-sm transition ${formData.gender === 'পুরুষ' ? 'border-[#00a651] bg-green-50 text-[#00a651] font-bold' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="পুরুষ" 
                  checked={formData.gender === 'পুরুষ'} 
                  onChange={handleChange} 
                  className="mr-2 accent-[#00a651]" 
                />
                👨 পুরুষ
              </label>
              <label className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer font-medium text-sm transition ${formData.gender === 'মহিলা' ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="মহিলা" 
                  checked={formData.gender === 'মহিলা'} 
                  onChange={handleChange} 
                  className="mr-2 accent-pink-600" 
                />
                🧕 মহিলা
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">মোবাইল নাম্বার (WhatsApp) *</label>
            <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="01XXXXXXXXX" required />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">ইমেইল (যদি থাকে)</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="example@email.com" />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">বর্তমান ঠিকানা *</label>
            <textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="ঠিকানা লিখুন" rows={2} required></textarea>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">স্থায়ী ঠিকানা *</label>
            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="স্থায়ী ঠিকানা" rows={2} required></textarea>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">পেশা / শিক্ষাগত যোগ্যতা *</label>
            <input name="education" value={formData.education} onChange={handleChange} type="text" className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="পেশা বা শিক্ষা" required />
          </div>

          <button type="submit" disabled={loading} className={`w-full text-white py-3 px-4 rounded font-bold mt-2 transition ${loading ? 'bg-gray-400' : 'bg-[#00a651] hover:bg-green-700'}`}>
            {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'মাদউ নিবন্ধন সম্পন্ন করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterMadu() {
  return (
    <Suspense fallback={<div className="text-center p-10">লোড হচ্ছে...</div>}>
      <MaduRegisterContent />
    </Suspense>
  );
}