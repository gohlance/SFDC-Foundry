module.exports = ({
  router
}) => {
  router
    .get('home', '/', (ctx) => {
      if (!global.accesscode || !global.instanceUrl) {
        return ctx.render('index')
      }else{
        ctx.redirect('welcome')
      }
    })
    .get('about', '/about', (ctx) => {
      ctx.body = "About US..."
    })
    .get('contact', '/contact', (ctx) => {
      ctx.body = "Contact US...."
    })
    .get('welcome','/welcome', (ctx) => {
      return ctx.render('welcome')
    })
}