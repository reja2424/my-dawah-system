'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabase';

export default function RegisterDaee() {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'পুরুষ', // ডিফল্ট পুরুষ
    mobile: '',
    pin: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    education: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            gender: formData.gender, // জেন্ডার সেভ হচ্ছে
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-amber-500 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner">
            ⏳
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">আবেদন জমা হয়েছে!</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            আলহামদুলিল্লাহ, আপনার দাঈ নিবন্ধন তথ্য সফলভাবে জমা হয়েছে। আপনার কোড বর্তমানে 
            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded ml-1">পর্যালোচনায় (Pending)</span> রয়েছে।
          </p>
          
          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl mb-6 text-xs text-amber-900 text-left space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">📌 করণীয়:</p>
            <p>১. কেন্দ্রীয় সুপার এডমিন আপনার আবেদন যাচাই করে দাঈ কোড অনুমোদন করবেন।</p>
            <p>২. আপনার মোবাইল ও পিন কোড দিয়ে লগইন করে স্ট্যাটাস দেখতে পারবেন।</p>
          </div>

          <Link href="/login">
            <button className="w-full bg-[#00a651] hover:bg-[#008f45] text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-green-600/20">
              লগইন পেজে যান
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-slate-100 py-12 px-4 flex justify-center items-center">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-xl overflow-hidden">
        
        <div className="bg-gradient-to-r from-[#008f45] to-[#00a651] text-white p-8 text-center relative">
          <span className="bg-white/20 backdrop-blur-md text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            দাঈ রেজিস্ট্রেশন
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold">দাওয়াতুস সুন্নাহ</h1>
          <p className="text-green-100 text-xs md:text-sm mt-1">আসসুন্নাহ ফাউন্ডেশনের একটি দাওয়াতি উদ্যোগ</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <span>👤</span> ব্যক্তিগত ও যোগাযোগের তথ্য
            </h3>

            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-1.5">পুরো নাম *</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                type="text" 
                className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm" 
                placeholder="আপনার পুরো নাম লিখুন" 
                required 
              />
            </div>

            {/* জেন্ডার নির্বাচন */}
            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-1.5">লিঙ্গ (Gender) *</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer font-medium text-sm transition ${formData.gender === 'পুরুষ' ? 'border-[#00a651] bg-green-50 text-[#00a651] font-bold' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
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
                <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer font-medium text-sm transition ${formData.gender === 'মহিলা' ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
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
              <label className="block text-gray-700 text-xs font-bold uppercase mb-1.5">মোবাইল নাম্বার (WhatsApp) *</label>
              <input 
                name="mobile" 
                value={formData.mobile} 
                onChange={handleChange} 
                type="tel" 
                className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm font-medium" 
                placeholder="01XXXXXXXXX" 
                required 
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-1.5">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
              <input 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                type="email" 
                className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm" 
                placeholder="example@gmail.com" 
              />
            </div>
          </div>

          <div className="bg-green-50/60 p-5 rounded-2xl border border-green-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-green-950 text-xs font-bold uppercase flex items-center gap-1.5">
                <span>🔒</span> লগইন পিন কোড (৪-৬ ডিজিট) *
              </label>
              <span className="text-[10px] bg-green-200/60 text-green-900 font-bold px-2 py-0.5 rounded">গোপন রাখুন</span>
            </div>
            <input 
              name="pin" 
              value={formData.pin} 
              onChange={handleChange} 
              type="password" 
              maxLength={6} 
              className="w-full border border-green-300 bg-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a651] tracking-widest text-center text-xl font-extrabold" 
              placeholder="••••" 
              required 
            />
            <p className="text-[11px] text-green-800">পরবর্তীতে এই মোবাইল নম্বর ও পিন দিয়েই সিস্টেমে লগইন করতে হবে।</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b pb-2 pt-2">
              <span>📍</span> ঠিকানা ও শিক্ষাগত বিবরণ
            </h3>

            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-1.5">বর্তমান ঠিকানা *</label>
              <textarea 
                name="presentAddress" 
                value={formData.presentAddress} 
                onChange={handleChange} 
                className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm" 
                placeholder="থানা, জেলা ও বর্তমান বসবাসের ঠিকানা" 
                rows={2} 
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-1.5">স্থায়ী ঠিকানা *</label>
              <textarea 
                name="permanentAddress" 
                value={formData.permanentAddress} 
                onChange={handleChange} 
                className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm" 
                placeholder="গ্রাম/মহল্লা, থানা ও স্থায়ী জেলা" 
                rows={2} 
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase mb-1.5">শিক্ষাগত যোগ্যতা *</label>
              <input 
                name="education" 
                value={formData.education} 
                onChange={handleChange} 
                type="text" 
                className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a651] text-sm" 
                placeholder="যেমন: দাওরায়ে হাদিস / অনার্স / কামিল" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider text-white transition duration-200 shadow-xl ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00a651] hover:bg-[#008f45] shadow-green-600/25 active:scale-[0.99]'
            }`}
          >
            {loading ? 'তথ্য যাচাই ও সংরক্ষণ হচ্ছে...' : 'দাঈ হিসেবে আবেদন জমা দিন'}
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-gray-500">ইতিমধ্যে নিবন্ধিত দাঈ? </span>
            <Link href="/login" className="text-xs font-bold text-[#00a651] hover:underline">
              এখানে লগইন করুন
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}