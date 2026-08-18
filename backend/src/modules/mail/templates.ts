import type { Mail } from "./mail.service";

const brand = "RoomBazar";

function layout(heading: string, body: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f7f8fa;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#101828">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e4e7ec;border-radius:12px;padding:28px">
    <p style="margin:0 0 20px;font-size:18px;font-weight:600">room<span style="color:#2551eb">bazar</span></p>
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:600">${heading}</h1>
    ${body}
    <p style="margin:24px 0 0;font-size:12px;color:#98a2b3">
      ${brand} never asks for your password by email, and never collects rent or deposits.
    </p>
  </div>
</body></html>`;
}

export function verificationEmail(to: string, code: string, minutes: number): Mail {
  return {
    to,
    subject: `${code} is your ${brand} verification code`,
    html: layout(
      "Confirm your email",
      `<p style="margin:0 0 16px;font-size:14px;color:#667085">
         Enter this code to finish creating your account. It expires in ${minutes} minutes.
       </p>
       <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:6px">${code}</p>
       <p style="margin:20px 0 0;font-size:13px;color:#667085">
         If you did not request this, you can ignore this email.
       </p>`,
    ),
    text: `Your ${brand} verification code is ${code}. It expires in ${minutes} minutes. If you did not request this, ignore this email.`,
  };
}

export function passwordResetEmail(to: string, code: string, minutes: number): Mail {
  return {
    to,
    subject: `${code} is your ${brand} password reset code`,
    html: layout(
      "Reset your password",
      `<p style="margin:0 0 16px;font-size:14px;color:#667085">
         Enter this code to set a new password. It expires in ${minutes} minutes.
       </p>
       <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:6px">${code}</p>
       <p style="margin:20px 0 0;font-size:13px;color:#667085">
         If you did not request this, your password has not changed and you can ignore this email.
       </p>`,
    ),
    text: `Your ${brand} password reset code is ${code}. It expires in ${minutes} minutes.`,
  };
}
