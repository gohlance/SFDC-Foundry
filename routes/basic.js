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
        if (check_existingUser == false){
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
        }else{
          return ctx.render('welcome', {
            result_objects: await display_Homepage_Objects(ctx.session),
            result_profiles: await display_Homepage_Profiles(ctx.session),
            result_layouts: await display_Homepage_Layouts(ctx.session),
            result_ApexComponents: await display_Homepage_ApexComponents(ctx.session),
            result_apexTriggers: await display_Homepage_ApexTrigger(ctx.session),
            result_apexPages: await display_Homepage_ApexPages(ctx.session),
            result_recordTypes: await display_Homepage_RecordTypes(ctx.session),
            result_orgInformation: await getMoreOrgDetails(ctx.session),
            result_userLicense: await getUserLicenseDetails(ctx.session),
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
      ctx.session.accesscode ="asd"
      ctx.session.orgId = "168"
      ctx.session.instanceUrl = "facebook.com"
      ctx.body = "Contact US...."
    })
    .get('payment', '/payment', (ctx) => {
      return ctx.render('payment')
    })
}

//private methods
async function display_Homepage_Objects(session) {
  try {
    const result_object = await global.pool.query('SELECT objectinfo FROM objects WHERE orgid = $1', [session.orgId])
    if (result_object.rows[0]["objectinfo"] != null)
      return return_Object = result_object.rows[0]["objectinfo"]["allObject"].length
    else
      return return_Object = 0
  } catch (error) {
    if (error instanceof TypeError)
      return 0
    else
      console.error("Error [display_Homepage_Objects]: " + error)
  }
}
async function display_Homepage_Profiles(session) {
  try {
    const result_profile = await global.pool.query("SELECT profile FROM profiles WHERE orgid=$1", [session.orgId])
    if (result_profile.rows[0]["profile"].size > 0)
      return result_profile.rows[0]["profile"].size
    else
      return 0
  } catch (error) {
    if (error instanceof TypeError)
      return 0
    else
      console.error("Error [display_Homepage_Profiles]: " + error)
  }
}
async function display_Homepage_Layouts(session) {
  try {
    const result_profile = await global.pool.query("SELECT layout FROM layouts WHERE orgid=$1", [session.orgId])
    if (result_profile.rows[0]["layout"].size > 0)
      return result_profile.rows[0]["layout"].size
    else
      return 0
  } catch (error) {
    if (error instanceof TypeError)
      return 0
    else
      console.error("Error [display_Homepage_Layouts]: " + error)
  }
}
async function display_Homepage_RecordTypes(session) {
  try {
    const result_profile = await global.pool.query("SELECT recordtype FROM recordtypes WHERE orgid=$1", [session.orgId])
    if (result_profile.rows[0]["recordtype"].size > 0)
      return result_profile.rows[0]["recordtype"].size
    else
      return 0
  } catch (error) {
    if (error instanceof TypeError)
      return 0
    else
      console.error("Error [display_Homepage_RecordTypes]: " + error)
  }
}
async function display_Homepage_ApexComponents(session) {
  try {
    const result_apexcomponent = await global.pool.query("SELECT apexcomponent FROM apexcomponents WHERE orgid=$1", [session.orgId])

    if (result_apexcomponent.rows[0]["apexcomponent"].size > 0)
      return result_apexcomponent.rows[0]["apexcomponent"].size
    else
      return 0

  } catch (error) {
    if (error instanceof TypeError)
      return 0
    else
      console.error("Error [display_Homepage_ApexComponents]: " + error)
  }
}
async function display_Homepage_ApexTrigger(session) {
  try {
    const result_apextrigger = await global.pool.query("SELECT apextrigger FROM apextriggers WHERE orgid=$1", [session.orgId])
    if (result_apextrigger.rows[0]["apextrigger"].size > 0)
      return result_apextrigger.rows[0]["apextrigger"].size
    else
      return 0
  } catch (error) {
    if (error instanceof TypeError)
      return 0
    else
      console.error("Error [display_Homepage_ApexTrigger]: " + error)
  }
}
async function display_Homepage_ApexPages(session) {
  try {
    const result_apexpages = await global.pool.query("SELECT apexpage FROM apexpages WHERE orgid=$1", [session.orgId])

    if (result_apexpages.rows[0]["apexpage"].size > 0)
      return result_apexpages.rows[0]["apexpage"].size
    else
      return 0
  } catch (error) {
    if (error instanceof TypeError)
      return 0
    else
      console.error("Error [display_Homepage_ApexPages]: " + error)
  }
}

async function getMoreOrgDetails(session) {
  try {
    const result = await global.pool.query("SELECT orglimit FROM orglimits WHERE orgid=$1",[session.orgId])
    // BUG  - TypeError: Cannot read property 'orglimit' of undefined
    if (result.rows[0]["orglimit"].size > 0)
      return result.rows[0]["orglimit"]
    else
      return 0
  } catch (error) {
    console.error("Error [getMoreOrgDetails]: " + error)
    return 0
  }
}

async function getUserLicenseDetails(session) {
  try {
    // BUG - TypeError: Cannot read property 'license' of undefined
    const result = await global.pool.query("SELECT license FROM license WHERE orgid=$1", [session.orgId])
    if (result.rows[0]["license"].length > 0)
      return result.rows[0]["license"]
    else{
      return 0
    }
    
  } catch (error) {
    console.error("Error [getUserLicenseDetails]: " + error)
    return 0
  }
}