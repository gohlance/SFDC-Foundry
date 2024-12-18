const _ = require('lodash')

module.exports = {
    getSecurityRisk,
    getCustomApps,

    selectAll_RecordTypesByOrder,

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
    display_Homepage_RecordTypes,
    getAllOrgsByUserId,
    getAllProcessAndFlowByType,
    saveUserOrg,
    deleteUserOrg,debug_select,
    get_childRelationshipDetails,
    get_childRelationshipDetails_Count,
    get_childRelationshipDetails_totalFields,
    get_childRelationshipDetails_RecordType,
    get_childRelationshipDetails_Layout
}

async function check_firstTime_Login(session){
    try {
        let result = await global.pool.query("SELECT * FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY;",[session.orgId])
        //console.log("************ " + result.rowCount )
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

//TODO :This potential have issue because of the orderby 
async function selectAll_RecordTypesByOrder(session){
    let result = await global.pool.query("select elem-> 'Name' as name, elem -> 'SobjectType' as objectType, elem->'IsActive' as active, elem->'Description' as description, elem -> 'BusinessProcessId' as businessprocessid from public.orginformation, lateral jsonb_array_elements(recordtype -> 'records') elem where orgid = $1 order by 2",[session.orgId])
    return result
}

async function getCustomApps(type, session){
    try {
      const result = await global.pool.query("SELECT customappn FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
      const classicInterface = _.partition(result.rows[0]["customappn"].records, function(item){
          return item.UiType == null
      })

      if (type == "HOME"){
          return [result.rows[0]["customappn"].records.length, classicInterface[0].length, classicInterface[1].length]
      }else{
          return [result.rows[0]["customappn"].records, classicInterface]
      }
    } catch (error) {
        console.error("Error [getCustomApps]: " + error)
    }
  }

async function getSecurityRisk(type, session){
    try {
      const result = await global.pool.query("SELECT orgsecurityrisk FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
      if (result.rows[0]["orgsecurityrisk"].records.length > 0){
        const highrisk = _.partition(result.rows[0]["orgsecurityrisk"].records, function (item){
          return item.RiskType == "HIGH_RISK"
        })
        
        if (type == "HOME")
            return [result.rows[0]["orgsecurityrisk"].records.length, highrisk[0].length]
        else
        //HighRisk[1] : everything else that is not highrisk.
            return [highrisk[1], highrisk[0]]
      }else{
        return 0
      }
    } catch (error) {
      console.error("Error [getSecurityRisk]: " + error)
      return 0
    }
  }

async function get_childRelationshipDetails(objectname){
  try {
   // let result = await global.pool.query("select sobjectdescribe from orginformation where orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY",  [global.orgId])

    let result =  await global.pool.query("select elem ->> 'childRelationship_details' as relationship from public.orginformation , lateral jsonb_array_elements(sobjectdescribe -> 'allObject') elem where elem ->> 'Label' = $1 and orgid = $2 ORDER BY createdDate DESC FETCH FIRST ROW only", [objectname, global.orgId])
    let result_json = JSON.parse(result.rows[0].relationship)
    return result_json
  } catch (error) {
    console.log("Error [get_childRelationshipDetails]: " + error)
    return 0
  } 
}

async function get_childRelationshipDetails_totalFields(objectname){
  try {
   // let result = await global.pool.query("select sobjectdescribe from orginformation where orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY",  [global.orgId])

    let result =  await global.pool.query("select elem ->> 'totalfields' as relationship from public.orginformation , lateral jsonb_array_elements(sobjectdescribe -> 'allObject') elem where elem ->> 'Label' = $1 and orgid = $2 ORDER BY createdDate DESC FETCH FIRST ROW only", [objectname, global.orgId])
    let result_json = JSON.parse(result.rows[0].relationship)
    return result_json
  } catch (error) {
    console.log("Error [get_childRelationshipDetails]: " + error)
    return 0
  } 
}

async function get_childRelationshipDetails_RecordType(objectname){
  try {
    let result =  await global.pool.query("select elem ->> 'recordType_details' as recordType from public.orginformation , lateral jsonb_array_elements(sobjectdescribe -> 'allObject') elem where elem ->> 'Label' = $1 and orgid = $2 ORDER BY createdDate DESC FETCH FIRST ROW only", [objectname, global.orgId])
    let result_json = JSON.parse(result.rows[0].recordtype);
    return result_json
  } catch (error) {
    console.log("Error [get_childRelationshipDetails]: " + error)
    return 0
  } 
}
async function get_childRelationshipDetails_Count(objectname){
  try {
    let result =  await global.pool.query("select elem ->> 'childRelationships' as relationship from public.orginformation , lateral jsonb_array_elements(sobjectdescribe -> 'allObject') elem where elem ->> 'Label' = $1 and orgid = $2 ORDER BY createdDate DESC FETCH FIRST ROW only", [objectname, global.orgId])
    let result_json = JSON.parse(result.rows[0].relationship)
    return result_json
  } catch (error) {
    console.log("Error [get_childRelationshipDetails]: " + error)
    return 0
  } 
}

async function get_childRelationshipDetails_Layout(objectname){
  try{
    let result = await global.pool.query("select elem ->> 'Name' as Name , elem->> 'LayoutType' as LayoutType, elem ->> 'ManageableState' as ManageableState, elem ->> 'TableEnumOrId' as TableEnumOrId from public.orginformation , lateral jsonb_array_elements(layout -> 'records') elem where( elem  ->> 'TableEnumOrId' = $1) and orgid = $2 and id = (select id from public.orginformation o order by createdDate desc fetch first row only)",[objectname, global.orgId]);
    return result.rows;
  }catch (error){
    console.log("Error [get_childRelationshipDetails]: " + error);
  }
}

  async function display_Homepage_Objects(session) {
    try {
      const result_object = await global.pool.query('SELECT objectinformation FROM orginformation WHERE orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY', [session.orgId])
      if (result_object.rows[0]["objectinformation"] != null)
        return return_Object = result_object.rows[0]["objectinformation"].length
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
      const result_profile = await global.pool.query("SELECT profile FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
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
      const result_profile = await global.pool.query("SELECT layout FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
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
      const result_profile = await global.pool.query("SELECT recordtype FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
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
      const result_apexcomponent = await global.pool.query("SELECT apexcomponent FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
  
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
      const result_apextrigger = await global.pool.query("SELECT apextrigger FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
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
      const result_apexpages = await global.pool.query("SELECT apexpage FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
  
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
      const result = await global.pool.query("SELECT orglimitsinformation FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
      if (result.rowCount > 0)
        return result.rows[0]["orglimitsinformation"]
      else
        return 0
    } catch (error) {
      console.error("Error [getMoreOrgDetails]: " + error)
      return 0
    }
  }
  async function getUserLicenseDetails(session) {
    try {
      const result = await global.pool.query("SELECT orglicenseinformation FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [session.orgId])
      if (result.rows[0]["orglicenseinformation"].length > 0)
        return result.rows[0]["orglicenseinformation"]
      else {
        return 0
      }
    } catch (error) {
      console.error("Error [getUserLicenseDetails]: " + error)
      return 0
    }
  }
  async function getAllOrgsByUserId(user_id){
    try {
      const result = await global.pool.query("SELECT orgid, orgurl FROM orgs WHERE user_id = $1", [user_id])
      if (result.rowCount == 0)
        return 0
      else
        return result.rows
    } catch (error) {
        console.error("Error [getAllOrgsByUserId] : " + error)
    }
  }
  async function getAllProcessAndFlowByType(session){
    try {
      const result = await global.pool.query("SELECT processflow FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC limit 1", [session.orgId])
      var flows = _.filter(result.rows[0]["processflow"].records, function (o) {
        if (o.ProcessType != "Flow" && o.Status == "Active")
            return o
      })
      var processbuilders = _.filter(result.rows[0]["processflow"].records, function (o) {
        if (o.ProcessType == "Workflow" && o.Status == "Active")
            return o
      })
      return [{"flow" : flows, "process": processbuilders}]
    } catch (error) {
      console.error("Error [getAllProcessAndFlowByType] : " + error)
    }
  }
  async function saveUserOrg(user_id, orgId, orgUrl){
    try {
      const result = await global.pool.query("INSERT INTO orgs (orgid, user_id, orgurl) VALUES ($1, $2, $3)", [orgId, user_id, orgUrl])
    } catch (error) {
      console.error("Error [saveUserOrg] : " + error)
    }
  }
  async function deleteUserOrg(orgId){
    try{
      const reuslt = await global.pool.query("DELETE FROM orgs WHERE orgid = $1",[orgId])
    }catch (error){
      console.error("Error  [deleteUserOrg] : "+ error)
    }
  }
// DEBUG Stuff
  async function debug_select(){
    try {
      const result = await global.pool.query("SELECT processflow_metadata FROM orginformation WHERE id = 2")
      console.log(result)
      return result
    } catch (error) {
       console.log("Er : " + error)
    }
  }

