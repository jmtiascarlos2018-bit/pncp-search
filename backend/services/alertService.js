const { admin, db } = require('../config/firebase');
const { sendMail } = require('./mailer');
const { searchTenders } = require('./searchService');

const COLLECTION = 'alert_subscriptions';
const DEFAULT_LOOKBACK_DAYS = Number(process.env.ALERTS_LOOKBACK_DAYS || 7);
const MAX_RESULTS_PER_ALERT = Number(process.env.ALERTS_MAX_RESULTS || 10);
const MAX_STORED_IDS = Number(process.env.ALERTS_MAX_STORED_IDS || 200);

const isFirestoreReady = () => admin.apps && admin.apps.length && db;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const formatDate = (date) => date.toISOString().split('T')[0];

const buildDateRange = () => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - DEFAULT_LOOKBACK_DAYS);
    return { start: formatDate(past), end: formatDate(today) };
};

const toPlainText = (items) => {
    return items.map((item, idx) => {
        const date = item.dataPublicacao ? `(${item.dataPublicacao})` : '';
        return `${idx + 1}. ${item.objeto} - ${item.orgao} ${date}\n${item.link}`;
    }).join('\n\n');
};

const toHtml = (items) => {
    const rows = items.map((item) => {
        const date = item.dataPublicacao ? `(${item.dataPublicacao})` : '';
        return `
            <li style="margin-bottom:12px;">
                <strong>${item.objeto}</strong><br/>
                <span>${item.orgao} ${date}</span><br/>
                <a href="${item.link}">${item.linkLabel || 'Abrir licitação'}</a>
            </li>
        `;
    }).join('');

    return `
        <div>
            <p>Encontramos novas licitações compatíveis com seus filtros.</p>
            <ul>${rows}</ul>
        </div>
    `;
};

const subscribe = async ({ email, q, uf, sources }) => {
    if (!isFirestoreReady()) {
        throw new Error('Firestore not initialized');
    }
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
        throw new Error('Email inválido');
    }

    const payload = {
        email: normalizedEmail,
        q: q || '',
        uf: uf || '',
        sources: sources || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastRunAt: null,
        lastSentIds: []
    };

    const ref = await db.collection(COLLECTION).add(payload);
    return { id: ref.id, ...payload };
};

const runAlerts = async () => {
    if (!isFirestoreReady()) {
        throw new Error('Firestore not initialized');
    }

    const snapshot = await db.collection(COLLECTION).get();
    const { start, end } = buildDateRange();
    const results = [];

    for (const doc of snapshot.docs) {
        const sub = doc.data();
        const email = sub.email;
        const lastSentIds = Array.isArray(sub.lastSentIds) ? sub.lastSentIds : [];

        const data = await searchTenders({
            q: sub.q || '',
            uf: sub.uf || '',
            dateStart: start,
            dateEnd: end,
            sources: sub.sources || undefined
        });

        const newItems = (data.data || [])
            .filter((item) => item && item.id && !lastSentIds.includes(item.id))
            .slice(0, MAX_RESULTS_PER_ALERT);

        if (!newItems.length) {
            results.push({ email, sent: 0 });
            continue;
        }

        await sendMail({
            to: email,
            subject: 'Novas licitações encontradas',
            text: toPlainText(newItems),
            html: toHtml(newItems)
        });

        const updatedIds = [...newItems.map((i) => i.id), ...lastSentIds].slice(0, MAX_STORED_IDS);
        await db.collection(COLLECTION).doc(doc.id).update({
            lastSentIds: updatedIds,
            lastRunAt: admin.firestore.FieldValue.serverTimestamp()
        });

        results.push({ email, sent: newItems.length });
    }

    return results;
};

module.exports = { subscribe, runAlerts };
