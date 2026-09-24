'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabase';

export default function AdminDashboard() {
  const [daeeList, setDaeeList] = useState<any[]>([]);
  const [allMadus, setAllMadus] = useState<any[]>([]);
  const [selectedDaeeMadus, setSelectedDaeeMadus] = useState<any[] | null>(null);
  const [selectedDaeeName, setSelectedDaeeName] = useState('');
  const [loading, setLoading] = useState(true);

  // তারিখ ও সময় সুন্দর বাংলায় দেখানোর ফাংশন
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  async function fetchAdminData() {
    setLoading(true);
    
    const { data: daees } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'daee')
      .order('created_at', { ascending: false }); // নতুনরা উপরে থাকবে

    const { data: madus } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'madu')
      .order('created_at', { ascending: false });

    setAllMadus(madus || []);

    if (daees && madus) {
      const daeesWithCount = daees.map((daee) => {
        const count = madus.filter((m) => m.parent_daee_id === daee.user_id).length;
        return { ...daee, madu_count: count };
      });
      setDaeeList(daeesWithCount);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  const viewMadus = (daeeId: string, daeeName: string) => {
    const filtered = allMadus.filter(m => m.parent_daee_id === daeeId);
    setSelectedDaeeMadus(filtered);
    setSelectedDaeeName(daeeName);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* হেডার */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <span className="bg-red-600 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">Super Admin Panel</span>
            <h1 className="text-2xl font-bold mt-2">দাওয়াতুস সুন্নাহ - কেন্দ্রীয় মনিটরিং</h1>
            <p className="text-gray-400 text-sm mt-1">সব দাঈ ও মাদউদের পরিসংখ্যান এবং যোগদানের সময় পর্যবেক্ষণ</p>
          </div>
          <Link href="/">
            <button onClick={handleLogout} className="bg-gray-800 hover:bg-gray-700 text-sm border border-gray-700 px-4 py-2.5 rounded-lg transition font-medium">
              লগআউট
            </button>
          </Link>
        </div>

        {/* সামারি কার্ড */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-600">
            <span className="text-sm font-medium text-gray-500">মোট নিবন্ধিত দাঈ</span>
            <div className="text-3xl font-extrabold text-blue-700 mt-2">{daeeList.length} জন</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-600">
            <span className="text-sm font-medium text-gray-500">মোট মাদউ সংখ্যা</span>
            <div className="text-3xl font-extrabold text-green-700 mt-2">{allMadus.length} জন</div>
          </div>
        </div>

        {/* দাঈদের মনিটরিং টেবিল */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-bold text-gray-800 mb-4">সকল দাঈ ও তাদের বিস্তারিত তথ্য</h2>

          {loading ? (
            <div className="text-center py-10 text-gray-500">তথ্য লোড হচ্ছে...</div>
          ) : daeeList.length === 0 ? (
            <div className="text-center py-10 text-gray-400">কোনো দাঈ পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3">দাঈ আইডি</th>
                    <th className="p-3">নাম</th>
                    <th className="p-3">মোবাইল</th>
                    <th className="p-3">ঠিকানা</th>
                    <th className="p-3">যোগদানের তারিখ ও সময়</th>
                    <th className="p-3 text-center">মাদউ সংখ্যা</th>
                    <th className="p-3 text-center">মাদউদের লিস্ট</th>
                  </tr>
                </thead>
                <tbody>
                  {daeeList.map((daee) => (
                    <tr key={daee.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-bold text-blue-600">{daee.user_id}</td>
                      <td className="p-3 font-semibold text-gray-800">{daee.name}</td>
                      <td className="p-3 text-gray-600">{daee.mobile}</td>
                      <td className="p-3 text-sm text-gray-500">{daee.present_address || '—'}</td>
                      <td className="p-3 text-xs text-gray-500 font-medium">
                        {formatDateTime(daee.created_at)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-sm">
                          {daee.madu_count} জন
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => viewMadus(daee.user_id, daee.name)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-3 py-1.5 rounded-lg border border-blue-200 font-medium transition"
                        >
                          তালিকা দেখুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* মাদউদের বিস্তারিত পপআপ (তারিখ ও সময় সহ) */}
        {selectedDaeeMadus && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {selectedDaeeName}-এর অধীনস্থ মাদউগণ ({selectedDaeeMadus.length} জন)
                </h3>
                <button 
                  onClick={() => setSelectedDaeeMadus(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {selectedDaeeMadus.length === 0 ? (
                <p className="text-gray-500 text-center py-6">এই দাঈর অধীনে এখনো কোনো মাদউ নেই।</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600">
                      <th className="p-2">মাদউ আইডি</th>
                      <th className="p-2">নাম</th>
                      <th className="p-2">মোবাইল</th>
                      <th className="p-2">ঠিকানা</th>
                      <th className="p-2">নিবন্ধনের তারিখ ও সময়</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDaeeMadus.map((m) => (
                      <tr key={m.id} className="border-b">
                        <td className="p-2 font-bold text-green-700">{m.user_id}</td>
                        <td className="p-2 font-medium">{m.name}</td>
                        <td className="p-2 text-gray-600">{m.mobile}</td>
                        <td className="p-2 text-gray-500">{m.present_address || '—'}</td>
                        <td className="p-2 text-xs text-gray-500 font-medium">
                          {formatDateTime(m.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}