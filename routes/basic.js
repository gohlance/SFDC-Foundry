module.exports = ({
  router
}) => {
  router
    .get('home', '/', (ctx) => {
      return ctx.render('index')
    })
    .get('about', '/about', (ctx) => {
      ctx.body = "About US..."
    })
    .get('contact', '/contact', (ctx) => {
      ctx.body = "Contact US...."
    })
    .get('welcome','/welcome,' (ctx) => {
      return ctx.render('welcome')
    })
}