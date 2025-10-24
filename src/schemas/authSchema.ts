import joi from "joi";

export const loginSchema = joi.object({
	code: joi.string().max(150).required().messages({
		"string.max": "Username cannot exceed 150 characters",
		"string.empty": "Username is required",
	}),
	redirectUri: joi.string().max(150).required().messages({
		"string.max": "Redirect URI cannot exceed 150 characters",
		"string.empty": "Redirect URI is required",
	}),
});

export const changePasswordSchema = joi.object({
	// current_password: joi.string().max(50).required().messages({
	// 	"string.max": "Current password cannot exceed 50 characters",
	// 	"string.empty": "Current password is required",
	// }),
	new_password: joi
		.string()
		.min(8)
		.max(50)
		.pattern(/^\S+$/, { name: "noSpaces" }) // Validasi spasi
		.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
			name: "complexity",
		})
		.required()
		.messages({
			"string.min": "Password must be at least 8 characters",
			"string.max": "Password cannot exceed 50 characters",
			"string.pattern.noSpaces": "Password cannot contain spaces", // Pesan khusus spasi
			"string.pattern.complexity":
				"Password must contain: 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#^)",
			"string.empty": "New password is required",
		}),
	confirm_password: joi
		.string()
		.valid(joi.ref("new_password"))
		.required()
		.messages({
			"any.only": "Passwords must match",
			"string.empty": "Please confirm your password",
		}),
});

export const verifyOTPSchema = joi.object({
	otp_code: joi.string().length(6).pattern(/^\d+$/).required().messages({
		"string.length": "OTP must be exactly 6 digits",
		"string.pattern.base": "OTP must contain only numbers",
		"string.empty": "OTP is required",
	}),
});

export const forgotPasswordSchema = joi.object({
	email: joi.string().email().required().messages({
		"string.empty": "Email is required",
	}),
});
