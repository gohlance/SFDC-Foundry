const sfdcmethods = require('../sfdc-api')
const _ = require('lodash')
const passport = require('koa-passport');
const bcrypt = require('bcrypt');
module.exports = ({
  router
}) => {
  router
    .get('home', '/', async (ctx) => {
      return ctx.render('index')
    })
    .get('welcome', '/welcome', async (ctx) => {
      console.log("QueryString : " + ctx.request.query["org"])
      console.log("Authenticated : " + ctx.isAuthenticated())
      if (ctx.isAuthenticated()){
        if (!ctx.session.orgId){
          ctx.session.orgId = ctx.request.query["org"]
        }
        console.log("Debug Mode : " + ctx.session.accesscode + " / " + ctx.session.instanceUrl + " / " + ctx.session.orgId)
        console.log("Orginformation : " + _.defaultTo(await sfdcmethods.getMoreOrgDetails(ctx.session), 0))
     
        return ctx.render('welcome', {
          result_objects: _.defaultTo(await sfdcmethods.display_Homepage_Objects(ctx.session), 0),
          result_profiles: _.defaultTo(await sfdcmethods.display_Homepage_Profiles(ctx.session), 0),
          result_layouts: _.defaultTo(await sfdcmethods.display_Homepage_Layouts(ctx.session), 0),
          result_ApexComponents: _.defaultTo(await sfdcmethods.display_Homepage_ApexComponents(ctx.session), 0),
          result_apexTriggers: _.defaultTo(await sfdcmethods.display_Homepage_ApexTrigger(ctx.session), 0),
          result_apexPages: _.defaultTo(await sfdcmethods.display_Homepage_ApexPages(ctx.session), 0),
          result_recordTypes: _.defaultTo(await sfdcmethods.display_Homepage_RecordTypes(ctx.session), 0),
          result_orgInformation: _.defaultTo(await sfdcmethods.getMoreOrgDetails(ctx.session), 0),
          result_userLicense: _.defaultTo(await sfdcmethods.getUserLicenseDetails(ctx.session), 0),
          result_securityRisk: _.defaultTo(await sfdcmethods.getSecurityRisk("HOME", ctx.session), [0, 0]),
          result_customapp: _.defaultTo(await sfdcmethods.getCustomApps("HOME", ctx.session), [0, 0, 0]),
          session: ctx.session,
          orgname: ctx.request.query["n"]
        })

      }else{
        return ctx.render('index')
      }
    })
    .get('index', '/index', (ctx) => {
      return ctx.render('index')
    })
    .get('about', '/about', (ctx) => {
      ctx.body = "About US..."
    })
    .get('contact', '/contact', (ctx) => {
      return ctx.render('contactus')
    })
    .get('payment', '/payment', (ctx) => {
      return ctx.render('payment')
    })
    
    .post('register', '/auth/register', async (ctx) => {
      let hash = bcrypt.hashSync(ctx.request.body.password, 10);
      const user = await global.pool.query("INSERT INTO Users (user_name, user_email, user_password) VALUES ($1, $2, $3)", [ctx.request.body.username, ctx.request.body.useremail, hash])
      return passport.authenticate('local', (err, user, info, status) => {
        if (user) {
          ctx.login(user);
          ctx.redirect('/getstarted');
        } else {
          ctx.status = 400;
          ctx.body = {
            status: 'error'
          };
        }
      })(ctx);
    })
    
    .post('login','/auth/login', async (ctx) => {
      return passport.authenticate('local', (err, user, info, status) => {
        if (user) {
          ctx.login(user);
          ctx.redirect('/getstarted');
        } else {
          ctx.status = 400;
          ctx.body = {
            status: 'error'
          };
        }
      })(ctx);
    })
    .get('logout','/auth/logout',(ctx) => {
      if (ctx.isAuthenticated()){
        ctx.logout()
        ctx.redirect('index')
      } else {
        ctx.body = { success: false }
        ctx.throw(401)
      }
    })
    .get('getStarted','/getstarted',async (ctx) => {
      if (ctx.isAuthenticated()){
        //Call a method to get all the orgs with the userid
        return ctx.render('getstarted',{
          allOrgs: _.defaultTo(await sfdcmethods.getAllOrgsByUserId(ctx.session.passport.user.id),0),
          session: ctx.session
        })
      }else{
        ctx.redirect('index');
      }
    })
}