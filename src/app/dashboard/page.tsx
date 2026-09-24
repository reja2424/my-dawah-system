'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase';

function DashboardContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [madus, setMadus] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const sessionStr = localStorage.getItem('user_session');
    if (!sessionStr) {
      router.push('/login');
      return;
    }

    const currentUser = JSON.parse(sessionStr);

    async function loadData() {
      setLoading(true);
      // মোবাইল নাম্বার অনুযায়ী দাঈর প্রোফাইল লোড করা
      const { data: daeeData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (daeeData) {
        setProfile(daeeData);

        // যদি কোড অনুমোদিত থাকে তবেই মাদউ লোড হবে
        if (daeeData.user_id !== 'Pending') {
          const { data: maduList } = await supabase
            .from('profiles')
            .select('*')
            .eq('parent_daee_id', daeeData.user_id)
            .eq('role', 'madu')
            .order('created_at', { ascending: false });
          if (maduList) setMadus(maduList);
        }
      }
      setLoading(false);
    }

    loadData();
  }, [router]);

  const daeeId = profile?.user_id;
  const isPending = daeeId === 'Pending';
  const referralLink = typeof window !== 'undefined' && !isPending ? `${window.location.origin}/madu-register?daee=${daeeId}` : '';

  const copyLink = () => {
    if (isPending) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* হেডার */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-green-600 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">দাঈ ড্যাশবোর্ড</h1>
            <p className="text-gray-600 mt-1">স্বাগতম, <span className="font-semibold text-green-700">{profile?.name || 'দাঈ সাহেব'}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`border px-4 py-2 rounded-lg text-center ${isPending ? 'bg-amber-50 border-amber-300' : 'bg-green-50 border-green-200'}`}>
              <span className="text-xs text-gray-500 font-medium">দাঈ কোড</span>
              <div className={`text-xl font-bold ${isPending ? 'text-amber-700' : 'text-green-700'}`}>
                {isPending ? 'Pending' : daeeId}
              </div>
            </div>
            
            <Link href="/">
              <button onClick={handleLogout} title="লগআউট করুন" className="text-sm bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 transition font-medium">
                লগআউট
              </button>
            </Link>
          </div>
        </div>

        {/* যদি কোড Pending থাকে তাহলে এই সতর্কবার্তা দেখাবে */}
        {isPending && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏳</span>
              <div>
                <h3 className="font-bold text-amber-800">আপনার দাঈ কোড পর্যালোচনায় রয়েছে (Pending)</h3>
                <p className="text-sm text-amber-700 mt-0.5">
                  কেন্দ্রীয় সুপার এডমিন আপনার আবেদন যাচাই করে দাঈ কোড অনুমোদন করবেন। অনুমোদন সম্পন্ন হলে আপনি মাদউদের দাওয়াত দেওয়ার লিংক পাবেন।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* রেফারেল লিংক */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-bold text-gray-800 mb-2">মাদউদের রেজিস্ট্রেশন লিংক</h2>
          {isPending ? (
            <p className="text-sm text-gray-400 py-3 italic">
              (দাঈ কোড অনুমোদিত হওয়ার পর এখানে আপনার লিংকটি সক্রিয় হবে)
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">এই লিংকটি আপনার মাদউকে WhatsApp বা মেসেজে পাঠান।</p>
              <div className="flex gap-2">
                <input type="text" readOnly value={referralLink} className="w-full bg-gray-50 border p-2.5 rounded text-gray-600 text-sm focus:outline-none" />
                <button onClick={copyLink} className="bg-green-600 text-white px-5 py-2.5 rounded font-medium hover:bg-green-700 transition">
                  {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* মাদউদের তালিকা */}
        {!isPending && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                আমার অধীনস্থ মাদউগণ ({madus.length} জন)
              </h2>
              <Link href={`/madu-register?daee=${daeeId}&from=dashboard`}>
                <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition font-medium">
                  + নতুন মাদউ যুক্ত করুন
                </button>
              </Link>
            </div>

            {madus.length === 0 ? (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-lg">
                এখনো কোনো মাদউ যুক্ত হয়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                      <th className="p-3">মাদউ আইডি</th>
                      <th className="p-3">নাম</th>
                      <th className="p-3">মোবাইল</th>
                      <th className="p-3">তারিখ ও সময়</th>
                      <th className="p-3 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {madus.map((madu) => (
                      <tr key={madu.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold text-green-700">{madu.user_id}</td>
                        <td className="p-3 font-medium text-gray-800">{madu.name}</td>
                        <td className="p-3 text-gray-600">{madu.mobile}</td>
                        <td className="p-3 text-xs text-gray-500 font-medium">
                          {formatDateTime(m.created_at)}
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                            সক্রিয়
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function DaeeDashboard() {
  return (
    <Suspense fallback={<div className="text-center p-10">লোড হচ্ছে...</div>}>
      <DashboardContent />
    </Suspense>
  );
}