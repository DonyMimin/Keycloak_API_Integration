import Joi from "joi";

export const createUserSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username is required",
    "any.required": "Username is required",
  }),
  name: Joi.string().required().messages({
    "string.base": "name must be a string",
    "string.empty": "name is required",
    "any.required": "name is required",
  }),
  password: Joi.string().required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
  confirm_password: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      "any.only": "Confirm password must match password",
      "string.base": "Password must be a string",
      "string.empty": "Please confirm your password",
      "any.required": "Please confirm your password",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email",
    "any.required": "Email is required",
  }),
  status: Joi.string().required().messages({
    "string.base": "status must be a string",
    "string.empty": "status is required",
    "any.required": "status is required",
  }),
  role_id: Joi.string().required().messages({
    "string.base": "Role ID must be a string",
    "string.empty": "Role ID is required",
    "any.required": "Role ID is required",
  }),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username is required",
    "any.required": "Username is required",
  }),
  name: Joi.string().required().messages({
    "string.base": "name must be a string",
    "string.empty": "name is required",
    "any.required": "name is required",
  }),
  password: Joi.string().required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
  confirm_password: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      "any.only": "Confirm password must match password",
      "string.base": "Password must be a string",
      "string.empty": "Please confirm your password",
      "any.required": "Please confirm your password",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email",
    "any.required": "Email is required",
  }),
  status: Joi.string().required().messages({
    "string.base": "status must be a string",
    "string.empty": "status is required",
    "any.required": "status is required",
  }),
  role_id: Joi.string().required().messages({
    "string.base": "Role ID must be a string",
    "string.empty": "Role ID is required",
    "any.required": "Role ID is required",
  }),
});
