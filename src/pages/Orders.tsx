import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/firebase';
import { X, MapPin, Clock, Calendar, User, Phone, FileText, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'requests'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data.sort((a: any, b: any) => b.createdAt - a.createdAt));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: string, deviceId: string, reference: string) => {
    try {
      await updateDoc(doc(db, 'requests', id), { status });
      
      // تحديث الطلب المفتوح حالياً في النافذة
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }

      if (deviceId) {
        const userDoc = await getDoc(doc(db, 'users', deviceId));
        if (userDoc.exists()) {
          const token = userDoc.data().fcmToken;
          if (token) {
            let statusAr = status;
            if (status === 'review') statusAr = 'قيد المراجعة';
            else if (status === 'completed') statusAr = 'مكتمل';
            else if (status === 'scheduled') statusAr = 'تمت الجدولة';
            else if (status === 'cancelled') statusAr = 'ملغي';
            else if (status === 'submitted') statusAr = 'جديد';

            await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
              body: JSON.stringify({ 
                token, 
                title: 'تحديث حالة الطلب', 
                body: `طلبك رقم ${reference} أصبح: ${statusAr}`,
                screen: 'requests' // ✅ أضفنا التوجيه
              }),
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'review': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'جديد';
      case 'review': return 'قيد المراجعة';
      case 'scheduled': return 'تمت الجدولة';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (loading) return <div className="p-10 text-center text-[#1fa36a] animate-pulse">جاري تحميل الطلبات...</div>;

  return (
    <div className="space-y-4">
      {/* قائمة الطلبات (بطاقات زجاجية) */}
      {orders.length === 0 ? (
        <div className="p-16 text-center text-[#8ea39c] glass-panel rounded-2xl">لا توجد طلبات حالياً</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((o) => (
            <div 
              key={o.id} 
              onClick={() => setSelectedOrder(o)}
              className="glass-panel p-5 rounded-2xl cursor-pointer hover:bg-white/[0.05] transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1fa36a] rounded-full opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
              
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-sm font-bold text-[#1fa36a]">{o.reference}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(o.status)}`}>
                  {getStatusText(o.status)}
                </span>
              </div>

              <h3 className="text-white font-bold text-lg mb-1">{o.serviceName}</h3>
              <p className="text-[#8ea39c] text-sm mb-4 flex items-center gap-2">
                <User size={14} /> {o.contact?.name}
              </p>

              <div className="flex items-center justify-between text-xs text-[#8ea39c] border-t border-white/10 pt-3">
                <span className="flex items-center gap-1"><MapPin size={12} /> {o.location?.city || 'غير محدد'}</span>
                <span>{new Date(o.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* النافذة المنبثقة لتفاصيل الطلب */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl p-6 shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">تفاصيل الطلب</h2>
                <span className="font-mono text-[#1fa36a]">{selectedOrder.reference}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* الخدمة والعميل */}
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <h4 className="text-[#8ea39c] text-xs mb-1">الخدمة المطلوبة</h4>
                  <p className="text-white font-semibold">{selectedOrder.serviceName}</p>
                  <p className="text-[#8ea39c] text-xs mt-1">نوع الموقع: {selectedOrder.propertyType || 'غير محدد'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl space-y-2">
                  <h4 className="text-[#8ea39c] text-xs">بيانات العميل</h4>
                  <p className="text-white flex items-center gap-2"><User size={16} className="text-[#1fa36a]"/> {selectedOrder.contact?.name}</p>
                  <p className="text-white flex items-center gap-2" dir="ltr"><Phone size={16} className="text-[#1fa36a]"/> {selectedOrder.contact?.phone}</p>
                </div>
              </div>

              {/* الموقع والموعد */}
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl space-y-2">
                  <h4 className="text-[#8ea39c] text-xs">الموقع</h4>
                  <p className="text-white flex items-start gap-2"><MapPin size={16} className="text-[#1fa36a] shrink-0 mt-0.5"/> 
                    {selectedOrder.location?.city} - {selectedOrder.location?.district} - {selectedOrder.location?.address}
                  </p>
                  {selectedOrder.location?.extra && (
                    <p className="text-[#8ea39c] text-sm bg-black/20 p-2 rounded-lg mt-2">{selectedOrder.location.extra}</p>
                  )}
                </div>
                {selectedOrder.schedule && (
                  <div className="bg-white/5 p-4 rounded-xl space-y-2">
                    <h4 className="text-[#8ea39c] text-xs">الموعد</h4>
                    <p className="text-white flex items-center gap-2"><Calendar size={16} className="text-[#1fa36a]"/> {selectedOrder.schedule.date}</p>
                    {selectedOrder.schedule.time && (
                      <p className="text-white flex items-center gap-2"><Clock size={16} className="text-[#1fa36a]"/> {selectedOrder.schedule.time}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ملاحظات وصور */}
            <div className="mt-6 space-y-4">
              {selectedOrder.notes && (
                <div className="bg-white/5 p-4 rounded-xl">
                  <h4 className="text-[#8ea39c] text-xs mb-2 flex items-center gap-2"><FileText size={14}/> تفاصيل الطلب</h4>
                  <p className="text-white text-sm leading-relaxed">{selectedOrder.notes}</p>
                </div>
              )}
              
              {selectedOrder.photos && selectedOrder.photos.length > 0 && (
                <div className="bg-white/5 p-4 rounded-xl">
                  <h4 className="text-[#8ea39c] text-xs mb-3 flex items-center gap-2"><ImageIcon size={14}/> الصور المرفقة ({selectedOrder.photos.length})</h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedOrder.photos.map((photo: string, i: number) => (
                      <img key={i} src={photo} alt={`صورة ${i}`} className="h-24 w-24 object-cover rounded-lg border border-white/10 shrink-0" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* تحديث الحالة */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-[#8ea39c]">
                <CheckCircle2 size={16} className="text-[#1fa36a]"/> تحديث حالة الطلب:
              </div>
              <select 
                value={selectedOrder.status} 
                onChange={(e) => updateStatus(selectedOrder.id, e.target.value, selectedOrder.deviceId, selectedOrder.reference)}
                className="w-full sm:w-auto bg-[#0d1a17] border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-[#1fa36a] cursor-pointer font-semibold"
              >
                <option value="submitted">جديد</option>
                <option value="review">قيد المراجعة</option>
                <option value="scheduled">تمت الجدولة</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
