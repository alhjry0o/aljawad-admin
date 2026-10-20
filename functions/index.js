const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// دالة 1: إرسال إشعار للعميل عند تغيير حالة الطلب من لوحة التحكم
exports.onRequestStatusChange = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === after.status) return null;

    const deviceId = after.deviceId;
    if (!deviceId) return null; // لا يوجد جهاز مرتبط

    try {
      // جلب توكن الإشعارات الخاص بهذا الجهاز من قاعدة البيانات
      const userDoc = await admin.firestore().collection('users').doc(deviceId).get();
      if (!userDoc.exists) return null;
      
      const fcmToken = userDoc.data().fcmToken;
      if (!fcmToken) return null;

      // إرسال الإشعار
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: 'تحديث حالة الطلب',
          body: `طلبك رقم ${after.reference} أصبح: ${after.status}`,
        },
        data: {
          requestId: context.params.requestId,
        },
      });
      console.log(`Notification sent to ${deviceId}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    return null;
  });

// دالة 2: إرسال إشعار جماعي لجميع المستخدمين (للاستخدام من لوحة التحكم)
exports.sendBroadcast = functions.https.onCall(async (data, context) => {
  const { title, body } = data;
  
  try {
    // جلب جميع التوكنات المحفوظة في مجموعة users
    const usersSnapshot = await admin.firestore().collection('users').get();
    const tokens = [];
    usersSnapshot.forEach(doc => {
      const token = doc.data().fcmToken;
      if (token) tokens.push(token);
    });

    if (tokens.length === 0) return { success: true, message: 'No devices found' };

    // إرسال الإشعار لكل الأجهزة
    const message = {
      notification: { title, body },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return { success: true, sent: response.successCount };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
