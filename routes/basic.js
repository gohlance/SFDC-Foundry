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
      console.log("AAA : " + ctx.session.accesscode + " / " + ctx.session.instanceUrl + " / " + ctx.session.orgId)
      if (!ctx.session.accesscode || !ctx.session.instanceUrl) {
        return ctx.render('index')
      } else {
        const check_existingUser = await sfdcmethods.check_firstTime_Login(ctx.session)
        if (check_existingUser == false) {
          return ctx.render('welcome', {
            result_objects: 0,
            result_profiles: 0,
            result_layouts: 0,
            result_ApexComponents: 0,
            result_apexTriggers: 0,
            result_apexPages: 0,
            result_recordTypes: 0,
            result_orgInformation: 0,
            result_userLicense: 0,
            result_securityRisk: 0,
            result_customapp: 0,
            session: ctx.session
          })
        } else {
          return ctx.render('welcome', {
            result_objects: await sfdcmethods.display_Homepage_Objects(ctx.session),
            result_profiles: await sfdcmethods.display_Homepage_Profiles(ctx.session),
            result_layouts: await sfdcmethods.display_Homepage_Layouts(ctx.session),
            result_ApexComponents: await sfdcmethods.display_Homepage_ApexComponents(ctx.session),
            result_apexTriggers: await sfdcmethods.display_Homepage_ApexTrigger(ctx.session),
            result_apexPages: await sfdcmethods.display_Homepage_ApexPages(ctx.session),
            result_recordTypes: await sfdcmethods.display_Homepage_RecordTypes(ctx.session),
            result_orgInformation: await sfdcmethods.getMoreOrgDetails(ctx.session),
            result_userLicense: await sfdcmethods.getUserLicenseDetails(ctx.session),
            result_securityRisk: await sfdcmethods.getSecurityRisk("HOME", ctx.session),
            result_customapp: await sfdcmethods.getCustomApps("HOME", ctx.session),
            session: ctx.session
          })
        }
      }
    })
    .get('index', '/index', (ctx) => {
      return ctx.render('index')
    })
    .get('about', '/about', (ctx) => {
      ctx.body = "About US..."
    })
    .get('contact', '/contact', (ctx) => {
      ctx.session.accesscode = "00D46000001Uq6O!AQoAQIkDo2PPZMoQAEesFvuwFvyatBwEdituD0tmXP_ogsPOcXD4MODbhFlUs876sxc0Fo5t0EvXJ7q7W78VXFgUhw6FgGhP"
      ctx.session.orgId = "168"
      ctx.session.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
      ctx.body = "Contact US...."
    })
    .get('payment', '/payment', (ctx) => {
      return ctx.render('payment')
    })
}