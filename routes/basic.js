module.exports = ({
  router
}) => {
  router
    .get('home', '/', (ctx) => {
      console.log("Gloabl: " + global.accesscode)
      console.log("Global :" + global.instanceUrl)
      console.log("Rsult " + (!global.accesscode || !global.instanceUrl))
      if (!global.accesscode || !global.instanceUrl) {
        return ctx.render('index')
      }else{
        return ctx.render('welcome')
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
