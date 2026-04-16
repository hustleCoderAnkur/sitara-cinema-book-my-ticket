import { Router } from "express"
import { login, register } from "./auth.controller.js"
import validate from "../../common/middlewares/validate.middleware.js"
import RegisterDto from "./dto/register.dto.js"
import LoginDto from "./dto/login.dto.js"

const router = Router()

router.post('/register', validate(RegisterDto), register)
router.post('/login', validate(LoginDto), login)

export default router