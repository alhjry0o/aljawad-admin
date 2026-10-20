const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// دالة تراقب تغيير حالة الطلب
exports.onRequestStatusChange = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // إذا لم تتغير الحالة، لا تفعل شيئاً
    if (before.status === after.status) return null;

    // البحث عن المستخدم المرتبط بالطلب (يمكنك تخزين userId داخل الطلب)
    // هنا سنفترض أن لدينا جهاز واحد، أو نستخدم topic
    // للحل السريع، سنرسل إشعاراً عاماً للجميع (أو للتوكن المحفوظ)
    
    const fcmToken = after.fcmToken; // إذا خزنت التوكن داخل الطلب
    // إذا لم يكن هناك توكن، سنرسل للجميع عبر topic (يتطلب اشتراك العميل)
    const topic = 'all-users'; 

    const message = {
      notification: {
        title: 'تحديث حالة الطلب',
        body: `طلبك رقم ${after.reference} أصبح: ${after.status}`,
      },
      data: {
        requestId: context.params.requestId,
        screen: 'request',
      },
      topic: topic, // أو token: fcmToken
    };

    try {
      await admin.messaging().send(message);
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });

// دالة لإرسال إشعار جماعي من لوحة التحكم
exports.sendBroadcast = functions.https.onCall(async (data, context) => {
  const { title, body } = data;
  const message = {
    notification: { title, body },
    topic: 'all-users',
  };
  await admin.messaging().send(message);
  return { success: true };
});
