import Joi from "joi";

const namePattern = /^[a-zA-Z0-9\s\-_]+$/;
const statusValues = ["0", "1"];
const commonMessages = {
	"string.base": "Field must be a string",
	"string.empty": "Field cannot be empty",
	"any.required": "Field is required",
};

export const createRoleSchema = Joi.object({
	name: Joi.string()
		.max(60)
		.required()
		.messages({
			...commonMessages,
			label: "Role Name",
			"string.min": "Role name must be at least 3 characters",
		}),

	description: Joi.string()
		.max(255)
		.required()
		.messages({
			...commonMessages,
			label: "Role Description",
			"string.min": "Description must be at least 3 characters",
		}),
});

export const updateRoleSchema = Joi.object({
	name: Joi.string().max(60),
	description: Joi.string().max(255),
});
