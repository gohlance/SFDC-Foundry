const _ = require('lodash')

module.exports = {
    getSecurityRisk,
    getCustomApps,

    selectAll_RecordTypesByOrder,
    get_childRelationship,
    check_firstTime_Login,
    //Welcome Page Method
    getUserLicenseDetails,
    getMoreOrgDetails,
    display_Homepage_ApexPages,
    display_Homepage_ApexTrigger,
    display_Homepage_ApexComponents,
    display_Homepage_Layouts,
    display_Homepage_Objects,
    display_Homepage_Profiles,
    display_Homepage_RecordTypes
}

async function check_firstTime_Login(session){
    try {
        let result = await global.pool.query("SELECT * FROM metas WHERE orgid=$1",[session.orgId])
        console.log("************ " + result.rowCount )
        if (result.rowCount > 0){
            return true
        }else{
            return false
        }
    } catch (error) {
        console.log("Error [check_firstTime_Login] : " + error)
        return false //this is for first time
    }
}

async function selectAll_RecordTypesByOrder(session){
    let result = await global.pool.query("select elem-> 'Name' as name, elem -> 'SobjectType' as objectType, elem->'IsActive' as active, elem->'Description' as description, elem -> 'BusinessProcessId' as businessprocessid from public.recordtypes, lateral jsonb_array_elements(recordtype -> 'records') elem where orgid = $1 order by 2",[session.orgId])
    return result
}

async function getCustomApps(type, session){
    try {
      const result = await global.pool.query("SELECT customapp FROM customapps WHERE orgid=$1", [session.orgId])
      const classicInterface = _.partition(result.rows[0]["customapp"].records, function(item){
          return item.UiType == null
      })

      if (type == "HOME"){
          return [result.rows[0]["customapp"].records.length, classicInterface[0].length, classicInterface[1].length]
      }else{
          return [result.rows[0]["customapp"].records, classicInterface]
      }
    } catch (error) {
        console.error("Error [getCustomApps]: " + error)
    }
  }

async function getSecurityRisk(type, session){
    try {
      const result = await global.pool.query("SELECT securityrisk FROM securityrisk WHERE orgid=$1", [session.orgId])
      if (result.rows[0]["securityrisk"].length > 0){
        const highrisk = _.partition(result.rows[0]["securityrisk"], function (item){
          return item.RiskType == "HIGH_RISK"
        })
        if (type == "HOME")
            return [result.rows[0]["securityrisk"].length, highrisk[0].length]
        else
            return [result.rows[0]["securityrisk"], highrisk[0]]
      }else{
        return 0
      }
    } catch (error) {
      console.error("Error [getSecurityRisk]: " + error)
      return 0
    }
  }

//unique_object[item] - get key value - which is an array to get the fields that is linked
async function get_childRelationship(objectName, session){
    let result = await global.pool.query("select elem ->> 'childRelationship_details' as relationship from public.objects , lateral jsonb_array_elements(objectinfo -> 'allObject') elem where elem ->> 'Label' = $1 and orgid = $2",  [objectName,session.orgId])

    const json_result = JSON.parse(result.rows[0]["relationship"])

    let unique_Object2 = _(json_result).partition(function (item){
        return item.relationshipName == null
    }).value()

    let newObject3 = _.groupBy(unique_Object2[1],'childSObject')

    let chart_schema = "classDiagram\n"
    Object.keys(newObject3).forEach(function (item){
        chart_schema = chart_schema + objectName + " <|-- " + item + "\n"
    })
    return chart_schema
}

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
      const result = await global.pool.query("SELECT orglimit FROM orglimits WHERE orgid=$1", [session.orgId])
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
      else {
        return 0
      }
  
    } catch (error) {
      console.error("Error [getUserLicenseDetails]: " + error)
      return 0
    }
  }