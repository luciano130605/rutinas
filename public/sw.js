self.addEventListener('push', (event) => {
    let data = { title: '⏱️ Descanso terminado', body: 'Volvé a entrenar', type: 'timer' };
    try { data = event.data.json(); } catch (e) { /* usa el default */ }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            tag: data.type === 'reminder' ? 'hoy-toca' : 'descanso-timer',
            renotify: true,
            data: { type: data.type, routineId: data.routineId || null },
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const { type, routineId } = event.notification.data || {};

    let targetUrl = '/';
    if (type === 'reminder') {
        targetUrl = routineId ? `/?openRoutine=${routineId}` : '/?openRoutine=today';
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((list) => {
            for (const client of list) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            return clients.openWindow(targetUrl);
        })
    );
});