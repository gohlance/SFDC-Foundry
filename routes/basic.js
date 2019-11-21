module.exports = ({
  router
}) => {
  router
    .get('home', '/', (ctx) => {
      ctx.render('index')
    })
    .get('about','/about', (ctx) => {
      ctx.body = "About US..."
    })
    .get('contact','/contact', (ctx) =>{
      ctx.body = "Contact US...."
    })
}