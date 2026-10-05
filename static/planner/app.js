(() => {
    const API = window.PLANNER.api;
    const $ = (id) => document.getElementById(id);
    const chat = $('chat');
    const input = $('input');
    const form = $('composer');
    const sendBtn = form.querySelector('.send');

    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (_) { /* falls back to server TIME_ZONE */ }

    const csrf = () => (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || '';

    async function api(path, options = {}) {
        const res = await fetch(API + path, {
            ...options,
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf(), ...(options.headers || {}) },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    const CHECK_SVG = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.3 2.3 4.7-5"/></svg>';

    function renderTask(task, { deletable }) {
        const li = document.createElement('li');
        li.className = 'task';
        li.dataset.priority = task.priority;

        const check = document.createElement('button');
        check.type = 'button';
        check.className = 'check';
        check.innerHTML = CHECK_SVG;
        check.setAttribute('aria-label', `Выполнить: ${task.title}`);
        check.addEventListener('click', () => complete(li, task.id));

        const body = document.createElement('span');
        body.className = 'task-body';
        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;
        body.append(title);
        if (task.note) {
            const note = document.createElement('span');
            note.className = 'task-note';
            note.textContent = task.note;
            body.append(note);
        }

        li.append(check, body);

        if (task.due) {
            const due = document.createElement('span');
            due.className = 'task-due' + (task.overdue ? ' overdue' : '');
            due.textContent = task.due;
            li.append(due);
        }

        if (deletable) {
            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'task-delete';
            del.textContent = '×';
            del.setAttribute('aria-label', `Удалить: ${task.title}`);
            del.addEventListener('click', () => remove(task.id));
            li.append(del);
        }
        return li;
    }

    function renderTasks(data) {
        $('open-count').textContent = data.open_count;
        $('top-list').replaceChildren(...data.top.map((t) => renderTask(t, { deletable: false })));
        $('top-empty').hidden = data.top.length > 0;
        const rest = data.tasks.slice(data.top.length);
        $('all-list').replaceChildren(...rest.map((t) => renderTask(t, { deletable: true })));
        $('rest-empty').hidden = rest.length > 0;
    }

    function addMessage(msg) {
        $('chat-empty').hidden = true;
        const div = document.createElement('div');
        div.className = `msg ${msg.role}`;
        div.textContent = msg.text;
        chat.append(div);
    }

    function setMessages(messages) {
        chat.querySelectorAll('.msg').forEach((m) => m.remove());
        $('chat-empty').hidden = messages.length > 0;
        messages.forEach(addMessage);
        scrollDown();
    }

    const scrollDown = () => { chat.scrollTop = chat.scrollHeight; };

    async function complete(li, id) {
        li.classList.add('is-done');
        try {
            const data = await api(`tasks/${id}/`, { method: 'PATCH', body: JSON.stringify({ done: true }) });
            setTimeout(() => renderTasks(data), 350);
        } catch (_) {
            li.classList.remove('is-done');
        }
    }

    async function remove(id) {
        renderTasks(await api(`tasks/${id}/`, { method: 'DELETE' }));
    }

    async function send(text) {
        text = text.trim();
        if (!text) return;
        input.value = '';
        updateSendState();
        const pending = { role: 'user', text };
        addMessage(pending);
        scrollDown();
        try {
            const data = await api('chat/', { method: 'POST', body: JSON.stringify({ text }) });
            chat.lastElementChild.remove();
            if (data.cleared) setMessages([]);
            else { data.messages.forEach(addMessage); scrollDown(); }
            renderTasks(data);
        } catch (_) {
            addMessage({ role: 'bot', text: 'Не удалось отправить. Сервер запущен?' });
            scrollDown();
        }
    }

    function updateSendState() { sendBtn.disabled = !input.value.trim(); }

    form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
    input.addEventListener('input', updateSendState);

    form.querySelectorAll('[data-insert]').forEach((btn) => btn.addEventListener('click', () => {
        const snippet = btn.dataset.insert;
        input.value = snippet.startsWith(' ') ? input.value.trimEnd() + snippet : snippet + input.value;
        input.focus();
        updateSendState();
    }));
    form.querySelectorAll('[data-send]').forEach((btn) => btn.addEventListener('click', () => send(btn.dataset.send)));

    $('toggle-all').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        $('all-tasks').hidden = !open;
    });

    async function load() {
        const data = await api('state/');
        renderTasks(data);
        setMessages(data.messages);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') load().catch(() => {});
    });

    updateSendState();
    load().catch(() => addMessage({ role: 'bot', text: 'Не удалось загрузить данные. Сервер запущен?' }));

    if ('serviceWorker' in navigator && window.isSecureContext) {
        navigator.serviceWorker.register(window.PLANNER.sw).catch(() => {});
    }
})();
