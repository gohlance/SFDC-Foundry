//global Oauth setting
const jsforce = require('jsforce')

const _ = require('lodash')
var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://warm-garden-23298.herokuapp.com/auth3/login/return'
});

const Pool = require('pg-pool')
const pool = new Pool({
    user: 'bxhbybpvxuyesk',
    host: 'ec2-54-174-221-35.compute-1.amazonaws.com',
    database: 'detjik593i3enh',
    password: '6ec25f57a5d561b4a6eb6e8cd93b8de3f1dbae20fed0dc55b484637bd7ef1489',
    port: 5432,
    max: 20, // set pool max size to 20
    min: 4
})

//*** Only for Development */
//global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
//global.accesscode = "00D46000001Uq6O!AQoAQFW6oeGb05mKZhJkWUDv.ebasyzT3SaXbiSxtuWuNIYHZ51mhG7xNH41NAuT_pWRVckQ375OvEYDPHsP7chkyx7iVkEw"
//global.orgId = "188"

var conn = new jsforce.Connection({
    oauth2: oauth2
    //oauth2: oauth2,
    //instanceUrl: global.instanceUrl,
    //accessToken: global.accesscode
})

module.exports = {
    getSecurityRisk,
    getCustomApps,

    selectAll_RecordTypesByOrder,
    get_childRelationship,
    check_firstTime_Login,
//NOTE: Unused Methods
    selectAll_ProfilesByOrder,get_childRelationship_chart,

    //testing
    get_testing
}

async function check_firstTime_Login(session){
    try {
        let result = await global.pool.query("SELECT * FROM metas WHERE orgid=$1",[session.orgId])
        if (result.rows > 0){
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

async function selectAll_ProfilesByOrder(session) {
    let result = await global.pool.query("select elem->'Name' as name, elem->'Description' as description  from public.profiles, lateral jsonb_array_elements(profile -> 'records') elem WHERE orgid = $1",[session.orgId])
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

    let unique_Object = _(json_result).groupBy('childSObject').partition(function (item){
        return item.relationshipName != null
    })

    let unique_Object2 = _(json_result).partition(function (item){
        return item.relationshipName == null
    }).value()

    let newObject3 = _.groupBy(unique_Object2[1],'childSObject')

    let chart_schema = "classDiagram\n"
    Object.keys(newObject3).forEach(function (item){
        chart_schema = chart_schema + objectName + " <|-- " + item + "\n"
    })
    return chart_schema
   // return result
}

async function get_childRelationship_chart(objectName, session){
    let result = await global.pool.query("select elem ->> 'childRelationship_details' as relationship from public.objects , lateral jsonb_array_elements(objectinfo -> 'allObject') elem where elem ->> 'Label' = $1 and orgid = $2",  [objectName,session.orgId])

    const json_result = JSON.parse(result.rows[0]["relationship"])

    let unique_Object = _.groupBy(json_result,'childSObject')
    let chart_schema = "classDiagram\n"
    Object.keys(unique_Object).forEach(function (item){
        unique_Object[item].forEach(function (subitem){
            chart_schema = chart_schema + objectName + " : " + subitem.field  + "\n"
        }) 
    })
    return chart_schema
   // return result
}

async function testing_recordsquery(){
   // let result =  conn.query("select count() from account where recordtype = 'Account'")
    conn.query("SELECT count() FROM Account where recordtypeid = '012460000011jC3AAI'", function(err, result) {
        if (err) { return console.error(err); }
        console.log("total : " + result.totalSize);
        console.log("fetched : " + result.records.length);
      });
    //console.log(result);
}

async function testing_getApexPageByLastModified(){
    conn.query("SELECT Name, LastModifiedDate FROM ApexPage order by Lastmodifieddate desc", function (err, result){
        if (err) { return console.error(err); }
        console.log(result);
        console.log("fetched : " + result.records.length);
    });
}

async function testing_getUserPackageLicense(){
    conn.query("Select Id, Name, Profile.UserLicense.Name From User Where Profile.UserLicense.Name = 'Salesforce'", function (err, result){
    if (err) { return console.error("Error " +  err)}
    console.log(result);
});
}


async function get_testing(ctx){
    ctx.session.accesscode = "ABC"
}

//#region Private Methods - Unused
function chunkArrayInGroups(arr, size) {
    return new Promise((resolve, reject) => {
        var myArray = [];
        var tempArry = arr
        for (var i = 0; i < tempArry.length; i++) {
            if (tempArry[i].includes('SBQQ')) {
                tempArry.splice(i, 1);
            }
        }

        for (var i = 0; i < tempArry.length; i += size) {
            myArray.push(tempArry.slice(i, i + size));
        }
        resolve(myArray)
    });
}


//Unused
async function filter_RecordTypesBy (sobjectname){
    let result = await global.pool.query("select elem from public.recordtypes, lateral jsonb_array_elements(recordtype ->'records') elem where elem @> '{\"SobjectType\":\"$1\"}' and orgid = $2;", [sobjectname,global.orgId])
    //result.rows[0].elem
    return result
}

//#endregion


/**
 * Get metadata for profiles and for layouts. The layouts metadata provides you a full list of page layouts across all objects, while the profile files contain the info on which page layout/record type combos the profile is associated with.

Compare the profiles' assignments to page layouts to the list of page layouts. I did this using some scripting code which parsed through the xml files.
 */

/**
 * Objects - Triggers on Same Event
 * Objects - Validation Rules Active
 */