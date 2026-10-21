const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { formatPhoneNumber, sendSms } = require('../services/brevoSmsService');

console.log('Testing Phone Number formatting:');
console.log('9087516907 =>', formatPhoneNumber('9087516907'));
console.log('+91 9087516907 =>', formatPhoneNumber('+91 9087516907'));
console.log('09087516907 =>', formatPhoneNumber('09087516907'));
console.log('+919876543210 =>', formatPhoneNumber('+919876543210'));

console.log('\nChecking Environment Configuration:');
console.log('BREVO_API_KEY set:', !!process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.startsWith('xkeysib-'));
console.log('ADMIN_PHONE:', process.env.ADMIN_PHONE);
console.log('BREVO_SENDER_NAME:', process.env.BREVO_SENDER_NAME);
