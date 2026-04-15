import jwt from 'jsonwebtoken'

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
    })
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_TOKEN)
}

export {
    generateAccessToken,
    verifyAccessToken
}
