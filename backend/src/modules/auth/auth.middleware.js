import ApiError from "../../common/utils/apiError.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import pool from "../../../../index.mjs"

const authenticate = async (req,res,next) => {
  try {
      let token;
  
      if (req.headers.authorization?.startWith("Bearer ")) {
         token = req.headers.authorization.split(" ")[1]        
      }
      if (!token) throw new ApiError(401, "Not Authroized")
      
      const decoded = verifyAccessToken(token)
  
      const result = pool.query(
          "SELECT id,email FROM users WHERE id = $1", [decoded.id]
      )
  
      if (result.rows.length === 0) {
          throw new ApiError(401,"User not found")
      }
  
      req.user = result.rows[0]
      next()
  } catch (error) {
    return res.status(401).json('Unauthroized')
  }
}

export default authenticate 