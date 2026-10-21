import { useState } from 'react';
import { LayoutDashboard, ShoppingBag, LogOut, Bell } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Notifications } from './pages/Notifications'; // ✅ استيراد صفحة الإشعارات

export default function App() {
  // ✅ إضافة 'notifications' إلى الحالات المتاحة
  const [tab, setTab] = useState<'dashboard' | 'orders' | 'notifications'>('dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-[#030605]">
      {/* Sidebar */}
      <aside className="w-64 border-l border-white/10 bg-[#09110f] p-5 flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-full bg-[#1fa36a]/20 border border-[#1fa36a]/50 flex items-center justify-center">
            <span className="text-[#1fa36a] font-bold text-xl">ج</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">الجواد</h1>
            <p className="text-[#8ea39c] text-xs">لوحة التحكم</p>
          </div>
        </div>

        <button onClick={() => setTab('dashboard')} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${tab === 'dashboard' ? 'bg-[#1fa36a]/10 text-[#1fa36a] border border-[#1fa36a]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <LayoutDashboard size={20} /> الرئيسية
        </button>
        
        <button onClick={() => setTab('orders')} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${tab === 'orders' ? 'bg-[#1fa36a]/10 text-[#1fa36a] border border-[#1fa36a]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <ShoppingBag size={20} /> إدارة الطلبات
        </button>

        {/* ✅ زر الإشعارات الجديد */}
        <button onClick={() => setTab('notifications')} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${tab === 'notifications' ? 'bg-[#1fa36a]/10 text-[#1fa36a] border border-[#1fa36a]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Bell size={20} /> الإشعارات
        </button>

        <div className="mt-auto">
          <button className="flex items-center gap-3 p-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut size={20} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            {tab === 'dashboard' ? 'نظرة عامة' : tab === 'orders' ? 'إدارة الطلبات' : 'مركز الإشعارات'}
          </h2>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#1fa36a] animate-pulse"></div>
             <span className="text-sm text-[#8ea39c]">متصل مباشرة</span>
          </div>
        </header>
        
        {/* ✅ عرض صفحة الإشعارات */}
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'orders' && <Orders />}
        {tab === 'notifications' && <Notifications />}
      </main>
    </div>
  );
}
