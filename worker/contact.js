/* ==========================================================================
   worker/contact.js — the contact form's mail relay, on Cloudflare Workers.

   The site is static, and Resend's API key is a secret that must never ship
   to the browser (Resend refuses browser calls anyway). So the form posts
   here, this checks the message again, and hands it to Resend.

   Settings, all in the Cloudflare dashboard → the Worker → Settings →
   Variables and Secrets:

     RESEND_API_KEY   secret. From resend.com → API Keys.
     TO_EMAIL         where messages land, e.g. ruyinqc@gmail.com. Several
                      addresses can be comma-separated.
     FROM_EMAIL       optional. Defaults to Resend's test sender, which can
                      only mail the address the Resend account signed up
                      with. Once a domain is verified in Resend, use e.g.
                      Mariam's Portfolio <hello@yourdomain.com>
     ALLOWED_ORIGINS  comma-separated sites allowed to post, e.g.
                      https://ruyinqc.github.io,http://localhost:8080
   ========================================================================== */

const RESEND_URL = 'https://api.resend.com/emails';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SUBJECTS = ['Role opportunity', 'Portfolio walkthrough', 'Freelance / contract', 'Something else'];

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ok = origin && allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function reply(status, body, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, cors)
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function clean(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, { success: false, message: 'POST only' }, cors);
    if (cors['Access-Control-Allow-Origin'] === 'null') {
      return reply(403, { success: false, message: 'Origin not allowed' }, cors);
    }

    let body;
    try { body = await request.json(); }
    catch (e) { return reply(400, { success: false, message: 'Expected JSON' }, cors); }

    // Honeypot: pretend it worked so bots learn nothing.
    if (body.botcheck) return reply(200, { success: true }, cors);

    const name    = clean(body.name, 120);
    const email   = clean(body.email, 200);
    const message = clean(body.message, 5000);
    const subject = SUBJECTS.includes(body.subject) ? body.subject : 'Something else';

    // Same rules as the form. The browser checks are for the visitor; these
    // are for anyone posting here directly.
    if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 12) {
      return reply(422, { success: false, message: 'Missing or invalid fields' }, cors);
    }

    if (!env.RESEND_API_KEY || !env.TO_EMAIL) {
      console.error('RESEND_API_KEY or TO_EMAIL is not set');
      return reply(500, { success: false, message: 'Mail relay is not configured' }, cors);
    }

    const text = [message, '', '—', name, email].join('\n');
    const row = (label, value) =>
      '<tr><td style="color:#6b6b6b;padding:2px 16px 2px 0">' + label + '</td>' +
      '<td style="padding:2px 0">' + value + '</td></tr>';
    const html =
      '<table style="border-collapse:collapse;font:15px/1.5 sans-serif">' +
      row('Name', '<strong>' + escapeHtml(name) + '</strong>') +
      row('Email', '<a href="mailto:' + escapeHtml(email) + '">' + escapeHtml(email) + '</a>') +
      row('About', escapeHtml(subject)) +
      '</table>' +
      '<p style="white-space:pre-wrap;font:15px/1.5 sans-serif">' + escapeHtml(message) + '</p>';

    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || "Mariam's Portfolio <onboarding@resend.dev>",
        to: env.TO_EMAIL.split(',').map(s => s.trim()).filter(Boolean),
        reply_to: email,
        subject: '[Portfolio] ' + subject + ' — ' + name,
        text,
        html
      })
    });

    if (!res.ok) {
      console.error('Resend', res.status, await res.text());
      return reply(502, { success: false, message: 'Resend rejected the message' }, cors);
    }
    return reply(200, { success: true }, cors);
  }
};
