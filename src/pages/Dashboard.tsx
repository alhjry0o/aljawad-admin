import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ShoppingBag, Activity, Users } from 'lucide-react';

const data = [
  { name: 'السبت', value: 12 }, { name: 'الأحد', value: 19 },
  { name: 'الاثنين', value: 15 }, { name: 'الثلاثاء', value: 28 },
  { name: 'الأربعاء', value: 22 }, { name: 'الخميس', value: 35 }, { name: 'الجمعة', value: 45 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-2xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#1fa36a] rounded-full opacity-10 blur-3xl"></div>
          <div>
            <p className="text-[#8ea39c] text-sm">إجمالي الطلبات</p>
            <h2 className="text-3xl font-bold text-white mt-1">145</h2>
          </div>
          <ShoppingBag size={32} className="text-[#1fa36a]" />
        </div>
        <div className="glass-panel p-6 rounded-2xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
          <div>
            <p className="text-[#8ea39c] text-sm">طلبات نشطة</p>
            <h2 className="text-3xl font-bold text-white mt-1">12</h2>
          </div>
          <Activity size={32} className="text-blue-400" />
        </div>
        <div className="glass-panel p-6 rounded-2xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
          <div>
            <p className="text-[#8ea39c] text-sm">الموظفون</p>
            <h2 className="text-3xl font-bold text-white mt-1">8</h2>
          </div>
          <Users size={32} className="text-purple-400" />
        </div>
      </div>
      
      {/* Chart */}
      <div className="glass-panel p-6 rounded-2xl h-[400px]">
        <h2 className="text-lg font-bold text-white mb-6">حركة الطلبات (آخر 7 أيام)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1fa36a" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1fa36a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#8ea39c" tick={{ fill: '#8ea39c' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0d1a17', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#1fa36a' }}
            />
            <Area type="monotone" dataKey="value" stroke="#1fa36a" fill="url(#colorVal)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
