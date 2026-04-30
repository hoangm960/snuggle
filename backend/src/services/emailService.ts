import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: parseInt(process.env.SMTP_PORT || "587", 10),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

const from = process.env.SMTP_FROM || "Snuggles <noreply@snuggles.app>";

export interface InviteEmailParams {
	to: string;
	inviteToken: string;
	role: "visitor" | "admin";
	invitedByName: string;
}

export const sendInviteEmail = async ({
	to,
	inviteToken,
	role,
	invitedByName,
}: InviteEmailParams): Promise<void> => {
	const appUrl = process.env.APP_URL || "http://localhost:3000";
	const inviteLink = `${appUrl}/register?invite=${inviteToken}&role=${role}`;

	const roleLabel = role === "admin" ? "Administrator" : "Visitor";

	const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
			<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
				<tr>
					<td align="center">
						<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
							<!-- Header -->
							<tr>
								<td style="background: linear-gradient(135deg, #5D9C59 0%, #7CB342 100%); padding: 32px; text-align: center;">
									<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Snuggles</h1>
								</td>
							</tr>
							<!-- Content -->
							<tr>
								<td style="padding: 32px;">
									<h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 600;">You're Invited!</h2>
									<p style="margin: 0 0 16px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										<strong>${invitedByName}</strong> has invited you to join Snuggles as a <strong>${roleLabel}</strong>.
									</p>
									<p style="margin: 0 0 24px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Click the button below to create your account and get started.
									</p>
									<!-- CTA Button -->
									<table width="100%" cellpadding="0" cellspacing="0">
										<tr>
											<td align="center">
												<a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #5D9C59 0%, #7CB342 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
													Accept Invitation
												</a>
											</td>
										</tr>
									</table>
									<p style="margin: 24px 0 0; color: #888888; font-size: 13px; line-height: 1.6;">
										This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
									</p>
								</td>
							</tr>
							<!-- Footer -->
							<tr>
								<td style="background-color: #f9f9f9; padding: 24px; text-align: center;">
									<p style="margin: 0; color: #888888; font-size: 13px;">
										&copy; ${new Date().getFullYear()} Snuggles. All rights reserved.
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;

	try {
		await transporter.sendMail({
			from,
			to,
			subject: `You're invited to join Snuggles as a ${roleLabel}`,
			html: htmlContent,
		});
		console.log(`Invitation email sent to ${to}`);
	} catch (error) {
		console.error(`Failed to send invitation email to ${to}:`, error);
		throw new Error("Failed to send invitation email");
	}
};

export interface VerificationEmailParams {
	to: string;
	displayName: string;
	verificationLink: string;
}

export interface KYCApprovedEmailParams {
	to: string;
	displayName: string;
}

export interface KYCRejectedEmailParams {
	to: string;
	displayName: string;
	reason: string;
}

export const sendVerificationEmail = async ({
	to,
	displayName,
	verificationLink,
}: VerificationEmailParams): Promise<void> => {
	const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
			<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
				<tr>
					<td align="center">
						<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
							<!-- Header -->
							<tr>
								<td style="background: linear-gradient(135deg, #5D9C59 0%, #7CB342 100%); padding: 32px; text-align: center;">
									<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Snuggles</h1>
								</td>
							</tr>
							<!-- Content -->
							<tr>
								<td style="padding: 32px;">
									<h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 600;">Verify Your Email</h2>
									<p style="margin: 0 0 16px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Hi${displayName ? ` ${displayName}` : ""},
									</p>
									<p style="margin: 0 0 24px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Thank you for creating a Snuggles account. Please verify your email address by clicking the button below.
									</p>
									<!-- CTA Button -->
									<table width="100%" cellpadding="0" cellspacing="0">
										<tr>
											<td align="center">
												<a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #5D9C59 0%, #7CB342 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
													Verify Email
												</a>
											</td>
										</tr>
									</table>
									<p style="margin: 24px 0 0; color: #888888; font-size: 13px; line-height: 1.6;">
										If you didn't create a Snuggles account, you can safely ignore this email.
									</p>
								</td>
							</tr>
							<!-- Footer -->
							<tr>
								<td style="background-color: #f9f9f9; padding: 24px; text-align: center;">
									<p style="margin: 0; color: #888888; font-size: 13px;">
										&copy; ${new Date().getFullYear()} Snuggles. All rights reserved.
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;

	try {
		await transporter.sendMail({
			from,
			to,
			subject: "Verify your Snuggles account",
			html: htmlContent,
		});
		console.log(`Verification email sent to ${to}`);
	} catch (error) {
		console.error(`Failed to send verification email to ${to}:`, error);
		throw new Error("Failed to send verification email");
	}
};

export const sendKYCApprovedEmail = async ({
	to,
	displayName,
}: KYCApprovedEmailParams): Promise<void> => {
	const appUrl = process.env.APP_URL || "http://localhost:3000";

	const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
			<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
				<tr>
					<td align="center">
						<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
							<tr>
								<td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
									<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Snuggles</h1>
								</td>
							</tr>
							<tr>
								<td style="padding: 32px;">
									<h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 600;">Identity Verified!</h2>
									<p style="margin: 0 0 16px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Hi${displayName ? ` ${displayName}` : ""},
									</p>
									<p style="margin: 0 0 24px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Great news! Your identity verification has been <strong>approved</strong>. You now have full access to apply for pet adoptions on Snuggles.
									</p>
									<table width="100%" cellpadding="0" cellspacing="0">
										<tr>
											<td align="center">
												<a href="${appUrl}/pets" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
													Browse Pets
												</a>
											</td>
										</tr>
									</table>
									<p style="margin: 24px 0 0; color: #888888; font-size: 13px; line-height: 1.6;">
										If you didn't complete this verification, please contact support immediately.
									</p>
								</td>
							</tr>
							<tr>
								<td style="background-color: #f9f9f9; padding: 24px; text-align: center;">
									<p style="margin: 0; color: #888888; font-size: 13px;">
										&copy; ${new Date().getFullYear()} Snuggles. All rights reserved.
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;

	try {
		await transporter.sendMail({
			from,
			to,
			subject: "Identity Verified - You can now adopt!",
			html: htmlContent,
		});
		console.log(`KYC approval email sent to ${to}`);
	} catch (error) {
		console.error(`Failed to send KYC approval email to ${to}:`, error);
		throw new Error("Failed to send KYC approval email");
	}
};

export const sendKYCRejectedEmail = async ({
	to,
	displayName,
	reason,
}: KYCRejectedEmailParams): Promise<void> => {
	const appUrl = process.env.APP_URL || "http://localhost:3000";

	const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
			<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
				<tr>
					<td align="center">
						<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
							<tr>
								<td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px; text-align: center;">
									<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Snuggles</h1>
								</td>
							</tr>
							<tr>
								<td style="padding: 32px;">
									<h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 600;">Verification Update</h2>
									<p style="margin: 0 0 16px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Hi${displayName ? ` ${displayName}` : ""},
									</p>
									<p style="margin: 0 0 16px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Unfortunately, your identity verification was <strong>not approved</strong> at this time.
									</p>
									<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
										<p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 600;">
											Reason for rejection:
										</p>
										<p style="margin: 0; color: #7f1d1d; font-size: 14px;">
											${reason}
										</p>
									</div>
									<p style="margin: 0 0 24px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Please fix the issue and try again. You have up to <strong>3 attempts</strong> before additional review is required.
									</p>
									<table width="100%" cellpadding="0" cellspacing="0">
										<tr>
											<td align="center">
												<a href="${appUrl}/ekyc" style="display: inline-block; background: linear-gradient(135deg, #5D9C59 0%, #7CB342 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
													Try Again
												</a>
											</td>
										</tr>
									</table>
									<p style="margin: 24px 0 0; color: #888888; font-size: 13px; line-height: 1.6;">
										If you believe this was a mistake, please contact support.
									</p>
								</td>
							</tr>
							<tr>
								<td style="background-color: #f9f9f9; padding: 24px; text-align: center;">
									<p style="margin: 0; color: #888888; font-size: 13px;">
										&copy; ${new Date().getFullYear()} Snuggles. All rights reserved.
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;

	try {
		await transporter.sendMail({
			from,
			to,
			subject: "Identity Verification Update - Action Required",
			html: htmlContent,
		});
		console.log(`KYC rejection email sent to ${to}`);
	} catch (error) {
		console.error(`Failed to send KYC rejection email to ${to}:`, error);
		throw new Error("Failed to send KYC rejection email");
	}
};

export interface OtpEmailParams {
	to: string;
	displayName: string;
	code: string;
}

export const sendOtpEmail = async ({
	to,
	displayName,
	code,
}: OtpEmailParams): Promise<void> => {
	const htmlContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
			<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
				<tr>
					<td align="center">
						<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
							<tr>
								<td style="background: linear-gradient(135deg, #5D9C59 0%, #7CB342 100%); padding: 32px; text-align: center;">
									<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Snuggles</h1>
								</td>
							</tr>
							<tr>
								<td style="padding: 32px;">
									<h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 600;">Your Verification Code</h2>
									<p style="margin: 0 0 16px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Hi${displayName ? ` ${displayName}` : ""},
									</p>
									<p style="margin: 0 0 24px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
										Use the code below to complete your identity verification on Snuggles.
									</p>
									<table width="100%" cellpadding="0" cellspacing="0">
										<tr>
											<td align="center" style="padding: 16px 0;">
												<div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px 40px;">
													<span style="font-size: 36px; font-weight: 700; color: #16a34a; letter-spacing: 8px; font-family: monospace;">
														${code}
													</span>
												</div>
											</td>
										</tr>
									</table>
									<p style="margin: 24px 0 0; color: #888888; font-size: 13px; line-height: 1.6;">
										This code will expire in 10 minutes. Do not share this code with anyone.
									</p>
								</td>
							</tr>
							<tr>
								<td style="background-color: #f9f9f9; padding: 24px; text-align: center;">
									<p style="margin: 0; color: #888888; font-size: 13px;">
										&copy; ${new Date().getFullYear()} Snuggles. All rights reserved.
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;

	try {
		await transporter.sendMail({
			from,
			to,
			subject: "Your Snuggles Verification Code",
			html: htmlContent,
		});
		console.log(`OTP email sent to ${to}`);
	} catch (error) {
		console.error(`Failed to send OTP email to ${to}:`, error);
		throw new Error("Failed to send verification code email");
	}
};
