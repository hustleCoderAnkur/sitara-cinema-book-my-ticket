import { Router } from "express"
import { login, register } from "./auth.controller.js"
import validate from "../../common/middlewares/validate.middleware.js"
import RegisterDto from "./dto/register.dto.js"
import LoginDto from "./dto/login.dto.js"

const router = Router()

router.post("/register", async (req, res) => {
    console.log("🔥 REGISTER HIT");
    console.log("BODY:", req.body);

    try {
        // existing logic
        router.post('/register', validate(RegisterDto), register)
    } catch (err) {
        console.error("❌ REGISTER ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.post("/login", async (req, res) => {
    console.log("🔥 LOGIN HIT");
    console.log("BODY:", req.body);

    try {
        // logic
        router.post('/login', validate(LoginDto),login)
    } catch (err) {
        console.error("❌ LOGIN ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});


export default router