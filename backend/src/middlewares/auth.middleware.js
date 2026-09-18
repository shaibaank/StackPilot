const jwt = require("jsonwebtoken")
const redis = require("../config/cache")
async function authUser(req, res, next) {
    const token = req.cookies.jwt_token

    if (!token) {
        return res.status(404).json({
            message:"Token not found"
        })
    }
    const isTokenBlacklisted = await redis.get(token)

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message:"Invalid token"
        })
    }




    let decoded = null
    try {
         decoded = jwt.verify(token,process.env.JWT_SECRET)
    } catch (err) {
        return res.status(404).json({
            message:"Invalid Token"
        })
     }
    req.user = decoded

    next()
}


module.exports = { authUser }