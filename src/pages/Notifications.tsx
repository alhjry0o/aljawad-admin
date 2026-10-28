import { useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/firebase';
import { Send } from 'lucide-react';

export function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    setSending(true);
    try {
      // 1. جلب جميع الأجهزة من قاعدة البيانات (Firestore)
      const querySnapshot = await getDocs(collection(db, 'users'));
      const tokens: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.fcmToken) tokens.push(data.fcmToken);
      });

      // ✅ حفظ الإشعار في قاعدة البيانات ليقرأه التطبيق
      await addDoc(collection(db, 'notifications'), {
        title,
        body,
        screen: 'notifications', // ✅ العلامة الخاصة بالتوجيه
        createdAt: Date.now(),
      });

      if (tokens.length === 0) {
        alert('لا توجد أجهزة مسجلة حالياً. تأكد من فتح التطبيق على الأقل مرة واحدة.');
        setSending(false);
        return;
      }

      // 2. إرسال الإشعار لكل جهاز عبر دالة Supabase
      let successCount = 0;
      for (const token of tokens) {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ token, title, body, screen: 'notifications' }), // ✅ أضفنا التوجيه
        });
        
        if (res.ok) successCount++;
      }

      alert(`تم إرسال الإشعار إلى ${successCount} جهاز بنجاح!`);
      setTitle('');
      setBody('');
    } catch (error: any) {
      console.error(error);
      alert('الخطأ هو: ' + (error.message || String(error)));
    }
    setSending(false);
  };

  return (
    <div className="glass-panel p-8 rounded-2xl max-w-xl">
      <h2 className="text-xl font-bold text-white mb-6">إرسال إشعار جماعي</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[#8ea39c] mb-2">عنوان الإشعار</label>
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#1fa36a]" 
            placeholder="مثال: خصم خاص بمناسبة اليوم الوطني" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm text-[#8ea39c] mb-2">نص الإشعار</label>
          <textarea 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#1fa36a] h-32 resize-none" 
            placeholder="اكتب تفاصيل الإشعار هنا..." 
            value={body} 
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <button 
          onClick={sendNotification} 
          disabled={sending || !title || !body}
          className="flex items-center justify-center gap-2 w-full bg-[#1fa36a] hover:bg-[#1fa36a]/90 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          <Send size={18} />
          {sending ? 'جاري الإرسال...' : 'إرسال الإشعار الآن'}
        </button>
      </div>
    </div>
  );
}
