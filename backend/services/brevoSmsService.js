/**
 * Brevo (Sendinblue) Transactional SMS Service
 * Sends SMS notifications for expense and reimbursement workflows.
 */

const https = require('https');

/**
 * Format phone numbers to standard international format (e.g. 919087516907)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters except leading +
  let cleaned = String(phone).trim().replace(/[^\d+]/g, '');
  if (!cleaned) return null;

  // Remove leading '+' if present for standard Brevo payload format
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If standard 10 digit Indian number (e.g. 9087516907), prepend 91
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return `91${cleaned}`;
  }

  // If 11 digit starting with 0 (e.g. 09087516907)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `91${cleaned.substring(1)}`;
  }

  // If already contains country code (e.g. 919087516907 or other country)
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return cleaned;
  }

  return cleaned;
};

/**
 * Send a single Transactional SMS via Brevo API
 * @param {Object} options
 * @param {string} options.recipient - Target phone number
 * @param {string} options.message - SMS message text
 * @param {string} options.sender - Sender Name (max 11 alphanumeric chars)
 */
const sendSms = async ({ recipient, message, sender }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_brevo_api_key_here') {
    console.warn('[Brevo SMS] Skipped: BREVO_API_KEY is not configured.');
    return { success: false, reason: 'BREVO_API_KEY not configured' };
  }

  const formattedRecipient = formatPhoneNumber(recipient);
  if (!formattedRecipient) {
    console.warn(`[Brevo SMS] Invalid phone number skipped: "${recipient}"`);
    return { success: false, reason: 'Invalid phone number' };
  }

  const senderName = (sender || process.env.BREVO_SENDER_NAME || 'ClubFund')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 11) || 'ClubFund';

  const payload = JSON.stringify({
    sender: senderName,
    recipient: formattedRecipient,
    content: message,
    type: 'transactional',
    unicodeEnabled: true,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/transactionalSMS/sms',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Brevo SMS] Successfully sent SMS to ${formattedRecipient}. MessageId: ${parsed.messageId || 'OK'}`);
            resolve({ success: true, messageId: parsed.messageId, data: parsed });
          } else {
            console.error(`[Brevo SMS] Failed to send SMS to ${formattedRecipient} (${res.statusCode}):`, parsed);
            resolve({ success: false, statusCode: res.statusCode, error: parsed });
          }
        } catch (e) {
          console.error(`[Brevo SMS] Response parse error:`, data);
          resolve({ success: false, raw: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`[Brevo SMS] Request error sending to ${formattedRecipient}:`, error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Send bulk SMS messages to a list of recipients
 * @param {Array<string>} recipients - Array of phone numbers
 * @param {string} message - SMS message content
 */
const sendBulkSms = async (recipients, message) => {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return [];
  }

  // Deduplicate recipients
  const uniquePhones = Array.from(
    new Set(recipients.map((p) => formatPhoneNumber(p)).filter(Boolean))
  );

  const results = [];
  for (const phone of uniquePhones) {
    const res = await sendSms({ recipient: phone, message });
    results.push({ phone, ...res });
  }

  return results;
};

/**
 * Trigger SMS notifications when a new Bill / Expense reimbursement is submitted
 * Notifies:
 *  1. Faculty Coordinators
 *  2. Treasurers
 *  3. Financers
 *  4. Admin (including default ADMIN_PHONE: 9087516907)
 *  5. Requester / Submitter
 */
const notifyNewExpenseSubmitted = async ({ expense, requester, reviewerUsers = [] }) => {
  try {
    const adminPhone = process.env.ADMIN_PHONE || '9087516907';
    const requesterName = requester?.fullName || requester?.username || expense?.paidBy || 'Member';
    const amount = expense.amount || 0;
    const code = expense.expenseCode || 'EXP';
    const category = expense.category || 'General';
    const title = expense.title || 'Expense';

    // 1. Send SMS to Reviewers (Faculty, Treasurer, Financer, Admin)
    const reviewerPhones = [];

    // Always include the designated Admin phone
    if (adminPhone) {
      reviewerPhones.push(adminPhone);
    }

    // Collect phones from leadership users in database
    for (const user of reviewerUsers) {
      if (user.phone && user.phone.trim()) {
        reviewerPhones.push(user.phone);
      }
    }

    const reviewerMessage = `[ClubFund] New bill request: ${code} for Rs.${amount} by ${requesterName} (${category}: ${title.substring(0, 25)}). Please review in portal.`;
    
    // Send SMS to all reviewer roles & admin
    await sendBulkSms(reviewerPhones, reviewerMessage);

    // 2. Send SMS to the Requester
    const requesterPhone = requester?.phone;
    if (requesterPhone) {
      const requesterMessage = `[ClubFund] Hello ${requesterName}, your bill request ${code} for Rs.${amount} (${category}) has been submitted successfully and sent for review.`;
      await sendSms({ recipient: requesterPhone, message: requesterMessage });
    }
  } catch (error) {
    console.error('[Brevo SMS] notifyNewExpenseSubmitted error:', error.message);
  }
};

/**
 * Notify requester on approval, payment, rejection, or verification
 */
const notifyExpenseStatusUpdate = async ({ expense, status, reviewerUser, rejectionReason }) => {
  try {
    const requester = expense.user;
    if (!requester || !requester.phone) return;

    const requesterName = requester.fullName || 'Member';
    const code = expense.expenseCode;
    let message = '';

    switch (status) {
      case 'TREASURER_APPROVED':
        message = `[ClubFund] Great news! Your bill request ${code} for Rs.${expense.approvedAmount || expense.amount} was approved by ${reviewerUser?.fullName || 'Treasurer'}. Payment queue is pending.`;
        break;
      case 'PAID':
        message = `[ClubFund] Payment Processed! Rs.${expense.approvedAmount || expense.amount} for bill ${code} has been transferred by Finance via ${expense.paymentMethod || 'UPI'}.`;
        break;
      case 'VERIFIED':
        message = `[ClubFund] Completed! Bill ${code} for Rs.${expense.approvedAmount || expense.amount} has been verified and settled by Faculty Coordinator.`;
        break;
      case 'REJECTED':
        message = `[ClubFund] Notice: Your bill request ${code} was rejected. Reason: ${rejectionReason || 'Details incomplete'}. Check portal for details.`;
        break;
      default:
        break;
    }

    if (message) {
      await sendSms({ recipient: requester.phone, message });
    }
  } catch (error) {
    console.error('[Brevo SMS] notifyExpenseStatusUpdate error:', error.message);
  }
};

module.exports = {
  sendSms,
  sendBulkSms,
  notifyNewExpenseSubmitted,
  notifyExpenseStatusUpdate,
  formatPhoneNumber,
};
