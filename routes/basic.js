const sfdcmethods = require('../sfdc-api')
const _ = require('lodash')

module.exports = ({
    router
  }) => {
    router
      .get('home', '/', async (ctx) => {
        return ctx.render('index')
      })
      .get('home2', '/welcome', async (ctx) => {
          console.log("Debug Mode : " + ctx.session.accesscode + " / " + ctx.session.instanceUrl + " / " + ctx.session.orgId)
          if (!ctx.session.accesscode || !ctx.session.instanceUrl) {
            return ctx.render('index')
          } else {
      
            return ctx.render('welcome', {
              result_objects: _.defaultTo(await sfdcmethods.display_Homepage_Objects(ctx.session),0),
              result_profiles: _.defaultTo(await sfdcmethods.display_Homepage_Profiles(ctx.session),0),
              result_layouts: _.defaultTo(await sfdcmethods.display_Homepage_Layouts(ctx.session),0),
              result_ApexComponents: _.defaultTo(await sfdcmethods.display_Homepage_ApexComponents(ctx.session),0),
              result_apexTriggers: _.defaultTo(await sfdcmethods.display_Homepage_ApexTrigger(ctx.session),0),
              result_apexPages: _.defaultTo(await sfdcmethods.display_Homepage_ApexPages(ctx.session),0),
              result_recordTypes: _.defaultTo(await sfdcmethods.display_Homepage_RecordTypes(ctx.session),0),
              result_orgInformation: _.defaultTo(await sfdcmethods.getMoreOrgDetails(ctx.session),0),
              result_userLicense: _.defaultTo(await sfdcmethods.getUserLicenseDetails(ctx.session),0),
              result_securityRisk: _.defaultTo(await sfdcmethods.getSecurityRisk("HOME", ctx.session),[0,0]),
              result_customapp: _.defaultTo(await sfdcmethods.getCustomApps("HOME", ctx.session),[0,0,0]),
              session: ctx.session
            })
          }
      })
  .get('index', '/index', (ctx) => {
    return ctx.render('index')
  })
  .get('about', '/about', (ctx) => {
    ctx.body = "About US..."
  })
  .get('contact', '/contact', (ctx) => {
    ctx.session.accesscode = "00D46000001Uq6O!AQoAQMsR9viIZZzjH9gIun3_lx59sjxV0HfZ_sFWjC4W_UlxDygKujDFZGHSjppIabATAO_aqIwnMsnBhDgNydI7Qr1kmWca"
    ctx.session.orgId = "168"
    ctx.session.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
    ctx.body = "Contact US...."
  })
  .get('payment', '/payment', (ctx) => {
    return ctx.render('payment')
  })
  .get('testing', '/testing', (ctx) => {
    return ctx.render('test')
  })
}