const sfdcmethods = require('../sfdc-api')
module.exports = ({
  router
}) => {
  router
    .get('home', '/', async (ctx) => {

      if (!global.accesscode || !global.instanceUrl) {
        return ctx.render('index')
      } else {
        return ctx.render('welcome', {
          result_objects: await display_Homepage_Objects(),
          result_profiles: await display_Homepage_Profiles(),
          result_layouts: await display_Homepage_Layouts(),
          result_ApexComponents: await display_Homepage_ApexComponents(),
          result_apexTriggers: await display_Homepage_ApexTrigger(),
          result_apexPages: await display_Homepage_ApexPages(),
          result_recordTypes: await display_Homepage_RecordTypes(),
          result_orgInformation: await getMoreOrgDetails(),
          result_userLicense: await getUserLicenseDetails()
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
      ctx.body = "Contact US...."
    })
    .get('payment', '/payment', (ctx) => {
      return ctx.render('payment')
    })

}

//private methods
async function display_Homepage_Objects() {
  try {
    const result_object = await global.pool.query('SELECT objectinfo FROM objects WHERE orgid = $1', [global.orgId])
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
async function display_Homepage_Profiles() {
  try {
    const result_profile = await global.pool.query("SELECT profile FROM profiles WHERE orgid=$1", [global.orgId])
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
async function display_Homepage_Layouts() {
  try {
    const result_profile = await global.pool.query("SELECT layout FROM layouts WHERE orgid=$1", [global.orgId])
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
async function display_Homepage_RecordTypes() {
  try {
    const result_profile = await global.pool.query("SELECT recordtype FROM recordtypes WHERE orgid=$1", [global.orgId])
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
async function display_Homepage_ApexComponents() {
  try {
    const result_apexcomponent = await global.pool.query("SELECT apexcomponent FROM apexcomponents WHERE orgid=$1", [global.orgId])

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
async function display_Homepage_ApexTrigger() {
  try {
    const result_apextrigger = await global.pool.query("SELECT apextrigger FROM apextriggers WHERE orgid=$1", [global.orgId])
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
async function display_Homepage_ApexPages() {
  try {
    const result_apexpages = await global.pool.query("SELECT apexpage FROM apexpages WHERE orgid=$1", [global.orgId])

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

async function getMoreOrgDetails() {
  try {
    const result = await sfdcmethods.get_Org_limitInfo()
    return result.data
  } catch (error) {
    console.error("Error [getMoreOrgDetails]: " + error)
    return 0
  }
}

async function getUserLicenseDetails() {
  try {
    const result = await global.pool.query("SELECT license FROM license WHERE orgid=$1", [global.orgId])
    if (result.rows[0]["license"].length > 0)
      return result.rows[0]["license"]
    else{
      return sfdcmethods.get_UserWithLicense2()
    }
    
  } catch (error) {
    console.error("Error [getUserLicenseDetails]: " + error)
    return 0
  }
}