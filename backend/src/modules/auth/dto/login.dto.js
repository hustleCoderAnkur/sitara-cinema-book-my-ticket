import Joi from "joi"
import BaseDto from "../../../common/dto/baseDto.js"

class LoginDto extends BaseDto {
    static Schema = Joi.object({
        email: Joi.string().email().lowercase().trim().required(),
        password: Joi.string().trim().required()
    })
}

export default LoginDto