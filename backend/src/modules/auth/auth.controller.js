import ApiResponse from "../../common/utils/apiResponse.js";
import { loginUser, registerUser } from "./auth.service.js";
import { generateAccessToken } from "../../common/utils/jwt.utils.js";

export const register = async (req, res) => {
    try {
        const user = await registerUser(req.body);

        const token = generateAccessToken({
            id: user.id,
            email: user.email,
            name:user.name
        })

        return res.status(201).json(
            new ApiResponse(201, 'User registered successfully', { token, user })
        )

        } catch (err) {
        return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
}

export const login = async (req,res) => {
    try {
        const user = await loginUser(req.body)

        const token = generateAccessToken({
            id: user.id,
            email: user.email,
            name:user.name
        })

        return res.json(
            new ApiResponse(200, "Login successful", {
                token,
                user
            })
        )
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

