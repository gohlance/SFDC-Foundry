"use strict"

module.exports = ({router}) => {
router
  .get('koala', '/', (ctx) => {
    ctx.body = "Welcome!"
  })
  .get('hello', '/hello', (ctx) => {
    ctx.body = "Hello"
  })

  .get('auth3', '/auth3', (ctx) => {
    return ctx.render('index2')
  })
  .get('auth3', '/auth3/login', passport.authenticate('salesforce', {
      failureRedirect: '/auth/salesforce/callback'
    }),
    function (request, response) {
      console.log("******R : " + request + " Res : " + response)
    })
  .get('auth3', '/auth3/login/return', (ctx) => {
    accesscode = ctx.request.query["code"]
    return ctx.render('success', {
      code: accesscode
    })
  })
}