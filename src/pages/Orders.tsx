import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/firebase';

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // الاستماع للطلبات لحظياً من Firebase
    const unsub = onSnapshot(collection(db, 'requests'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // ترتيب من الأحدث للأقدم
      setOrders(data.sort((a: any, b: any) => b.createdAt - a.createdAt));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ✅ الدالة المحدثة: تحديث الحالة + إرسال إشعار للعميل
  const updateStatus = async (id: string, status: string, deviceId: string, reference: string) => {
    try {
      // 1. تحديث حالة الطلب في قاعدة البيانات (Firestore)
      await updateDoc(doc(db, 'requests', id), { status });

      // 2. جلب توكن الجهاز الخاص بالعميل وإرسال الإشعار
      if (deviceId) {
        const userDoc = await getDoc(doc(db, 'users', deviceId));
        if (userDoc.exists()) {
          const token = userDoc.data().fcmToken;
          
          if (token) {
            // ترجمة الحالة إلى نص عربي لكي يظهر في الإشعار
            let statusAr = status;
            if (status === 'review') statusAr = 'قيد المراجعة';
            else if (status === 'completed') statusAr = 'مكتمل';
            else if (status === 'scheduled') statusAr = 'تمت الجدولة';
            else if (status === 'cancelled') statusAr = 'ملغي';
            else if (status === 'submitted') statusAr = 'جديد';

            // إرسال الطلب إلى دالة Supabase
            await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({ 
                token, 
                title: 'تحديث حالة الطلب', 
                body: `طلبك رقم ${reference} أصبح: ${statusAr}` 
              }),
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead className="bg-white/5 text-[#8ea39c] border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-start font-medium">رقم الطلب</th>
              <th className="px-6 py-4 text-start font-medium">العميل</th>
              <th className="px-6 py-4 text-start font-medium">الخدمة</th>
              <th className="px-6 py-4 text-start font-medium">التاريخ</th>
              <th className="px-6 py-4 text-start font-medium">الحالة</th>
              <th className="px-6 py-4 text-start font-medium">تحديث</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-mono text-[#1fa36a]">{o.reference || o.id.slice(0,6)}</td>
                <td className="px-6 py-4 text-white">
                  {o.contact?.name || 'غير معروف'}
                  <br/>
                  <span className="text-xs text-[#8ea39c]">{o.contact?.phone}</span>
                </td>
                <td className="px-6 py-4 text-[#8ea39c]">{o.serviceName || o.serviceId || 'خدمة'}</td>
                <td className="px-6 py-4 text-[#8ea39c]">{new Date(o.createdAt).toLocaleDateString('ar-SA')}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1fa36a]/10 text-[#1fa36a] border border-[#1fa36a]/20">
                    {o.status === 'submitted' ? 'جديد' : o.status === 'review' ? 'قيد المراجعة' : o.status === 'completed' ? 'مكتمل' : o.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={o.status} 
                    // ✅ تمرير deviceId و reference إلى دالة التحديث
                    onChange={(e) => updateStatus(o.id, e.target.value, o.deviceId, o.reference)}
                    className="bg-[#0d1a17] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#1fa36a] cursor-pointer"
                  >
                    <option value="submitted">جديد</option>
                    <option value="review">قيد المراجعة</option>
                    <option value="scheduled">تمت الجدولة</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && !loading && (
        <div className="p-16 text-center text-[#8ea39c]">لا توجد طلبات حالياً</div>
      )}
      {loading && (
        <div className="p-16 text-center text-[#1fa36a] animate-pulse">جاري تحميل الطلبات...</div>
      )}
    </div>
  );
}
