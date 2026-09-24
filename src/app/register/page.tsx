'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';

export default function RegisterDaee() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    education: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: lastUser, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('role', 'daee')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      let newIdNumber = 1;
      if (lastUser && lastUser.length > 0 && lastUser[0].user_id) {
        newIdNumber = parseInt(lastUser[0].user_id) + 1;
      }
      
      const formattedNewId = String(newIdNumber).padStart(4, '0');

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: formattedNewId,
            name: formData.name,
            role: 'daee',
            parent_daee_id: null,
            mobile: formData.mobile,
            email: formData.email,
            present_address: formData.presentAddress,
            permanent_address: formData.permanentAddress,
            education: formData.education
          }
        ]);

      if (insertError) throw insertError;

      // সরাসরি ড্যাশবোর্ডে রিডাইরেক্ট (ফর্ম আর থাকবে না)
      router.push(`/dashboard?id=${formattedNewId}`);

    } catch (error: any) {
      console.error(error);
      alert('সমস্যা হয়েছে: ' + (error?.message || 'আবার চেষ্টা করুন'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">দাঈ নিবন্ধন ফর্ম</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">পুরো নাম</label>
            <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="আপনার নাম লিখুন" required />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">মোবাইল নাম্বার (WhatsApp)</label>
            <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="01XXXXXXXXX" required />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">ইমেইল (যদি থাকে)</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="example@email.com" />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">বর্তমান ঠিকানা</label>
            <textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="আপনার বর্তমান ঠিকানা" rows={2}></textarea>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">স্থায়ী ঠিকানা</label>
            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="আপনার স্থায়ী ঠিকানা" rows={2}></textarea>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">শিক্ষাগত যোগ্যতা</label>
            <input name="education" value={formData.education} onChange={handleChange} type="text" className="w-full border p-2.5 rounded focus:outline-none focus:border-gray-400" placeholder="যেমন: দাওরায়ে হাদিস / অনার্স" />
          </div>

          <button type="submit" disabled={loading} className={`w-full text-white py-3 px-4 rounded font-bold mt-2 transition ${loading ? 'bg-gray-400' : 'bg-[#00a651] hover:bg-green-700'}`}>
            {loading ? 'অপেক্ষা করুন, ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...' : 'নিবন্ধন সম্পন্ন করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}