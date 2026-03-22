# PassGen — Supabase Email Templates

Go to **Supabase Dashboard → Authentication → Email Templates** and replace each template.

> **IMPORTANT:** In Supabase Dashboard → Authentication → URL Configuration, set:
> - **Site URL:** `https://YOUR_DEPLOYED_DOMAIN` (e.g. `https://passgen.aclsmartsoftware.com`)
> - **Redirect URLs:** add your domain (e.g. `https://passgen.aclsmartsoftware.com/*`)

---

## 1. Confirm Signup

**Subject:** `PassGen — Confirm your email`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
          <!-- Header gradient bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#3b82f6,#8b5cf6,#ec4899);"></td>
          </tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 32px 0;">
              <div style="width:48px;height:48px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:24px;font-weight:bold;">🛡</span>
              </div>
              <h1 style="color:#f8fafc;font-size:22px;font-weight:700;margin:16px 0 0;">PassGen</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px;">
              <h2 style="color:#e2e8f0;font-size:18px;font-weight:600;margin:0 0 12px;text-align:center;">Confirm your email</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center;">
                Welcome to PassGen! Click the button below to verify your email address and activate your account.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#3b82f6,#8b5cf6);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#64748b;font-size:12px;line-height:1.5;margin:24px 0 0;text-align:center;">
                If you didn't create a PassGen account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #334155;">
              <p style="color:#475569;font-size:11px;margin:0;text-align:center;">
                Powered by <a href="https://aclsmartsoftware.com" style="color:#60a5fa;text-decoration:none;font-weight:600;">@ACL Smart Software</a>
              </p>
              <p style="color:#475569;font-size:11px;margin:6px 0 0;text-align:center;">
                End-to-end encrypted password manager · Zero-knowledge architecture
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Magic Link (used for account deletion verification)

**Subject:** `PassGen — Your verification code`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
          <!-- Header gradient bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#3b82f6,#8b5cf6,#ec4899);"></td>
          </tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 32px 0;">
              <div style="width:48px;height:48px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:24px;font-weight:bold;">🛡</span>
              </div>
              <h1 style="color:#f8fafc;font-size:22px;font-weight:700;margin:16px 0 0;">PassGen</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px;">
              <h2 style="color:#e2e8f0;font-size:18px;font-weight:600;margin:0 0 12px;text-align:center;">Verification Code</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;text-align:center;">
                You requested a verification code for your PassGen account. Use the code below in the app:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;padding:16px 40px;background-color:#0f172a;border:2px solid #334155;border-radius:12px;letter-spacing:8px;font-size:28px;font-weight:700;color:#f8fafc;font-family:monospace;">
                      {{ .Token }}
                    </div>
                  </td>
                </tr>
              </table>
              <p style="color:#f97316;font-size:13px;line-height:1.5;margin:20px 0 0;text-align:center;">
                ⚠️ If you didn't request this code, someone may be trying to access your account. Please change your password immediately.
              </p>
              <p style="color:#64748b;font-size:12px;line-height:1.5;margin:12px 0 0;text-align:center;">
                This code expires in 10 minutes.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #334155;">
              <p style="color:#475569;font-size:11px;margin:0;text-align:center;">
                Powered by <a href="https://aclsmartsoftware.com" style="color:#60a5fa;text-decoration:none;font-weight:600;">@ACL Smart Software</a>
              </p>
              <p style="color:#475569;font-size:11px;margin:6px 0 0;text-align:center;">
                End-to-end encrypted password manager · Zero-knowledge architecture
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Reset Password

**Subject:** `PassGen — Reset your password`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
          <!-- Header gradient bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#3b82f6,#8b5cf6,#ec4899);"></td>
          </tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 32px 0;">
              <div style="width:48px;height:48px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:24px;font-weight:bold;">🛡</span>
              </div>
              <h1 style="color:#f8fafc;font-size:22px;font-weight:700;margin:16px 0 0;">PassGen</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px;">
              <h2 style="color:#e2e8f0;font-size:18px;font-weight:600;margin:0 0 12px;text-align:center;">Reset Your Password</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center;">
                We received a request to reset the password for your PassGen account. Click the button below to set a new password.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#3b82f6,#8b5cf6);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#64748b;font-size:12px;line-height:1.5;margin:24px 0 0;text-align:center;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #334155;">
              <p style="color:#475569;font-size:11px;margin:0;text-align:center;">
                Powered by <a href="https://aclsmartsoftware.com" style="color:#60a5fa;text-decoration:none;font-weight:600;">@ACL Smart Software</a>
              </p>
              <p style="color:#475569;font-size:11px;margin:6px 0 0;text-align:center;">
                End-to-end encrypted password manager · Zero-knowledge architecture
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Change Email Address

**Subject:** `PassGen — Confirm email change`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
          <!-- Header gradient bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#3b82f6,#8b5cf6,#ec4899);"></td>
          </tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 32px 0;">
              <div style="width:48px;height:48px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:24px;font-weight:bold;">🛡</span>
              </div>
              <h1 style="color:#f8fafc;font-size:22px;font-weight:700;margin:16px 0 0;">PassGen</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px;">
              <h2 style="color:#e2e8f0;font-size:18px;font-weight:600;margin:0 0 12px;text-align:center;">Confirm Email Change</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center;">
                You requested to change the email address on your PassGen account. Click the button below to confirm the change.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#3b82f6,#8b5cf6);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">
                      Confirm New Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#64748b;font-size:12px;line-height:1.5;margin:24px 0 0;text-align:center;">
                If you didn't request this change, please contact support immediately.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #334155;">
              <p style="color:#475569;font-size:11px;margin:0;text-align:center;">
                Powered by <a href="https://aclsmartsoftware.com" style="color:#60a5fa;text-decoration:none;font-weight:600;">@ACL Smart Software</a>
              </p>
              <p style="color:#475569;font-size:11px;margin:6px 0 0;text-align:center;">
                End-to-end encrypted password manager · Zero-knowledge architecture
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Invite User

**Subject:** `PassGen — You've been invited`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
          <!-- Header gradient bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(to right,#3b82f6,#8b5cf6,#ec4899);"></td>
          </tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 32px 0;">
              <div style="width:48px;height:48px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:24px;font-weight:bold;">🛡</span>
              </div>
              <h1 style="color:#f8fafc;font-size:22px;font-weight:700;margin:16px 0 0;">PassGen</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px;">
              <h2 style="color:#e2e8f0;font-size:18px;font-weight:600;margin:0 0 12px;text-align:center;">You're Invited!</h2>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;text-align:center;">
                You've been invited to join PassGen — a secure, end-to-end encrypted password manager. Click below to accept the invitation and set up your account.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#3b82f6,#8b5cf6);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #334155;">
              <p style="color:#475569;font-size:11px;margin:0;text-align:center;">
                Powered by <a href="https://aclsmartsoftware.com" style="color:#60a5fa;text-decoration:none;font-weight:600;">@ACL Smart Software</a>
              </p>
              <p style="color:#475569;font-size:11px;margin:6px 0 0;text-align:center;">
                End-to-end encrypted password manager · Zero-knowledge architecture
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```
