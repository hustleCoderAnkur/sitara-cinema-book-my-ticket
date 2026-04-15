import bcrypt from 'bcrypt'
import pool from '../../../../index.mjs'
import ApiError from '../../common/utils/apiError.js';

const registerUser = async ({name,email,password}) => {
    const existing = await pool.query(
        `SELECT id FROM users WHERE email = $1`, [email]
    );

    if (existing.rows.length > 0) {
        throw new ApiError(400,'user does not exists')
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
        `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
        [name, email, hashedPassword]
    )
    return result.rows[0]
}

const loginUser = async ({ email, password }) => {
    const res = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    )

    const user = res.rows[0]

    if (!user) {
        throw new ApiError(400,"User not found")
    }

    const isMatched = await bcrypt.compare(password, user.password)
    
    if (!user) {
        throw new ApiError(400,"wrong password")
    }
    return user
}

export {
    registerUser,
    loginUser
}