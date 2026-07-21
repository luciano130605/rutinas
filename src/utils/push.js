const WORKER_URL = 'https://rest-timer-push.luciano-rest-time-gym.workers.dev'; // 👈 tu URL real
const VAPID_PUBLIC_KEY = 'BLK6UpwDQndBlUp-ynDVLNUXoqjExRxIkOjmM_-VwPbXWi2Ie0uZ3sMXAofQk3SQdEsBqUNEDH2ePrdbQzOlaiQ';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

let cachedSubscription = null;

export async function getPushSubscription() {
  if (cachedSubscription) return cachedSubscription;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return null;
    }
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  cachedSubscription = sub;
  return sub;
}

export async function scheduleServerPush(endTime, id) {
  try {
    const subscription = await getPushSubscription();
    if (!subscription) return null;
    const res = await fetch(`${WORKER_URL}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, endTime, id }),
    });
    const data = await res.json();
    return data.id;
  } catch (e) {
    console.error('[push] no se pudo agendar', e);
    return null;
  }
}

export async function cancelServerPush(id) {
  if (!id) return;
  try {
    await fetch(`${WORKER_URL}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch (e) { /* silencioso */ }
}


export async function scheduleReminder({ id, enabled, time, routines }) {
  try {
    const subscription = await getPushSubscription();
    if (!subscription) return null;
    const tzOffsetMinutes = new Date().getTimezoneOffset();
    const res = await fetch(`${WORKER_URL}/reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, subscription, enabled, time, tzOffsetMinutes, routines }),
    });
    const data = await res.json();
    return data.id;
  } catch (e) {
    console.error('[push] no se pudo agendar el reminder', e);
    return null;
  }
}

export async function cancelReminder(id) {
  if (!id) return;
  try {
    await fetch(`${WORKER_URL}/reminder/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  } catch (e) { /* silencioso */ }
}