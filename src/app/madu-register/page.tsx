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
    gender: 'পুরুষ',
    mobile: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    profession: '', // পেশা
    education: ''   // শিক্ষাগত যোগ্যতা
  });
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [assignedId, setAssignedId] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // মাদউ মোবাইল ডুপ্লিকেট কিনা চেক
      const { data: existingMadu } = await supabase
        .from('profiles')
        .select('id')
        .eq('mobile', formData.mobile.trim())
        .maybeSingle();

      if (existingMadu) {
        alert('এই মোবাইল নাম্বারে ইতিমধ্যে একজন নিবন্ধিত আছেন!');
        setLoading(false);
        return;
      }

      // সিরিয়াল গোনা
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
            gender: formData.gender,
            role: 'madu',
            parent_daee_id: daeeId,
            mobile: formData.mobile.trim(),
            email: formData.email ? formData.email.trim() : null,
            present_address: formData.presentAddress.trim(),
            permanent_address: formData.permanentAddress.trim(),
            profession: formData.profession.trim(),
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
        <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-[#00a651] text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-green-100 text-[#00a651] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">নিবন্ধন সম্পন্ন হয়েছে!</h2>
          <p className="text-gray-600 text-xs mb-4">আলহামদুলিল্লাহ, আপনার তথ্য সফলভাবে জমা হয়েছে।</p>
          
          <div className="bg-green-50 border border-green-200 p-3 rounded-xl mb-5">
            <span className="text-[10px] text-gray-500 font-bold uppercase">মাদউ আইডি</span>
            <div className="text-2xl font-extrabold text-[#00a651]">{assignedId}</div>
          </div>

          <p className="text-[11px] text-gray-400 mb-4">আপনার দাঈ আপনার সাথে যোগাযোগ করবেন। আপনার কাজ সমাপ্ত।</p>

          <Link href="/">
            <button className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-black transition">
              মূল পাতায় ফিরে যান
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-3 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 w-full max-w-lg overflow-hidden">
        
        {/* কমপ্যাক্ট আধুনিক হেডার */}
        <div className="bg-[#008f45] text-white py-4 px-5 text-center relative">
          {fromDashboard && (
            <Link href={`/dashboard?id=${daeeId}`} className="absolute left-4 top-4 text-xs font-medium text-green-100 hover:text-white flex items-center gap-1">
              ← ব্যাক
            </Link>
          )}
          <h1 className="text-xl font-bold tracking-wide">মাদউ নিবন্ধন ফর্ম</h1>
          <p className="text-xs text-green-100 mt-0.5">দাঈ আইডি: <span className="font-bold underline">{daeeId}</span> এর তত্ত্বাবধানে</p>
        </div>

        {message && (
          <div className="m-4 p-3 rounded bg-green-100 text-green-700 text-xs font-medium text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">পুরো নাম *</label>
            <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="মাদউয়ের নাম লিখুন" required />
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">লিঙ্গ (Gender) *</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center justify-center py-2 px-3 rounded-lg border cursor-pointer text-xs font-medium transition ${formData.gender === 'পুরুষ' ? 'border-[#00a651] bg-green-50 text-[#00a651] font-bold' : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" name="gender" value="পুরুষ" checked={formData.gender === 'পুরুষ'} onChange={handleChange} className="mr-1.5 accent-[#00a651]" />
                👨 পুরুষ
              </label>
              <label className={`flex items-center justify-center py-2 px-3 rounded-lg border cursor-pointer text-xs font-medium transition ${formData.gender === 'মহিলা' ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold' : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" name="gender" value="মহিলা" checked={formData.gender === 'মহিলা'} onChange={handleChange} className="mr-1.5 accent-pink-600" />
                🧕 মহিলা
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">মোবাইল নাম্বার (WhatsApp) *</label>
            <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="01XXXXXXXXX" required />
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">বর্তমান ঠিকানা *</label>
            <textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="বর্তমান ঠিকানা" rows={1} required></textarea>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">স্থায়ী ঠিকানা *</label>
            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="স্থায়ী ঠিকানা" rows={1} required></textarea>
          </div>

          {/* পেশা এবং শিক্ষাগত যোগ্যতা সম্পূর্ণ আলাদা দুটি ঘর */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1">পেশা *</label>
              <input name="profession" value={formData.profession} onChange={handleChange} type="text" className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="যেমন: ব্যবসা / চাকরি / ছাত্র" required />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold mb-1">শিক্ষাগত যোগ্যতা *</label>
              <input name="education" value={formData.education} onChange={handleChange} type="text" className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="যেমন: এইচএসসি / মাস্টার্স" required />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="example@gmail.com" />
          </div>

          <button type="submit" disabled={loading} className={`w-full py-2.5 rounded-lg font-bold text-sm text-white transition ${loading ? 'bg-gray-400' : 'bg-[#00a651] hover:bg-green-700 shadow'}`}>
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