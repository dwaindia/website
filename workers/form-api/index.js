/**
 * Dalit Welfare Association (DWA) — Form, Newsletter & Static Assets Worker
 *
 * Security & Reliability Rules:
 * - Never embeds secrets or CRM tokens in code.
 * - Enforces explicit same-origin / allowlist CORS checks, 16 KB payload limit, and validation.
 * - Persists verified submissions to Cloudflare D1 (`SUBMISSIONS_DB`) and dispatches
 *   transactional notifications via Cloudflare Email Service (`EMAIL`), plus optional CRM webhook.
 * - Avoids logging raw PII (emails, phone numbers, messages) in observability logs.
 */

const MAX_BODY_BYTES = 16 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALID_ENQUIRY_TYPES = new Set([
  'General',
  'CSR Partnership',
  'Grant',
  'Donation',
  'Volunteer',
  'Other'
]);

/**
 * Resolve allowed CORS origin from request origin matching same-origin or env.ALLOWED_ORIGINS.
 * @param {Request} request
 * @param {URL} url
 * @param {Record<string, unknown>} env
 * @returns {string | null}
 */
function resolveAllowedOrigin(request, url, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  if (origin === url.origin) return origin;
  const raw = typeof env.ALLOWED_ORIGINS === 'string' ? env.ALLOWED_ORIGINS : '';
  const allowlist = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return allowlist.includes(origin) ? origin : null;
}

/**
 * Build standard JSON response with strict CORS and security headers.
 * @param {unknown} payload
 * @param {number} status
 * @param {string | null} allowedOrigin
 * @returns {Response}
 */
function jsonResponse(payload, status, allowedOrigin) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });

  if (allowedOrigin) {
    headers.set('Access-Control-Allow-Origin', allowedOrigin);
    headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Vary', 'Origin');
  }

  return new Response(JSON.stringify(payload), { status, headers });
}

/**
 * Read and parse bounded JSON request body without risking unbounded memory growth.
 * @param {Request} request
 * @returns {Promise<{ ok: true, data: Record<string, unknown> } | { ok: false, status: number, error: string }>}
 */
async function readBoundedJson(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return { ok: false, status: 415, error: 'Content-Type must be application/json.' };
  }

  const contentLengthHeader = request.headers.get('Content-Length');
  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader);
    if (!Number.isFinite(declaredLength) || declaredLength > MAX_BODY_BYTES) {
      return { ok: false, status: 413, error: 'Request payload exceeds maximum size.' };
    }
  }

  if (!request.body) {
    return { ok: false, status: 400, error: 'Missing request body.' };
  }

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      return { ok: false, status: 413, error: 'Request payload exceeds maximum size.' };
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const decoded = new TextDecoder().decode(merged);
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, status: 400, error: 'JSON body must be an object.' };
    }
    return { ok: true, data: parsed };
  } catch {
    return { ok: false, status: 400, error: 'Malformed JSON body.' };
  }
}

/**
 * Trim and cap string field safely.
 * @param {unknown} value
 * @param {number} maxLen
 * @returns {string}
 */
function cleanText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLen);
}

/**
 * Escape HTML special characters before interpolating user values into email HTML.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Optional Cloudflare Turnstile verification when TURNSTILE_SECRET_KEY secret is bound.
 * @param {string} token
 * @param {string | null} remoteIp
 * @param {Record<string, unknown>} env
 * @returns {Promise<boolean>}
 */
async function verifyTurnstileIfConfigured(token, remoteIp, env) {
  if (typeof env.TURNSTILE_SECRET_KEY !== 'string' || !env.TURNSTILE_SECRET_KEY) {
    return true;
  }
  if (!token) return false;

  const form = new URLSearchParams();
  form.set('secret', env.TURNSTILE_SECRET_KEY);
  form.set('response', token);
  if (remoteIp) form.set('remoteip', remoteIp);

  const verifyResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });
  if (!verifyResp.ok) return false;

  const outcome = await verifyResp.json();
  return Boolean(outcome && outcome.success);
}

/**
 * Send transactional notification email using Cloudflare Email Sending (`env.EMAIL`).
 * Includes both HTML and plain text parts; avoids throwing when D1 already saved submission.
 * @param {'newsletter' | 'contact'} kind
 * @param {Record<string, unknown>} record
 * @param {string} requestId
 * @param {Record<string, unknown>} env
 * @returns {Promise<{ sent: boolean, messageId?: string, errorCode?: string }>}
 */
async function sendNotificationEmail(kind, record, requestId, env) {
  if (!env.EMAIL || typeof env.EMAIL.send !== 'function') {
    return { sent: false, errorCode: 'EMAIL_BINDING_MISSING' };
  }

  const toEmail =
    typeof env.NOTIFICATION_EMAIL === 'string' && env.NOTIFICATION_EMAIL.trim()
      ? env.NOTIFICATION_EMAIL.trim()
      : 'dalitwelfareassociation1@gmail.com';
  const fromEmail =
    typeof env.SENDER_EMAIL === 'string' && env.SENDER_EMAIL.trim()
      ? env.SENDER_EMAIL.trim()
      : 'forms@notify.dwaindiaa.org';
  const fromName =
    typeof env.SENDER_NAME === 'string' && env.SENDER_NAME.trim()
      ? env.SENDER_NAME.trim()
      : 'Dalit Welfare Association Website';

  const isNewsletter = kind === 'newsletter';
  const subject = isNewsletter
    ? `[DWA Website] New Newsletter Subscription`
    : `[DWA Website] New ${String(record.enquiryType || 'General')} Enquiry`;

  const textBody = isNewsletter
    ? [
        'Dalit Welfare Association — New Newsletter Subscription',
        `Reference ID: ${requestId}`,
        `Email: ${record.email}`,
        `Privacy Consent: Confirmed`,
        `Submitted At (UTC): ${record.submittedAt}`
      ].join('\n')
    : [
        'Dalit Welfare Association — New Contact / Partnership Enquiry',
        `Reference ID: ${requestId}`,
        `Enquiry Type: ${record.enquiryType}`,
        `Full Name: ${record.fullName}`,
        `Email: ${record.email}`,
        `Phone: ${record.phone || 'Not provided'}`,
        `Organization: ${record.organization || 'Not provided'}`,
        `Submitted At (UTC): ${record.submittedAt}`,
        '',
        'Message:',
        String(record.message || '')
      ].join('\n');

  const htmlBody = isNewsletter
    ? `<div style="font-family:sans-serif;max-width:600px;border:1px solid #e2c7c7;padding:20px;">
        <h2 style="margin:0 0 12px;color:#171717;">New Newsletter Subscription</h2>
        <p style="margin:4px 0;"><strong>Reference ID:</strong> ${escapeHtml(requestId)}</p>
        <p style="margin:4px 0;"><strong>Subscriber Email:</strong> ${escapeHtml(record.email)}</p>
        <p style="margin:4px 0;"><strong>Privacy Consent:</strong> Confirmed</p>
        <p style="margin:4px 0;"><strong>Submitted (UTC):</strong> ${escapeHtml(record.submittedAt)}</p>
      </div>`
    : `<div style="font-family:sans-serif;max-width:600px;border:1px solid #e2c7c7;padding:20px;">
        <h2 style="margin:0 0 12px;color:#171717;">New Website Enquiry (${escapeHtml(record.enquiryType)})</h2>
        <p style="margin:4px 0;"><strong>Reference ID:</strong> ${escapeHtml(requestId)}</p>
        <p style="margin:4px 0;"><strong>Full Name:</strong> ${escapeHtml(record.fullName)}</p>
        <p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(record.email)}</p>
        <p style="margin:4px 0;"><strong>Phone:</strong> ${escapeHtml(record.phone || 'Not provided')}</p>
        <p style="margin:4px 0;"><strong>Organization:</strong> ${escapeHtml(record.organization || 'Not provided')}</p>
        <p style="margin:4px 0;"><strong>Submitted (UTC):</strong> ${escapeHtml(record.submittedAt)}</p>
        <hr style="border:none;border-top:1px solid #e2c7c7;margin:14px 0;">
        <p style="margin:0 0 6px;"><strong>Message:</strong></p>
        <p style="margin:0;white-space:pre-line;color:#171717;">${escapeHtml(record.message)}</p>
      </div>`;

  const replyTo = isNewsletter
    ? String(record.email)
    : { email: String(record.email), name: String(record.fullName || record.email) };

  try {
    const result = await env.EMAIL.send({
      to: toEmail,
      from: { email: fromEmail, name: fromName },
      replyTo,
      subject,
      text: textBody,
      html: htmlBody
    });
    return { sent: true, messageId: result?.messageId };
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : 'EMAIL_SEND_FAILED';
    console.error(JSON.stringify({ message: 'email notification failed', requestId, code }));
    return { sent: false, errorCode: code };
  }
}

/**
 * Persist validated submission to D1 (`SUBMISSIONS_DB`), notify via Cloudflare Email (`EMAIL`),
 * and forward to optional `CRM_WEBHOOK_URL`.
 * @param {'newsletter' | 'contact'} kind
 * @param {Record<string, unknown>} record
 * @param {string} requestId
 * @param {Record<string, unknown>} env
 * @returns {Promise<{ persisted: boolean, status: number, code?: string, message: string, emailSent?: boolean }>}
 */
async function persistSubmission(kind, record, requestId, env) {
  const webhookUrl = typeof env.CRM_WEBHOOK_URL === 'string' ? env.CRM_WEBHOOK_URL.trim() : '';
  const hasD1 = Boolean(env.SUBMISSIONS_DB && typeof env.SUBMISSIONS_DB.prepare === 'function');
  const hasEmail = Boolean(env.EMAIL && typeof env.EMAIL.send === 'function');

  if (!hasD1 && !hasEmail && !webhookUrl) {
    return {
      persisted: false,
      status: 503,
      code: 'BACKEND_NOT_CONFIGURED',
      message: 'Live form destination is not configured yet. Please contact dalitwelfareassociation1@gmail.com directly.'
    };
  }

  let savedToD1 = false;
  if (hasD1) {
    if (kind === 'newsletter') {
      await env.SUBMISSIONS_DB.prepare(
        'INSERT INTO newsletter_subscribers (id, email, consent_given, created_at) VALUES (?1, ?2, ?3, ?4)'
      )
        .bind(requestId, record.email, 1, record.submittedAt)
        .run();
    } else {
      await env.SUBMISSIONS_DB.prepare(
        'INSERT INTO contact_enquiries (id, full_name, email, phone, organization, enquiry_type, message, consent_given, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)'
      )
        .bind(
          requestId,
          record.fullName,
          record.email,
          record.phone,
          record.organization,
          record.enquiryType,
          record.message,
          1,
          record.submittedAt
        )
        .run();
    }
    savedToD1 = true;
  }

  let emailSent = false;
  if (hasEmail) {
    const emailOutcome = await sendNotificationEmail(kind, record, requestId, env);
    emailSent = emailOutcome.sent;
  }

  if (webhookUrl) {
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'X-DWA-Submission-Id': requestId
    });
    if (typeof env.CRM_AUTH_TOKEN === 'string' && env.CRM_AUTH_TOKEN) {
      headers.set('Authorization', `Bearer ${env.CRM_AUTH_TOKEN}`);
    }

    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requestId, kind, payload: record })
    });

    if (!upstream.ok && !savedToD1 && !emailSent) {
      return {
        persisted: false,
        status: 502,
        code: 'UPSTREAM_REJECTED',
        message: 'Unable to confirm delivery. Please email dalitwelfareassociation1@gmail.com.'
      };
    }
  }

  if (!savedToD1 && !emailSent && !webhookUrl) {
    return {
      persisted: false,
      status: 502,
      code: 'DELIVERY_UNCONFIRMED',
      message: 'Unable to confirm submission right now. Please email dalitwelfareassociation1@gmail.com.'
    };
  }

  return {
    persisted: true,
    status: 201,
    emailSent,
    message:
      kind === 'newsletter'
        ? 'Thank you. Your email update preference has been saved.'
        : 'Thank you. Your enquiry has been received by Dalit Welfare Association.'
  };
}

export default {
  async fetch(request, env) {
    const requestId = crypto.randomUUID();
    const url = new URL(request.url);

    // Serve static assets cleanly if a non-API request ever reaches the Worker script
    if (!url.pathname.startsWith('/api/')) {
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        return env.ASSETS.fetch(request);
      }
      return jsonResponse({ ok: false, error: 'Not found.' }, 404, null);
    }

    const allowedOrigin = resolveAllowedOrigin(request, url, env);

    if (request.method === 'OPTIONS') {
      if (!allowedOrigin) {
        return jsonResponse({ ok: false, error: 'Origin not allowed.' }, 403, null);
      }
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin'
        }
      });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        const hasD1 = Boolean(env.SUBMISSIONS_DB);
        const hasEmail = Boolean(env.EMAIL);
        const hasCrm = Boolean(typeof env.CRM_WEBHOOK_URL === 'string' && env.CRM_WEBHOOK_URL.trim());
        const configured = hasD1 || hasEmail || hasCrm;
        return jsonResponse(
          { ok: true, service: 'dwa-form-api', configured, d1: hasD1, email: hasEmail },
          200,
          allowedOrigin
        );
      }

      if (request.method !== 'POST' || (url.pathname !== '/api/newsletter' && url.pathname !== '/api/contact')) {
        return jsonResponse({ ok: false, error: 'Not found.' }, 404, allowedOrigin);
      }

      if (request.headers.get('Origin') && !allowedOrigin) {
        return jsonResponse({ ok: false, error: 'Origin not allowed.' }, 403, null);
      }

      const bodyResult = await readBoundedJson(request);
      if (!bodyResult.ok) {
        return jsonResponse({ ok: false, error: bodyResult.error }, bodyResult.status, allowedOrigin);
      }

      const data = bodyResult.data;

      // Silent honeypot drop without saving or notifying
      const honeypot = cleanText(data.company_website || data.website, 120);
      if (honeypot) {
        console.log(JSON.stringify({ message: 'honeypot triggered', requestId, path: url.pathname }));
        return jsonResponse({ ok: true, requestId, message: 'Request processed.' }, 202, allowedOrigin);
      }

      const turnstileToken = cleanText(data.turnstileToken, 2048);
      const turnstileOk = await verifyTurnstileIfConfigured(
        turnstileToken,
        request.headers.get('CF-Connecting-IP'),
        env
      );
      if (!turnstileOk) {
        return jsonResponse({ ok: false, error: 'Spam verification failed. Please retry.' }, 400, allowedOrigin);
      }

      const submittedAt = new Date().toISOString();

      if (url.pathname === '/api/newsletter') {
        const email = cleanText(data.email, 254).toLowerCase();
        const consent = data.consent === true;

        if (!EMAIL_PATTERN.test(email)) {
          return jsonResponse({ ok: false, error: 'Please provide a valid email address.' }, 400, allowedOrigin);
        }
        if (!consent) {
          return jsonResponse({ ok: false, error: 'Privacy consent is required.' }, 400, allowedOrigin);
        }

        const result = await persistSubmission('newsletter', { email, consent, submittedAt }, requestId, env);
        console.log(
          JSON.stringify({
            message: 'newsletter processed',
            requestId,
            status: result.status,
            persisted: result.persisted,
            emailSent: Boolean(result.emailSent)
          })
        );
        return jsonResponse(
          { ok: result.persisted, code: result.code, requestId, message: result.message },
          result.status,
          allowedOrigin
        );
      }

      // POST /api/contact
      const fullName = cleanText(data.full_name, 120);
      const email = cleanText(data.email, 254).toLowerCase();
      const phone = cleanText(data.phone, 32);
      const organization = cleanText(data.organization, 160);
      const enquiryType = cleanText(data.enquiry_type, 64);
      const message = cleanText(data.message, 3000);
      const consent = data.consent === true;

      if (fullName.length < 2) {
        return jsonResponse({ ok: false, error: 'Full name must be at least 2 characters.' }, 400, allowedOrigin);
      }
      if (!EMAIL_PATTERN.test(email)) {
        return jsonResponse({ ok: false, error: 'Please provide a valid email address.' }, 400, allowedOrigin);
      }
      if (!VALID_ENQUIRY_TYPES.has(enquiryType)) {
        return jsonResponse({ ok: false, error: 'Invalid enquiry type.' }, 400, allowedOrigin);
      }
      if (message.length < 10) {
        return jsonResponse({ ok: false, error: 'Message must be at least 10 characters.' }, 400, allowedOrigin);
      }
      if (!consent) {
        return jsonResponse({ ok: false, error: 'Contact consent is required.' }, 400, allowedOrigin);
      }

      const result = await persistSubmission(
        'contact',
        { fullName, email, phone, organization, enquiryType, message, consent, submittedAt },
        requestId,
        env
      );
      console.log(
        JSON.stringify({
          message: 'contact processed',
          requestId,
          status: result.status,
          persisted: result.persisted,
          emailSent: Boolean(result.emailSent),
          enquiryType
        })
      );
      return jsonResponse(
        { ok: result.persisted, code: result.code, requestId, message: result.message },
        result.status,
        allowedOrigin
      );
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error(JSON.stringify({ message: 'unhandled worker error', requestId, path: url.pathname, error: errMessage }));
      return jsonResponse(
        { ok: false, requestId, error: 'Server error while processing request.' },
        500,
        allowedOrigin
      );
    }
  }
};
