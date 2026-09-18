const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const userModel = require("../models/auth.model")

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value

    let user = await userModel.findOne({ 
      $or: [{ googleId: profile.id }, { email }]  // check both
    })
    
    if (!user) {
      user = await userModel.create({
        email,
        username: profile.displayName.replace(/\s/g, '').toLowerCase(),
        googleId: profile.id,
        provider: "google"
      })
        
    } else if (!user.googleId) {
      // existing email user — link google to their account
      user.googleId = profile.id
      user.provider = "google"
      await user.save()
    }
    
    done(null, user)
  } catch (err) {
    done(err, null)
  }
}))

module.exports = passport