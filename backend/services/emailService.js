/**
 * Brevo (Sendinblue) Transactional Email Service
 * Sends branded HTML email notifications for expense and reimbursement workflows.
 */

const https = require('https');

/**
 * Send an email via Brevo Transactional Email REST API
 * @param {Object} options
 * @param {string|Array<string>} options.to - Recipient email or array of { email, name }
 * @param {string} options.subject - Email Subject line
 * @param {string} options.htmlContent - HTML body content
 */
const sendEmail = async ({ to, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.warn('[Brevo Email] Skipped: BREVO_API_KEY is not configured.');
    return { success: false, reason: 'BREVO_API_KEY not configured' };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'dataxscape@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'DSClub Expense Tracker';

  // Format recipient list
  let recipients = [];
  if (Array.isArray(to)) {
    recipients = to.map((item) => {
      if (typeof item === 'string') return { email: item.trim() };
      return { email: item.email?.trim(), name: item.name || '' };
    }).filter((r) => r.email && r.email.includes('@'));
  } else if (typeof to === 'string') {
    recipients = [{ email: to.trim() }];
  } else if (to && to.email) {
    recipients = [{ email: to.email.trim(), name: to.name || '' }];
  }

  if (recipients.length === 0) {
    console.warn('[Brevo Email] No valid recipients provided.');
    return { success: false, reason: 'No valid recipients' };
  }

  const payload = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: recipients,
    subject,
    htmlContent,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
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
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Brevo Email] Successfully sent email "${subject}" to ${recipients.map(r => r.email).join(', ')}. MessageId: ${parsed.messageId}`);
            resolve({ success: true, messageId: parsed.messageId });
          } else {
            console.error(`[Brevo Email] Failed to send email (${res.statusCode}):`, parsed);
            resolve({ success: false, statusCode: res.statusCode, error: parsed });
          }
        } catch (e) {
          console.error('[Brevo Email] Parse error:', data);
          resolve({ success: false, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Brevo Email] Request error:', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Base styled HTML Email Template
 */
const getEmailWrapper = (title, headerColor, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: ${headerColor}; padding: 24px; color: #ffffff; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 24px; color: #334155; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 12px; }
    .pill-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .field-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .field-row:last-child { border-bottom: none; }
    .field-label { color: #64748b; font-weight: 600; }
    .field-val { color: #0f172a; font-weight: 700; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>DSCLUB EXPENSE TRACKER</h1>
      <p>${title}</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      DSCLUB Expense & Reimbursement Portal • Automated Notification System
    </div>
  </div>
</body>
</html>
`;

/**
 * Notify Reviewers & Submitter about a newly submitted expense
 */
const notifyExpenseSubmittedEmail = async ({ expense, requester, reviewerUsers = [] }) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'dataxscape@gmail.com';
    const requesterName = requester?.fullName || requester?.username || expense?.paidBy || 'Club Member';
    const amount = expense.amount || 0;
    const code = expense.expenseCode || 'EXP';
    const category = expense.category || 'General';
    const title = expense.title || 'Expense';

    // 1. Notify Reviewers (Faculty, Treasurer, Financer, Admin)
    const reviewerEmails = [];
    if (adminEmail) reviewerEmails.push({ email: adminEmail, name: 'Admin' });

    for (const u of reviewerUsers) {
      if (u.email && u.email.includes('@') && !u.email.endsWith('@clubfund.edu')) {
        // Send to real configured email addresses
        reviewerEmails.push({ email: u.email, name: u.fullName });
      }
    }

    const reviewerHtml = getEmailWrapper(
      'New Reimbursement Request',
      'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      `
      <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">New Expense Reimbursement Submitted</h2>
      <p>A new bill reimbursement request has been submitted by <strong>${requesterName}</strong> and requires review.</p>
      
      <div class="pill-box">
        <div class="field-row"><span class="field-label">Expense Code:</span><span class="field-val" style="font-family: monospace;">${code}</span></div>
        <div class="field-row"><span class="field-label">Title:</span><span class="field-val">${title}</span></div>
        <div class="field-row"><span class="field-label">Category:</span><span class="field-val">${category}</span></div>
        <div class="field-row"><span class="field-label">Amount:</span><span class="field-val" style="color: #059669; font-size: 15px;">₹${amount.toLocaleString('en-IN')}</span></div>
        <div class="field-row"><span class="field-label">Submitted By:</span><span class="field-val">${requesterName}</span></div>
        <div class="field-row"><span class="field-label">Original Payment:</span><span class="field-val">${expense.originalPaymentMethod || 'UPI'}</span></div>
      </div>

      <p style="font-size: 13px; color: #64748b;">Please login to the DSClub portal to review the attached receipt and approve or reject.</p>
      `
    );

    await sendEmail({
      to: reviewerEmails,
      subject: `[DSClub] New Expense Submitted: ${code} - ₹${amount} (${category})`,
      htmlContent: reviewerHtml,
    });

    // 2. Notify Submitter (if real email provided)
    if (requester?.email && !requester.email.endsWith('@clubfund.edu')) {
      const submitterHtml = getEmailWrapper(
        'Submission Confirmation',
        'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        `
        <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">Hello ${requesterName},</h2>
        <p>Your reimbursement request for <strong>${title}</strong> has been submitted successfully and queued for review.</p>
        
        <div class="pill-box">
          <div class="field-row"><span class="field-label">Tracking Code:</span><span class="field-val" style="font-family: monospace;">${code}</span></div>
          <div class="field-row"><span class="field-label">Amount:</span><span class="field-val" style="color: #2563eb;">₹${amount.toLocaleString('en-IN')}</span></div>
          <div class="field-row"><span class="field-label">Current Status:</span><span class="field-val" style="color: #d97706;">Pending Review</span></div>
        </div>

        <p style="font-size: 13px; color: #64748b;">You will receive an update once the Treasurer / Coordinator reviews your request.</p>
        `
      );

      await sendEmail({
        to: requester.email,
        subject: `[DSClub] Request Received: ${code} (₹${amount})`,
        htmlContent: submitterHtml,
      });
    }
  } catch (error) {
    console.error('[Brevo Email] notifyExpenseSubmittedEmail error:', error.message);
  }
};

/**
 * Notify Submitter & Admins on status change (Approved, Paid, Verified, Rejected)
 */
const notifyExpenseStatusUpdateEmail = async ({ expense, status, reviewerUser, rejectionReason }) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'dataxscape@gmail.com';
    const requester = expense.user;
    const requesterName = requester?.fullName || 'Club Member';
    const code = expense.expenseCode;
    const title = expense.title;
    const amount = expense.approvedAmount || expense.amount;

    let statusTitle = '';
    let headerGradient = '';
    let statusBadgeColor = '';
    let bodyText = '';

    switch (status) {
      case 'TREASURER_APPROVED':
        statusTitle = 'Expense Approved';
        headerGradient = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        statusBadgeColor = '#059669';
        bodyText = `Your reimbursement request <strong>${code}</strong> for <strong>₹${amount.toLocaleString('en-IN')}</strong> has been approved by ${reviewerUser?.fullName || 'Treasurer'} and moved to the Financer payout queue.`;
        break;

      case 'PAID':
        statusTitle = 'Reimbursement Paid';
        headerGradient = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
        statusBadgeColor = '#2563eb';
        bodyText = `Payment of <strong>₹${amount.toLocaleString('en-IN')}</strong> for <strong>${code}</strong> has been processed via ${expense.paymentMethod || 'UPI'} (Ref: ${expense.transactionReference || 'N/A'}).`;
        break;

      case 'VERIFIED':
        statusTitle = 'Expense Verified & Closed';
        headerGradient = 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)';
        statusBadgeColor = '#0d9488';
        bodyText = `Transaction <strong>${code}</strong> has been audited, verified, and settled into the club ledger by Faculty Coordinator.`;
        break;

      case 'REJECTED':
        statusTitle = 'Expense Request Rejected';
        headerGradient = 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)';
        statusBadgeColor = '#e11d48';
        bodyText = `Your reimbursement request <strong>${code}</strong> was rejected. Reason: <em>"${rejectionReason || 'Incomplete details'}"</em>.`;
        break;

      default:
        return;
    }

    const htmlContent = getEmailWrapper(
      statusTitle,
      headerGradient,
      `
      <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">Status Update: ${statusTitle}</h2>
      <p>Hello ${requesterName},</p>
      <p>${bodyText}</p>

      <div class="pill-box">
        <div class="field-row"><span class="field-label">Expense Code:</span><span class="field-val" style="font-family: monospace;">${code}</span></div>
        <div class="field-row"><span class="field-label">Title:</span><span class="field-val">${title}</span></div>
        <div class="field-row"><span class="field-label">Amount:</span><span class="field-val" style="color: ${statusBadgeColor}; font-weight: 800;">₹${amount.toLocaleString('en-IN')}</span></div>
        <div class="field-row"><span class="field-label">Action By:</span><span class="field-val">${reviewerUser?.fullName || 'Authorized Official'}</span></div>
      </div>
      `
    );

    const emailList = [];
    if (adminEmail) emailList.push(adminEmail);
    if (requester?.email && !requester.email.endsWith('@clubfund.edu')) {
      emailList.push(requester.email);
    }

    await sendEmail({
      to: emailList,
      subject: `[DSClub] ${statusTitle}: ${code} - ₹${amount}`,
      htmlContent,
    });
  } catch (error) {
    console.error('[Brevo Email] notifyExpenseStatusUpdateEmail error:', error.message);
  }
};

/**
 * Send Password Reset OTP Email
 */
const sendPasswordResetOtpEmail = async ({ to, name, otp }) => {
  try {
    const userName = name || 'User';
    const htmlContent = getEmailWrapper(
      'Password Reset Verification',
      'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
      `
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Password Reset Request</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We received a request to reset your password for your <strong>DSCLUB Expense Tracker</strong> account. Use the one-time verification code (OTP) below to proceed:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 16px 36px;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; font-family: monospace;">${otp}</span>
        </div>
        <p style="margin-top: 10px; font-size: 12px; color: #64748b;">This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      </div>

      <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      `
    );

    return await sendEmail({
      to,
      subject: `[DSClub] Password Reset OTP Code: ${otp}`,
      htmlContent,
    });
  } catch (error) {
    console.error('[Brevo Email] sendPasswordResetOtpEmail error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send User Approval / Rejection Notification Email
 */
const notifyUserApprovalStatusEmail = async ({ to, name, status, reason, reviewerName }) => {
  try {
    const isApproved = status === 'APPROVED';
    const title = isApproved ? 'Account Approved' : 'Registration Status Update';
    const headerGradient = isApproved
      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
      : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)';

    const bodyText = isApproved
      ? `<p>Great news! Your registration request for the <strong>DSCLUB Expense Tracker</strong> portal has been approved by <strong>${reviewerName || 'Administrator'}</strong>.</p>
         <p>You can now log in using your registered email address and password.</p>`
      : `<p>Your registration request for the <strong>DSCLUB Expense Tracker</strong> portal was reviewed by <strong>${reviewerName || 'Administrator'}</strong> and could not be approved at this time.</p>
         ${reason ? `<p><strong>Reason:</strong> <em>${reason}</em></p>` : ''}
         <p>Please contact your department faculty coordinator or club administrator if you believe this is an error.</p>`;

    const htmlContent = getEmailWrapper(
      title,
      headerGradient,
      `
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Hello ${name || 'Member'},</h2>
      ${bodyText}
      `
    );

    return await sendEmail({
      to,
      subject: `[DSClub] Account Registration ${isApproved ? 'Approved - Welcome!' : 'Update'}`,
      htmlContent,
    });
  } catch (error) {
    console.error('[Brevo Email] notifyUserApprovalStatusEmail error:', error.message);
  }
};

/**
 * Notify Admins and Faculty Coordinator of New Registration Request
 */
const notifyAdminNewUserRegisteredEmail = async ({ newUser, recipientEmails = [] }) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'dataxscape@gmail.com';
    const allRecipients = [];
    if (adminEmail) allRecipients.push({ email: adminEmail, name: 'Admin' });

    for (const em of recipientEmails) {
      if (em && em.includes('@') && !em.endsWith('@clubfund.edu')) {
        allRecipients.push({ email: em });
      }
    }

    const htmlContent = getEmailWrapper(
      'New User Registration Request',
      'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
      `
      <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">New Account Pending Your Approval</h2>
      <p>A new user has registered for the DSCLUB Expense Tracker and requires approval before they can log in.</p>
      
      <div class="pill-box">
        <div class="field-row"><span class="field-label">Full Name:</span><span class="field-val">${newUser.fullName}</span></div>
        <div class="field-row"><span class="field-label">Email:</span><span class="field-val">${newUser.email}</span></div>
        <div class="field-row"><span class="field-label">Username:</span><span class="field-val">@${newUser.username}</span></div>
        <div class="field-row"><span class="field-label">Phone:</span><span class="field-val">${newUser.phone || 'N/A'}</span></div>
        <div class="field-row"><span class="field-label">Department:</span><span class="field-val">${newUser.department || 'N/A'}</span></div>
        <div class="field-row"><span class="field-label">Year:</span><span class="field-val">${newUser.year || 'N/A'}</span></div>
      </div>

      <p style="font-size: 13px; color: #64748b;">Please log in to the portal as Admin or Faculty Coordinator to approve or reject this request.</p>
      `
    );

    return await sendEmail({
      to: allRecipients,
      subject: `[DSClub] Action Required: New User Approval Request (${newUser.fullName})`,
      htmlContent,
    });
  } catch (error) {
    console.error('[Brevo Email] notifyAdminNewUserRegisteredEmail error:', error.message);
  }
};

/**
 * Send User Login Credentials Email (When Admin creates an account)
 */
const sendUserCredentialsEmail = async ({ to, name, username, email, password, role, clubRole, department }) => {
  try {
    const portalUrl = process.env.FRONTEND_URL || 'http://localhost:3000/login';
    const userName = name || username || 'Member';
    const roleLabel = role ? role.replace(/_/g, ' ') : 'MEMBER';

    const htmlContent = getEmailWrapper(
      'Account Created - Login Credentials',
      'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
      `
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome to DSCLUB Expense Tracker!</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>An official user account has been created for you by the <strong>System Administrator</strong> on the <strong>DSClub Expense & Reimbursement Tracker</strong> portal.</p>
      
      <p>You can now sign in using the login credentials below:</p>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Portal Sign-In:</span>
          <div style="margin-top: 3px;"><a href="${portalUrl}" style="color: #2563eb; font-weight: 600; text-decoration: underline; font-size: 13px;">${portalUrl}</a></div>
        </div>
        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Login Email Address:</span>
          <div style="margin-top: 3px; font-size: 13px; font-weight: 700; color: #0f172a; font-family: monospace;">${email}</div>
        </div>
        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Username:</span>
          <div style="margin-top: 3px; font-size: 13px; font-weight: 700; color: #0f172a; font-family: monospace;">@${username}</div>
        </div>
        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Temporary Password:</span>
          <div style="margin-top: 4px;">
            <span style="font-size: 16px; font-weight: 900; color: #dc2626; font-family: monospace; letter-spacing: 1px; background: #fee2e2; border: 1px solid #fecaca; padding: 4px 12px; border-radius: 6px; display: inline-block;">${password}</span>
          </div>
        </div>
        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">System Role:</span>
          <div style="margin-top: 3px; font-size: 13px; font-weight: 700; color: #0f172a;">${roleLabel} ${clubRole ? `(${clubRole})` : ''}</div>
        </div>
        ${department ? `
        <div style="padding: 8px 0;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Department:</span>
          <div style="margin-top: 3px; font-size: 13px; font-weight: 600; color: #0f172a;">${department}</div>
        </div>` : ''}
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${portalUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
          Sign In to DSClub Portal
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px; line-height: 1.5;">
        <strong>Security Notice:</strong> Please keep these credentials confidential. If you ever forget your password, you can use the <strong>Forgot Password</strong> option on the sign-in page to receive a 6-digit OTP verification code via this email address.
      </p>
      `
    );

    return await sendEmail({
      to,
      subject: `[DSClub] Your Portal Account Credentials - ${userName}`,
      htmlContent,
    });
  } catch (error) {
    console.error('[Brevo Email] sendUserCredentialsEmail error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send User Password Reset by Admin Notification Email
 */
const sendUserPasswordResetByAdminEmail = async ({ to, name, email, newPassword, adminName }) => {
  try {
    const portalUrl = process.env.FRONTEND_URL || 'http://localhost:3000/login';
    const userName = name || 'Member';

    const htmlContent = getEmailWrapper(
      'Password Updated by Administrator',
      'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
      `
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Password Reset Notification</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Your password for the <strong>DSClub Expense Tracker</strong> account (<strong>${email}</strong>) has been updated by <strong>${adminName || 'System Administrator'}</strong>.</p>
      
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Login Email Address:</span>
          <div style="margin-top: 3px; font-size: 13px; font-weight: 700; color: #0f172a; font-family: monospace;">${email}</div>
        </div>
        <div style="padding: 8px 0;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">New Password:</span>
          <div style="margin-top: 4px;">
            <span style="font-size: 16px; font-weight: 900; color: #dc2626; font-family: monospace; letter-spacing: 1px; background: #fee2e2; border: 1px solid #fecaca; padding: 4px 12px; border-radius: 6px; display: inline-block;">${newPassword}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${portalUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">
          Sign In Now
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        If you did not request this change, please contact the administrator immediately.
      </p>
      `
    );

    return await sendEmail({
      to,
      subject: `[DSClub] Your Account Password Was Updated`,
      htmlContent,
    });
  } catch (error) {
    console.error('[Brevo Email] sendUserPasswordResetByAdminEmail error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  notifyExpenseSubmittedEmail,
  notifyExpenseStatusUpdateEmail,
  sendPasswordResetOtpEmail,
  notifyUserApprovalStatusEmail,
  notifyAdminNewUserRegisteredEmail,
  sendUserCredentialsEmail,
  sendUserPasswordResetByAdminEmail,
};
