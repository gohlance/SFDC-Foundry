//This is auth.js
"use strict";
const passport = require('koa-passport')
const Strategy = require('passport-salesforce-oauth2').Strategy

passport.use(new Strategy({
  clientID: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
  clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
  callbackURL: 'https://testingauth123.herokuapp.com/auth3/login/return'
}, function (accessToken, refreshToken, profile, done) {
  global.accesscode = accessToken
  console.log("Update Accesscode : " + accessToken)
  global.refreshToken = refreshToken
  console.log("update refresh token  :" + refreshToken)
  global.profile = profile
  console.log("Update Profile : " + profile)
  console.log(done)
}))

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

module.exports = passport;