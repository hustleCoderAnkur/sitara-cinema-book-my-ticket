import Joi from "joi";
import BaseDto from "../../../common/dto/baseDto.js";


class RegisterDto extends BaseDto {
    static Schema = Joi.object({
        name: Joi.string().trim().min(2).max(52).required(),

        email: Joi.string().email().lowercase().required(),

        password: Joi.string().min(8).required().messages({
            "string.min": "Password must be at least 8 characters"
        }),

        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({
                "any.only": "Passwords do not match"
            })
    });
}

export default RegisterDto