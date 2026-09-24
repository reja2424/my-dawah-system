'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabase';

export default function RegisterDaee() {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'পুরুষ',
    mobile: '',
    pin: '', // পাসওয়ার্ড
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
      alert('পাসওয়ার্ড কমপক্ষে ৪ ডিজিটের হতে হবে!');
      return;
    }

    setLoading(true);

    try {
      // ১. মোবাইল নাম্বার ডুপ্লিকেট কিনা যাচাই
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('mobile', formData.mobile.trim())
        .maybeSingle();

      if (existingUser) {
        alert('এই মোবাইল নাম্বারে ইতিমধ্যে একটি একাউন্ট রয়েছে! দয়া করে লগইন করুন।');
        setLoading(false);
        return;
      }

      // ২. নতুন দাঈর আবেদন জমা
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: 'Pending',
            name: formData.name.trim(),
            gender: formData.gender,
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
        <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-amber-500 text-center max-w-sm w-full">
          <div className="text-3xl mb-2">⏳</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">আবেদন জমা হয়েছে!</h2>
          <p className="text-gray-600 text-xs mb-4">
            আপনার দাঈ কোড বর্তমানে <span className="font-bold text-amber-600">Pending</span> রয়েছে। সুপার এডমিন যাচাই করে অনুমোদন করবেন।
          </p>
          <Link href="/login">
            <button className="w-full bg-[#00a651] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
              লগইন পেজে যান
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-3 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 w-full max-w-lg overflow-hidden">
        
        <div className="bg-[#008f45] text-white py-4 px-5 text-center">
          <h1 className="text-xl font-bold tracking-wide">দাওয়াতুস সুন্নাহ</h1>
          <p className="text-sm font-semibold text-green-100 mt-0.5">দাঈ রেজিস্ট্রেশন</p>
          <p className="text-[11px] text-green-200 mt-0.5">আসসুন্নাহ ফাউন্ডেশনের একটি দাওয়াতি উদ্যোগ</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">পুরো নাম *</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              type="text" 
              className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" 
              placeholder="আপনার পুরো নাম লিখুন" 
              required 
            />
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
            <input 
              name="mobile" 
              value={formData.mobile} 
              onChange={handleChange} 
              type="tel" 
              className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" 
              placeholder="01XXXXXXXXX" 
              required 
            />
          </div>

          {/* পাসওয়ার্ড ফিল্ড */}
          <div className="bg-green-50/70 p-3 rounded-xl border border-green-200">
            <div className="flex justify-between items-center mb-1">
              <label className="text-green-950 text-xs font-bold">লগইন পাসওয়ার্ড (কমপক্ষে ৪ সংখ্যা) *</label>
              <span className="text-[10px] text-green-700 font-medium">(লগইনে লাগবে)</span>
            </div>
            <input 
              name="pin" 
              value={formData.pin} 
              onChange={handleChange} 
              type="password" 
              maxLength={10} 
              className="w-full border border-green-300 bg-white p-2 rounded-lg text-center font-bold tracking-widest text-base focus:outline-none focus:ring-1 focus:ring-[#00a651]" 
              placeholder="••••" 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">বর্তমান ঠিকানা *</label>
            <textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="বর্তমান ঠিকানা" rows={1} required></textarea>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">স্থায়ী ঠিকানা *</label>
            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="স্থায়ী ঠিকানা" rows={1} required></textarea>
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1">শিক্ষাগত যোগ্যতা *</label>
            <input name="education" value={formData.education} onChange={handleChange} type="text" className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="যেমন: দাওরায়ে হাদিস / অনার্স" required />
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-[#00a651]" placeholder="example@gmail.com" />
          </div>

          <button type="submit" disabled={loading} className={`w-full py-2.5 rounded-lg font-bold text-sm text-white transition ${loading ? 'bg-gray-400' : 'bg-[#00a651] hover:bg-green-700 shadow'}`}>
            {loading ? 'যাচাই করা হচ্ছে...' : 'নিবন্ধন সম্পন্ন করুন'}
          </button>

          <div className="text-center pt-1">
            <Link href="/login" className="text-xs text-gray-500 hover:text-green-700">
              ইতিমধ্যে নিবন্ধিত? <span className="font-bold text-[#00a651]">লগইন করুন</span>
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}