import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center border-t-4 border-green-600">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">দাওয়াতুস সুন্নাহ</h1>
        <p className="text-gray-600 mb-8 font-medium">আসসুন্নাহ ফাউন্ডেশনের একটি দাওয়াতি উদ্যোগ</p>
        
        <div className="space-y-4">
          {/* লগইন বাটনে লিংক যুক্ত করা হলো */}
          <Link href="/login" className="w-full block">
            <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition duration-200">
              লগইন করুন
            </button>
          </Link>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">অথবা</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <Link href="/register" className="w-full block">
            <button className="w-full border-2 border-green-600 text-green-600 py-3 px-4 rounded-lg font-medium hover:bg-green-50 transition duration-200">
              নতুন দাঈ নিবন্ধন
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}