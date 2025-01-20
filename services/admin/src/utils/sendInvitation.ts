import { sendEmail } from "@codeflare/common";

export const sendInvitation = (
    name: string,
    email: string,
    role: string,
    token: string,
    subject: string
): void => {
    try {
        const html = `
    <div style="max-width: 500px; margin: 40px auto; text-align: center; padding: 48px; font-family: 'Urbanist', sans-serif; color: #1a1a1a; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
        <!-- Modern Lock Icon -->
        <div style="margin-bottom: 32px;">
            <img src="https://cdn-icons-png.flaticon.com/512/18357/18357729.png" alt="Security Icon" style="width: 120px; filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));" />
        </div>

        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 24px; color: #000000; letter-spacing: -0.02em;">
            Welcome to CodeFlare
        </h1>

        <p style="font-size: 16px; line-height: 1.7; color: #4a4a4a; margin: 0 0 32px; font-weight: 400; text-align: center; max-width: 480px; margin-left: auto; margin-right: auto;">
            Dear ${name} you've been invited to join our platform as ${role}. To ensure the security of your account, please 
            <a href="http://localhost:5173/${role}/verify-email?token=${token}" style="color: #0066ff; text-decoration: none; transition: color 0.2s ease;">
                set up your password
            </a> to get started.
        </p>

        <div style="background-color: #f5f5f5; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
            <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 0; font-weight: 400;">
                For your security, this invitation will expire in 24 hours. Need help? Contact our support team at 
                <a href="mailto:ahsanallajpk22@gmail.com" style="color: #0066ff; text-decoration: none; font-weight: 500;">
                    support@codeflare.com
                </a>
            </p>
        </div>

        <p style="font-size: 13px; color: #8c8c8c; margin: 24px 0 0; font-weight: 400; text-align: center;">
            If you didn't request this invitation, please disregard this email or contact us immediately.
        </p>
    </div>
        `;

        sendEmail(email, subject, html, (err: any) => {
            if (err) {
                throw new Error(err);
            }
        });
    } catch (err: any) {
        throw err;
    }
};
