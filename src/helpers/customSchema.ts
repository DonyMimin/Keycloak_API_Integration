import BaseJoi from "joi";

export const statusValues = ["0", "1"];
export const validLanguage = ["ID", "EN"]

export const JoiCustom = BaseJoi.defaults((schema) =>
    schema.prefs({
        convert: false,
        abortEarly: true,
        messages: {
            "string.base": "{{#label}} must be a string",
            "string.empty": "{{#label}} cannot be empty",
            "string.max": "{{#label}} cannot be more than {{#limit}} characters",
            "string.isoDate": "{{#label}} must be in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)",
            "string.uri": "{{#label}} must be a valid URL",
            "any.required": "{{#label}} is required",
            "number.base": "{{#label}} must be a number",
            "number.integer": "{{#label}} must be an integer",
            "array.base": "{{#label}} must be an array",
            "array.min": "{{#label}} must contain at least one item",
        },
    })
);