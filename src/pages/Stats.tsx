import { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, Activity, ShoppingBag, CheckCircle } from 'lucide-react';

export function Stats() {
  const [data, setData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. إجمالي المستخدمين (المسجلين في تطبيق الجوال)
        const usersColl = collection(db, 'users');
        const usersSnapshot = await getCountFromServer(usersColl);
        
        // 2. المستخدمين النشطين (الذين فتحوا التطبيق خلال آخر 7 أيام)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const activeUsersQuery = query(usersColl, where('updatedAt', '>=', sevenDaysAgo));
        const activeUsersSnapshot = await getCountFromServer(activeUsersQuery);

        // 3. إجمالي الطلبات
        const ordersColl = collection(db, 'requests');
        const ordersSnapshot = await getCountFromServer(ordersColl);

        // 4. الطلبات المكتملة
        const completedOrdersQuery = query(ordersColl, where('status', '==', 'completed'));
        const completedOrdersSnapshot = await getCountFromServer(completedOrdersQuery);

        setData({
          totalUsers: usersSnapshot.data().count,
          activeUsers: activeUsersSnapshot.data().count,
          totalOrders: ordersSnapshot.data().count,
          completedOrders: completedOrdersSnapshot.data().count,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center text-[#1fa36a] animate-pulse p-10">جاري تحميل الإحصائيات...</div>;
  }

  const cards = [
    {
      title: 'إجمالي المستخدمين',
      value: data.totalUsers,
      icon: Users,
      color: '#1fa36a', // أخضر
    },
    {
      title: 'نشطون (آخر 7 أيام)',
      value: data.activeUsers,
      icon: Activity,
      color: '#3b82f6', // أزرق
    },
    {
      title: 'إجمالي الطلبات',
      value: data.totalOrders,
      icon: ShoppingBag,
      color: '#f59e0b', // برتقالي
    },
    {
      title: 'طلبات مكتملة',
      value: data.completedOrders,
      icon: CheckCircle,
      color: '#8b5cf6', // بنفسجي
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div 
                className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-10 blur-3xl" 
                style={{ backgroundColor: card.color }}
              ></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <p className="text-[#8ea39c] text-sm font-medium">{card.title}</p>
                <Icon size={24} style={{ color: card.color }} />
              </div>
              <h2 className="text-4xl font-bold text-white relative z-10">{card.value}</h2>
            </div>
          );
        })}
      </div>
    </div>
  );
}
