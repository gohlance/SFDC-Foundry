//This is auth.js
"use strict";
const passport = require('koa-passport')
const SalesforceStrategy = require('passport-salesforce')

passport.use(new SalesforceStrategy({
    clientID: "3MVG9i1HRpGLXp.qKwbWJHwmeMLmgspmmKGeCEMgq7Kftsb56h8o4N8GUF75jKIXJ5jAIXVd.ILGr5kMlNIac",
    clientSecret: "115F62ABE052C3381CA24D5BFCCBF0D74A6CE310EF82E2A8BEDA871F97FB73E9",
    scope: ['api'],
    callbackurl: "http://localhost:1234/auth/salesforce/callback"
}, function(accessToken, refreshToken, profile, done){
    console.log("A : " + accessToken)
}))

passport.serializeUser(function(user, done) {
    done(null, user)
  })
  
  passport.deserializeUser(function(user, done) {
    done(null, user)
  })
  
module.exports = passport;