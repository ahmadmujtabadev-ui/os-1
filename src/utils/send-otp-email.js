import { sendEmail } from '../mail/send-email.js';
import { baseEmailTemplate } from '../mail/templates.js';

const sendOtpEmail = async ({ to, subject, otp, purpose }) => {
    console.log("otp", otp)
    const html = baseEmailTemplate(`
    <p>Your ${purpose.replace('_', ' ')} code is:</p>
    <h2>${otp}</h2>
    <p>This code expires in 10 minutes.</p>
    `);

};

export default sendOtpEmail;