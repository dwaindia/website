/**
 * Cloudflare Pages Function: POST /api/submit
 *
 * Handles static form submissions (multipart/form-data or application/x-www-form-urlencoded),
 * filters honeypot spam, validates required fields, and creates an item directly on a
 * monday.com CRM board via the GraphQL v2 API (zero external dependencies).
 *
 * Required Cloudflare Pages environment variables / secrets:
 * - MONDAY_API_TOKEN : monday.com Personal or App API v2 token (Secret)
 * - MONDAY_BOARD_ID  : Numeric ID of the target monday.com CRM board
 */

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_API_VERSION = '2024-10';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Placeholder monday.com column IDs mapped by this endpoint.
 * Replace these strings with your board's exact Column IDs if your board uses custom IDs
 * (in monday.com: enable Developer Mode or open column settings "..." -> Column ID).
 */
const MONDAY_COLUMN_IDS = {
  email: 'email',       // Email column ID -> { email, text }
  phone: 'phone',       // Phone column ID -> { phone, countryShortName: "IN" }
  formType: 'text',     // Text column ID for form_type ("signup", "contact", "volunteer", etc.)
  message: 'long_text'  // Long Text column ID for message, enquiry_type, and organization
};

const CREATE_ITEM_MUTATION = `
  mutation CreateLeadItem($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
    create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
      id
    }
  }
`;

/**
 * Sanitize and bound string inputs from FormData.
 * @param {FormDataEntryValue | null} value
 * @param {number} maxLength
 * @returns {string}
 */
function cleanField(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
}

/**
 * Build consistent no-store JSON responses.
 * @param {Record<string, unknown>} payload
 * @param {number} status
 * @returns {Response}
 */
function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

/**
 * Handle POST /api/submit from website signup and contact forms.
 * @param {{ request: Request, env: Record<string, unknown> }} context
 * @returns {Promise<Response>}
 */
export async function onRequestPost(context) {
  let formData;
  try {
    formData = await context.request.formData();
  } catch {
    return jsonResponse(
      { success: false, message: 'Invalid form submission payload.' },
      400
    );
  }

  // Honeypot spam protection: silently accept bots without writing to monday.com
  const botField = cleanField(formData.get('bot_field'), 120);
  if (botField) {
    return jsonResponse(
      { success: true, message: 'Thank you. Your submission has been received.' },
      200
    );
  }

  const name = cleanField(formData.get('name'), 120);
  const email = cleanField(formData.get('email'), 254).toLowerCase();
  const phone = cleanField(formData.get('phone'), 40);
  const formType = cleanField(formData.get('form_type'), 40) || 'contact';
  const enquiryType = cleanField(formData.get('enquiry_type'), 80);
  const organization = cleanField(formData.get('organization'), 160);
  const rawMessage = cleanField(formData.get('message'), 3500);

  if (!name || name.length < 2) {
    return jsonResponse(
      { success: false, message: 'Please enter your full name (at least 2 characters).' },
      400
    );
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return jsonResponse(
      { success: false, message: 'Please provide a valid email address.' },
      400
    );
  }

  const apiToken = typeof context.env?.MONDAY_API_TOKEN === 'string' ? context.env.MONDAY_API_TOKEN.trim() : '';
  const boardId = context.env?.MONDAY_BOARD_ID != null ? String(context.env.MONDAY_BOARD_ID).trim() : '';

  if (!apiToken || !boardId) {
    return jsonResponse(
      {
        success: false,
        message: 'Form backend is not configured yet. Please email dalitwelfareassociation1@gmail.com.'
      },
      500
    );
  }

  const messageSections = [];
  if (enquiryType) messageSections.push(`Enquiry Type: ${enquiryType}`);
  if (organization) messageSections.push(`Organization: ${organization}`);
  if (rawMessage) messageSections.push(rawMessage);

  const longTextBody =
    messageSections.length > 0
      ? messageSections.join('\n')
      : `Submitted via website ${formType} form.`;

  /** @type {Record<string, unknown>} */
  const columnValues = {
    [MONDAY_COLUMN_IDS.email]: { email, text: email },
    [MONDAY_COLUMN_IDS.formType]: formType,
    [MONDAY_COLUMN_IDS.message]: { text: longTextBody }
  };

  if (phone) {
    columnValues[MONDAY_COLUMN_IDS.phone] = {
      phone,
      countryShortName: 'IN'
    };
  }

  try {
    const mondayResponse = await fetch(MONDAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiToken,
        'API-Version': MONDAY_API_VERSION
      },
      body: JSON.stringify({
        query: CREATE_ITEM_MUTATION,
        variables: {
          boardId,
          itemName: name,
          columnValues: JSON.stringify(columnValues)
        }
      })
    });

    const mondayResult = await mondayResponse.json().catch(() => null);
    const hasGraphQLErrors = Array.isArray(mondayResult?.errors) && mondayResult.errors.length > 0;
    const createdItemId = mondayResult?.data?.create_item?.id;

    if (!mondayResponse.ok || hasGraphQLErrors || !createdItemId) {
      console.error(
        JSON.stringify({
          event: 'monday_create_item_failed',
          status: mondayResponse.status,
          errorCount: Array.isArray(mondayResult?.errors) ? mondayResult.errors.length : 0,
          formType
        })
      );
      return jsonResponse(
        {
          success: false,
          message: 'Unable to record submission right now. Please write to dalitwelfareassociation1@gmail.com.'
        },
        500
      );
    }

    const successMessage =
      formType === 'signup'
        ? 'Thank you for signing up. Your details have been recorded by Dalit Welfare Association.'
        : 'Thank you. Your enquiry has been received by Dalit Welfare Association.';

    return jsonResponse(
      {
        success: true,
        id: String(createdItemId),
        message: successMessage
      },
      200
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown upstream error';
    console.error(JSON.stringify({ event: 'monday_network_error', formType, error: errMsg }));
    return jsonResponse(
      {
        success: false,
        message: 'Unable to reach submission service right now. Please email dalitwelfareassociation1@gmail.com.'
      },
      500
    );
  }
}
