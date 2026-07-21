self.addEventListener('push', (event) => {
    let data = { title: '⏱️ Descanso terminado', body: 'Volvé a entrenar' };
    try { data = event.data.json(); } catch (e) { /* usa el default */ }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            tag: 'descanso-timer',
            renotify: true,
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((list) => {
            if (list.length > 0) return list[0].focus();
            return clients.openWindow('/');
        })
    );
});