'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabase';

export default function RegisterDaee() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    pin: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    education: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.pin.length < 4) {
      alert('পিন কোড কমপক্ষে ৪ ডিজিটের হতে হবে!');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: 'Pending',
            name: formData.name.trim(),
            role: 'daee',
            parent_daee_id: null,
            mobile: formData.mobile.trim(),
            pin: formData.pin.trim(),
            email: formData.email ? formData.email.trim() : null,
            present_address: formData.presentAddress.trim(),
            permanent_address: formData.permanentAddress.trim(),
            education: formData.education.trim()
          }
        ]);

      if (insertError) throw insertError;

      setIsSuccess(true);

    } catch (error: any) {
      console.error(error);
      alert('সমস্যা হয়েছে: ' + (error?.message || 'আবার চেষ্টা করুন'));
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-500 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ⏳
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">আবেদন জমা হয়েছে!</h2>
          <p className="text-gray-600 mb-6">
            আলহামদুলিল্লাহ, আপনার নিবন্ধন সফলভাবে জমা হয়েছে। আপনার দাঈ কোডটি বর্তমানে 
            <span className="font-bold text-yellow-600"> পর্যালোচনায় (Pending)</span> রয়েছে।
          </p>
          
          <div className="bg-gray-50 border p-4 rounded-xl mb-6 text-sm text-gray-600">
            কেন্দ্রীয় সুপার এডমিন আপনার আবেদন যাচাই করে দাঈ কোড অনুমোদন করবেন। আপনি আপনার মোবাইল ও পিন দিয়ে লগইন করে স্ট্যাটাস দেখতে পারবেন।
          </div>

          <Link href="/login">
            <button className="w-full bg-[#00a651] text-white py-3 rounded-lg font-medium hover:bg-green-700 transition">
              লগইন পেজে যান
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">নতুন দাঈ নিবন্ধন</h2>
        <p className="text-xs text-center text-gray-500 mb-8">(* চিহ্নিত ঘরগুলো পূরণ করা বাধ্যতামূলক)</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">পুরো নাম *</label>
            <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border p-2.5 rounded focus:outline-none focus:border-green-600" placeholder="আপনার নাম লিখুন" required />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 font-medium">মোবাইল নাম্বার (WhatsApp) *</label>
            <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" className="w-full border p-2.5 rounded focus:outline-none focus:border-green-600" placeholder="01XXXXXXXXX" required />
          </div>

          {/* পিন কোড ফিল্ড */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <label className="block text-green-900 mb-1 font-bold">লগইন পিন কোড (৪ ডিজিট) *</label>
            <input name="pin" value={formData.pin} onChange={handleChange} type="password" maxLength={6} className="w-full border p-2.5 rounded focus:outline-none focus:border-green-600 bg-white tracking-widest text-lg font-bold" placeholder="****" required />
            <span className="text-xs text-green-700 mt-1 block">লগইন করার জন্য এই পিনটি অবশ্যই মনে রাখুন।</span>
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">বর্তমান ঠিকানা *</label>
            <textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:border-green-600" placeholder="আপনার বর্তমান ঠিকানা" rows={2} required></textarea>
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">স্থায়ী ঠিকানা *</label>
            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:border-green-600" placeholder="আপনার স্থায়ী ঠিকানা" rows={2} required></textarea>
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">শিক্ষাগত যোগ্যতা *</label>
            <input name="education" value={formData.education} onChange={handleChange} type="text" className="w-full border p-2.5 rounded focus:outline-none focus:border-green-600" placeholder="যেমন: দাওরায়ে হাদিস / অনার্স" required />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">ইমেইল (ঐচ্ছিক)</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border p-2.5 rounded focus:outline-none focus:border-green-600" placeholder="example@email.com" />
          </div>

          <button type="submit" disabled={loading} className={`w-full text-white py-3 px-4 rounded font-bold mt-4 transition ${loading ? 'bg-gray-400' : 'bg-[#00a651] hover:bg-green-700'}`}>
            {loading ? 'আবেদন জমা হচ্ছে...' : 'নিবন্ধন সম্পন্ন করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}