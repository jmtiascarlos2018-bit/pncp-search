const nodemailer = require('nodemailer');

const buildTransport = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
    });
};

const sendMail = async ({ to, subject, html, text }) => {
    const transport = buildTransport();
    if (!transport) {
        throw new Error('SMTP not configured');
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    return transport.sendMail({
        from,
        to,
        subject,
        text,
        html
    });
};

module.exports = { sendMail };
