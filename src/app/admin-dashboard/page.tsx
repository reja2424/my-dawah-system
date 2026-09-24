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

  const [daeeGenderFilter, setDaeeGenderFilter] = useState('all');
  const [maduGenderFilter, setMaduGenderFilter] = useState('all');

  const [editingDaee, setEditingDaee] = useState<any | null>(null);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [updating, setUpdating] = useState(false);

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
      .order('created_at', { ascending: false });

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

  const handleSaveDaeeCode = async () => {
    if (!newCodeInput.trim()) {
      alert('সঠিক কোড নম্বর দিন!');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_id: newCodeInput.trim() })
        .eq('id', editingDaee.id);

      if (error) throw error;

      alert(`দাঈ কোড "${newCodeInput.trim()}" নির্ধারিত হয়েছে!`);
      setEditingDaee(null);
      setNewCodeInput('');
      fetchAdminData();
    } catch (err: any) {
      alert('কোড আপডেটে সমস্যা: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // দাঈর তথ্য মুছে ফেলার ফাংশন
  const handleDeleteDaee = async (daeeId: string, daeeName: string, userId: string) => {
    const isConfirm = window.confirm(`আপনি কি নিশ্চিতভাবে দাঈ "${daeeName}"-এর সমস্ত তথ্য মুছে ফেলতে চান?`);
    if (!isConfirm) return;

    try {
      // দাঈ মুছে ফেলা
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', daeeId);

      if (error) throw error;

      // যদি তার অধীনে কোনো মাদউ থাকে তবে তাদেরও মুছে দেওয়া
      if (userId && userId !== 'Pending') {
        await supabase.from('profiles').delete().eq('parent_daee_id', userId);
      }

      alert('দাঈর তথ্য সফলভাবে মুছে ফেলা হয়েছে!');
      fetchAdminData(); // ডাটা রিফ্রেশ
    } catch (err: any) {
      alert('মুছে ফেলতে সমস্যা হয়েছে: ' + err.message);
    }
  };

  const viewMadus = (daeeId: string, daeeName: string) => {
    const filtered = allMadus.filter(m => m.parent_daee_id === daeeId);
    setSelectedDaeeMadus(filtered);
    setSelectedDaeeName(daeeName);
    setMaduGenderFilter('all');
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
  };

  const filteredDaees = daeeList.filter((daee) => {
    if (daeeGenderFilter === 'all') return true;
    return (daee.gender || 'পুরুষ') === daeeGenderFilter;
  });

  const filteredMadusInModal = selectedDaeeMadus?.filter((madu) => {
    if (maduGenderFilter === 'all') return true;
    return (madu.gender || 'পুরুষ') === maduGenderFilter;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* হেডার */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <span className="bg-red-600 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">Super Admin Panel</span>
            <h1 className="text-2xl font-bold mt-2">দাওয়াতুস সুন্নাহ - কেন্দ্রীয় মনিটরিং</h1>
            <p className="text-gray-400 text-sm mt-1">দাঈ কোড অনুমোদন, মুছে ফেলা ও পরিসংখ্যান</p>
          </div>
          <Link href="/">
            <button onClick={handleLogout} className="bg-gray-800 hover:bg-gray-700 text-sm border border-gray-700 px-4 py-2.5 rounded-lg transition font-medium">
              লগআউট
            </button>
          </Link>
        </div>

        {/* সামারি কার্ড */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-l-4 border-l-blue-600">
            <span className="text-xs font-semibold text-gray-500 uppercase">মোট দাঈ</span>
            <div className="text-2xl font-extrabold text-blue-700 mt-1">{daeeList.length} জন</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-l-4 border-l-green-600">
            <span className="text-xs font-semibold text-gray-500 uppercase">মোট মাদউ</span>
            <div className="text-2xl font-extrabold text-green-700 mt-1">{allMadus.length} জন</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-l-4 border-l-indigo-600">
            <span className="text-xs font-semibold text-gray-500 uppercase">👨 পুরুষ দাঈ</span>
            <div className="text-2xl font-extrabold text-indigo-700 mt-1">
              {daeeList.filter(d => (d.gender || 'পুরুষ') === 'পুরুষ').length} জন
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-l-4 border-l-pink-600">
            <span className="text-xs font-semibold text-gray-500 uppercase">🧕 মহিলা দাঈ</span>
            <div className="text-2xl font-extrabold text-pink-700 mt-1">
              {daeeList.filter(d => d.gender === 'মহিলা').length} জন
            </div>
          </div>
        </div>

        {/* দাঈদের টেবিল */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b pb-4">
            <h2 className="text-lg font-bold text-gray-800">
              দাঈদের তালিকা ({filteredDaees.length} জন)
            </h2>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setDaeeGenderFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${daeeGenderFilter === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                সবাই ({daeeList.length})
              </button>
              <button onClick={() => setDaeeGenderFilter('পুরুষ')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${daeeGenderFilter === 'পুরুষ' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'}`}>
                👨 পুরুষ ({daeeList.filter(d => (d.gender || 'পুরুষ') === 'পুরুষ').length})
              </button>
              <button onClick={() => setDaeeGenderFilter('মহিলা')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${daeeGenderFilter === 'মহিলা' ? 'bg-pink-600 text-white shadow-sm' : 'text-gray-500'}`}>
                🧕 মহিলা ({daeeList.filter(d => d.gender === 'মহিলা').length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">তথ্য লোড হচ্ছে...</div>
          ) : filteredDaees.length === 0 ? (
            <div className="text-center py-10 text-gray-400">কোনো দাঈ পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600 text-xs uppercase">
                    <th className="p-3">দাঈ কোড</th>
                    <th className="p-3">নাম ও লিঙ্গ</th>
                    <th className="p-3">মোবাইল</th>
                    <th className="p-3">ঠিকানা ও শিক্ষা</th>
                    <th className="p-3">তারিখ ও সময়</th>
                    <th className="p-3 text-center">মাদউ</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDaees.map((daee) => (
                    <tr key={daee.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {daee.user_id === 'Pending' ? (
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                            Pending
                          </span>
                        ) : (
                          <span className="font-bold text-blue-700 text-base">{daee.user_id}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-800">{daee.name}</div>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${daee.gender === 'মহিলা' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                          {daee.gender === 'মহিলা' ? '🧕 মহিলা' : '👨 পুরুষ'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 font-mono text-sm">{daee.mobile}</td>
                      <td className="p-3 text-xs text-gray-500">
                        <div>{daee.present_address}</div>
                        <div className="text-green-700 font-medium">{daee.education}</div>
                      </td>
                      <td className="p-3 text-xs text-gray-500 font-medium">
                        {formatDateTime(daee.created_at)}
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => viewMadus(daee.user_id, daee.name)}
                          className="bg-green-50 text-green-700 hover:bg-green-100 text-xs px-3 py-1 rounded-full font-bold border border-green-200"
                        >
                          {daee.madu_count} জন
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* কোড বসানো বাটন */}
                          <button 
                            onClick={() => {
                              setEditingDaee(daee);
                              setNewCodeInput(daee.user_id === 'Pending' ? '' : daee.user_id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1.5 rounded-md font-medium transition shadow-sm"
                          >
                            {daee.user_id === 'Pending' ? 'কোড বসান' : 'এডিট'}
                          </button>

                          {/* ডিলিট বাটন */}
                          <button 
                            onClick={() => handleDeleteDaee(daee.id, daee.name, daee.user_id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs px-2.5 py-1.5 rounded-md font-medium transition"
                            title="মুছে ফেলুন"
                          >
                            মুছুন
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* কোড নির্ধারণ পপআপ */}
        {editingDaee && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-1">দাঈ কোড নির্ধারণ করুন</h3>
              <p className="text-sm text-gray-500 mb-4">দাঈ: <span className="font-semibold text-gray-800">{editingDaee.name}</span></p>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">দাঈ কোড (যেমন: 0001)</label>
                <input 
                  type="text" 
                  value={newCodeInput} 
                  onChange={(e) => setNewCodeInput(e.target.value)}
                  placeholder="যেমন: 0001"
                  className="w-full border border-gray-300 p-2.5 rounded-lg font-bold text-gray-800 focus:outline-none focus:border-blue-600"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingDaee(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  বাতিল
                </button>
                <button onClick={handleSaveDaeeCode} disabled={updating} className="px-5 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  {updating ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* মাদউদের বিস্তারিত পপআপ */}
        {selectedDaeeMadus && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
              
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedDaeeName}-এর অধীনস্থ মাদউগণ
                  </h3>
                  <p className="text-xs text-gray-500">মোট মাদউ: {selectedDaeeMadus.length} জন</p>
                </div>
                <button onClick={() => setSelectedDaeeMadus(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
                <button onClick={() => setMaduGenderFilter('all')} className={`px-3 py-1 rounded-md text-xs font-bold ${maduGenderFilter === 'all' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'}`}>
                  সবাই
                </button>
                <button onClick={() => setMaduGenderFilter('পুরুষ')} className={`px-3 py-1 rounded-md text-xs font-bold ${maduGenderFilter === 'পুরুষ' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
                  👨 পুরুষ
                </button>
                <button onClick={() => setMaduGenderFilter('মহিলা')} className={`px-3 py-1 rounded-md text-xs font-bold ${maduGenderFilter === 'মহিলা' ? 'bg-pink-600 text-white' : 'text-gray-500'}`}>
                  🧕 মহিলা
                </button>
              </div>

              {(!filteredMadusInModal || filteredMadusInModal.length === 0) ? (
                <p className="text-gray-500 text-center py-6">এই ফিল্টারে কোনো মাদউ নেই।</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600 text-xs uppercase">
                      <th className="p-2">মাদউ আইডি</th>
                      <th className="p-2">নাম ও লিঙ্গ</th>
                      <th className="p-2">মোবাইল</th>
                      <th className="p-2">পেশা ও শিক্ষা</th>
                      <th className="p-2">তারিখ ও সময়</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMadusInModal.map((m) => (
                      <tr key={m.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-bold text-green-700">{m.user_id}</td>
                        <td className="p-2">
                          <span className="font-medium">{m.name}</span>
                          <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${m.gender === 'মহিলা' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                            {m.gender === 'মহিলা' ? 'মহিলা' : 'পুরুষ'}
                          </span>
                        </td>
                        <td className="p-2 text-gray-600">{m.mobile}</td>
                        <td className="p-2 text-xs text-gray-500">
                          <div>{m.profession || '—'}</div>
                          <div className="text-green-700">{m.education || '—'}</div>
                        </td>
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