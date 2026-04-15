import Joi from "joi"

class BaseDto{
    static Schema = Joi.object({})

    static validate(data){
        const {error,value} = this.Schema.validate(data,{
            abortEarly: false,
            stripUnknown: true
        })

        if (error) {
            const errors = error.details.map((d) => d.message)
            return { errors, value: null }
        }
        return { error: null, value }
    }
}

export default BaseDto
