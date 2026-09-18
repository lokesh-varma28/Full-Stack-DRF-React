import secrets

from django.conf import settings
from django.core.mail import EmailMultiAlternatives


# ============================================================
# OTP GENERATOR
# ============================================================

def generate_otp():
    """
    Generate a secure 6-digit OTP.
    """
    return f"{secrets.randbelow(1_000_000):06d}"


# ============================================================
# REGISTRATION OTP EMAIL
# ============================================================

def send_otp_email(email, username, otp):
    """
    Send premium HTML OTP verification email.
    """

    subject = "Your E-Commerce verification code"

    # ========================================================
    # PLAIN TEXT FALLBACK
    # ========================================================

    text_content = f"""
Hello {username},

Welcome to E-Commerce!

To complete your account registration, please use the
verification code below:

OTP: {otp}

This verification code is valid for 10 minutes.

For your security:
- Never share this OTP with anyone.
- Our team will never ask for your OTP or password.

If you did not create an account with E-Commerce,
you can safely ignore this email.

Regards,
E-Commerce Team
"""

    # ========================================================
    # HTML EMAIL
    # ========================================================

    html_content = f"""
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>Verify your E-Commerce account</title>

</head>


<body style="
    margin:0;
    padding:0;
    background-color:#eef1f7;
    font-family:Arial, Helvetica, sans-serif;
">


<!-- ===================================================== -->
<!-- OUTER CONTAINER -->
<!-- ===================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color:#eef1f7;
        padding:45px 15px;
    "
>

<tr>

<td align="center">


<!-- ===================================================== -->
<!-- MAIN CARD -->
<!-- ===================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:620px;
        background-color:#ffffff;
        border-radius:18px;
        overflow:hidden;
        border:1px solid #e5e7eb;
    "
>


<!-- ===================================================== -->
<!-- PREMIUM HEADER -->
<!-- ===================================================== -->

<tr>

<td
    align="center"
    style="
        background-color:#0f172a;
        padding:38px 25px;
    "
>


<!-- BRAND ICON -->

<table
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>

<td
    align="center"
    style="
        width:58px;
        height:58px;
        background-color:#6366f1;
        border-radius:16px;
        color:#ffffff;
        font-size:26px;
        font-weight:bold;
    "
>

E

</td>

</tr>

</table>


<!-- BRAND -->

<div style="
    margin-top:16px;
    color:#ffffff;
    font-size:26px;
    font-weight:bold;
    letter-spacing:0.3px;
">

E-Commerce

</div>


<div style="
    margin-top:7px;
    color:#94a3b8;
    font-size:13px;
">

Secure shopping. Simple experience.

</div>


</td>

</tr>


<!-- ===================================================== -->
<!-- CONTENT -->
<!-- ===================================================== -->

<tr>

<td style="
    padding:42px 42px 35px 42px;
">


<!-- SMALL BADGE -->

<table
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>

<td style="
    background-color:#eef2ff;
    color:#4f46e5;
    padding:7px 13px;
    border-radius:20px;
    font-size:12px;
    font-weight:bold;
">

EMAIL VERIFICATION

</td>

</tr>

</table>


<!-- TITLE -->

<h1 style="
    margin:20px 0 12px 0;
    color:#0f172a;
    font-size:28px;
    line-height:1.25;
">

Verify your email

</h1>


<!-- GREETING -->

<p style="
    margin:0 0 14px 0;
    color:#1e293b;
    font-size:16px;
    line-height:1.6;
">

Hello <strong>{username}</strong>,

</p>


<p style="
    margin:0 0 30px 0;
    color:#64748b;
    font-size:15px;
    line-height:1.7;
">

Thanks for creating your E-Commerce account.
Please enter the verification code below to
confirm your email address and activate your account.

</p>


<!-- ===================================================== -->
<!-- OTP SECTION -->
<!-- ===================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:14px;
    "
>

<tr>

<td
    align="center"
    style="
        padding:26px 20px 25px 20px;
    "
>


<div style="
    color:#64748b;
    font-size:11px;
    font-weight:bold;
    letter-spacing:2px;
    text-transform:uppercase;
    margin-bottom:17px;
">

YOUR VERIFICATION CODE

</div>


<!-- OTP -->

<table
    cellpadding="0"
    cellspacing="6"
    border="0"
>

<tr>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[0]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[1]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[2]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[3]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[4]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[5]}

</td>


</tr>

</table>


<!-- EXPIRY -->

<div style="
    margin-top:18px;
    color:#dc2626;
    font-size:13px;
    font-weight:bold;
">

⏱ Valid for 10 minutes

</div>


</td>

</tr>

</table>


<!-- ===================================================== -->
<!-- SECURITY NOTICE -->
<!-- ===================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        margin-top:28px;
        background-color:#fefce8;
        border:1px solid #fde68a;
        border-radius:12px;
    "
>

<tr>

<td style="
    padding:17px 18px;
">

<div style="
    color:#854d0e;
    font-size:13px;
    font-weight:bold;
    margin-bottom:5px;
">

🔐 Security reminder

</div>


<div style="
    color:#713f12;
    font-size:13px;
    line-height:1.6;
">

Never share this verification code with anyone.
E-Commerce support will never ask for your OTP or password.

</div>

</td>

</tr>

</table>


<!-- ===================================================== -->
<!-- IGNORE MESSAGE -->
<!-- ===================================================== -->

<p style="
    margin:27px 0 0 0;
    color:#64748b;
    font-size:13px;
    line-height:1.7;
">

If you did not create this account, no action is required.
You can safely ignore this email.

</p>


</td>

</tr>


<!-- ===================================================== -->
<!-- FOOTER -->
<!-- ===================================================== -->

<tr>

<td
    align="center"
    style="
        background-color:#f8fafc;
        border-top:1px solid #e5e7eb;
        padding:27px 20px;
    "
>

<div style="
    color:#0f172a;
    font-size:14px;
    font-weight:bold;
">

E-Commerce Team

</div>


<div style="
    margin-top:7px;
    color:#94a3b8;
    font-size:12px;
    line-height:1.6;
">

This is an automated security email.

<br>

Please do not reply to this message.

</div>


<div style="
    margin-top:14px;
    color:#cbd5e1;
    font-size:11px;
">

© 2026 E-Commerce. All rights reserved.

</div>


</td>

</tr>


</table>

<!-- END MAIN CARD -->


</td>

</tr>

</table>

<!-- END OUTER CONTAINER -->


</body>

</html>
"""

    # ========================================================
    # SEND EMAIL
    # ========================================================

    try:

        email_message = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )

        email_message.attach_alternative(
            html_content,
            "text/html"
        )

        email_message.send(
            fail_silently=False
        )

        return True

    except Exception as e:

        print(
            "OTP EMAIL ERROR:",
            str(e)
        )

        return False


# ============================================================
# PASSWORD RESET OTP EMAIL
# ============================================================

def send_password_reset_otp_email(
    email,
    username,
    otp
):
    """
    Send premium password reset OTP email.
    """

    subject = "Reset your E-Commerce password"

    # ========================================================
    # PLAIN TEXT
    # ========================================================

    text_content = f"""
Hello {username},

We received a request to reset your E-Commerce account password.

Your password reset OTP is:

{otp}

This OTP is valid for 10 minutes.

For your security:
- Never share this OTP with anyone.
- Our team will never ask for your OTP or password.

If you did not request a password reset,
you can safely ignore this email.

Regards,
E-Commerce Team
"""

    # ========================================================
    # HTML
    # ========================================================

    html_content = f"""
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>Password Reset</title>

</head>


<body style="
    margin:0;
    padding:0;
    background-color:#eef1f7;
    font-family:Arial, Helvetica, sans-serif;
">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color:#eef1f7;
        padding:45px 15px;
    "
>

<tr>

<td align="center">


<!-- ===================================================== -->
<!-- CARD -->
<!-- ===================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:620px;
        background-color:#ffffff;
        border-radius:18px;
        overflow:hidden;
        border:1px solid #e5e7eb;
    "
>


<!-- ===================================================== -->
<!-- HEADER -->
<!-- ===================================================== -->

<tr>

<td
    align="center"
    style="
        background-color:#0f172a;
        padding:38px 25px;
    "
>


<table
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>

<td
    align="center"
    style="
        width:58px;
        height:58px;
        background-color:#6366f1;
        border-radius:16px;
        color:#ffffff;
        font-size:26px;
        font-weight:bold;
    "
>

E

</td>

</tr>

</table>


<div style="
    margin-top:16px;
    color:#ffffff;
    font-size:26px;
    font-weight:bold;
">

E-Commerce

</div>


<div style="
    margin-top:7px;
    color:#94a3b8;
    font-size:13px;
">

Password Recovery

</div>


</td>

</tr>


<!-- ===================================================== -->
<!-- CONTENT -->
<!-- ===================================================== -->

<tr>

<td style="
    padding:42px 42px 35px 42px;
">


<table
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>

<td style="
    background-color:#eef2ff;
    color:#4f46e5;
    padding:7px 13px;
    border-radius:20px;
    font-size:12px;
    font-weight:bold;
">

PASSWORD RESET

</td>

</tr>

</table>


<h1 style="
    margin:20px 0 12px 0;
    color:#0f172a;
    font-size:28px;
    line-height:1.25;
">

Reset your password

</h1>


<p style="
    margin:0 0 14px 0;
    color:#1e293b;
    font-size:16px;
    line-height:1.6;
">

Hello <strong>{username}</strong>,

</p>


<p style="
    margin:0 0 30px 0;
    color:#64748b;
    font-size:15px;
    line-height:1.7;
">

We received a request to reset the password
for your E-Commerce account.

Use the verification code below to continue.

</p>


<!-- ===================================================== -->
<!-- OTP -->
<!-- ===================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:14px;
    "
>

<tr>

<td
    align="center"
    style="
        padding:26px 20px 25px 20px;
    "
>


<div style="
    color:#64748b;
    font-size:11px;
    font-weight:bold;
    letter-spacing:2px;
    margin-bottom:17px;
">

PASSWORD RESET CODE

</div>


<table
    cellpadding="0"
    cellspacing="6"
    border="0"
>

<tr>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[0]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[1]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[2]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[3]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[4]}

</td>


<td style="
    width:42px;
    height:48px;
    background-color:#ffffff;
    border:1px solid #cbd5e1;
    border-radius:9px;
    text-align:center;
    vertical-align:middle;
    color:#0f172a;
    font-size:25px;
    font-weight:bold;
">

{otp[5]}

</td>


</tr>

</table>


<div style="
    margin-top:18px;
    color:#dc2626;
    font-size:13px;
    font-weight:bold;
">

⏱ Valid for 10 minutes

</div>


</td>

</tr>

</table>


<!-- ===================================================== -->
<!-- SECURITY -->
<!-- ===================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        margin-top:28px;
        background-color:#fefce8;
        border:1px solid #fde68a;
        border-radius:12px;
    "
>

<tr>

<td style="
    padding:17px 18px;
">

<div style="
    color:#854d0e;
    font-size:13px;
    font-weight:bold;
    margin-bottom:5px;
">

🔐 Security reminder

</div>


<div style="
    color:#713f12;
    font-size:13px;
    line-height:1.6;
">

Never share this verification code with anyone.
E-Commerce support will never ask for your OTP or password.

</div>

</td>

</tr>

</table>


<p style="
    margin:27px 0 0 0;
    color:#64748b;
    font-size:13px;
    line-height:1.7;
">

If you did not request a password reset,
you can safely ignore this email.

Your account password will remain unchanged.

</p>


</td>

</tr>


<!-- ===================================================== -->
<!-- FOOTER -->
<!-- ===================================================== -->

<tr>

<td
    align="center"
    style="
        background-color:#f8fafc;
        border-top:1px solid #e5e7eb;
        padding:27px 20px;
    "
>

<div style="
    color:#0f172a;
    font-size:14px;
    font-weight:bold;
">

E-Commerce Team

</div>


<div style="
    margin-top:7px;
    color:#94a3b8;
    font-size:12px;
    line-height:1.6;
">

This is an automated security email.

<br>

Please do not reply to this message.

</div>


<div style="
    margin-top:14px;
    color:#cbd5e1;
    font-size:11px;
">

© 2026 E-Commerce. All rights reserved.

</div>


</td>

</tr>


</table>


</td>

</tr>

</table>


</body>

</html>
"""

    # ========================================================
    # SEND EMAIL
    # ========================================================

    try:

        email_message = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )

        email_message.attach_alternative(
            html_content,
            "text/html"
        )

        email_message.send(
            fail_silently=False
        )

        return True

    except Exception as e:

        print(
            "PASSWORD RESET EMAIL ERROR:",
            str(e)
        )

        return False