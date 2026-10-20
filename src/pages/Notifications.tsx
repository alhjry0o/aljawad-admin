import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../lib/firebase'; // تأكد من تصدير app

const functions = getFunctions(app);

export function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    setSending(true);
    try {
      const sendBroadcast = httpsCallable(functions, 'sendBroadcast');
      await sendBroadcast({ title, body });
      alert('تم إرسال الإشعار بنجاح!');
      setTitle('');
      setBody('');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الإرسال');
    }
    setSending(false);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl max-w-lg">
      <h2 className="text-xl font-bold text-white mb-4">إرسال إشعار جماعي</h2>
      <input 
        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-3" 
        placeholder="عنوان الإشعار" 
        value={title} onChange={(e) => setTitle(e.target.value)}
      />
      <textarea 
        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-3" 
        placeholder="نص الإشعار" 
        value={body} onChange={(e) => setBody(e.target.value)}
      />
      <button 
        onClick={sendNotification} disabled={sending || !title || !body}
        className="bg-[#1fa36a] text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
      >
        {sending ? 'جاري الإرسال...' : 'إرسال'}
      </button>
    </div>
  );
}
