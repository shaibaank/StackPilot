const express = require("express")
const authRouter = express.Router()
const authController = require("../controllers/auth.controller")
const passport = require("../config/passport")
const authMiddleware = require("../middlewares/auth.middleware")

authRouter.post('/register',authController.registerController)
authRouter.post('/login',authController.loginController)
authRouter.get("/get-me",authMiddleware.authUser,authController.getUserDetailsController)
authRouter.post("/logout",authMiddleware.authUser,authController.logoutController)
authRouter.get('/google', passport.authenticate('google', {
      scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ],
  session: false,
    session: false
}))
authRouter.get('/google/callback',passport.authenticate('google',{session: false}),authController.googleCallbackController)





module.exports = authRouter