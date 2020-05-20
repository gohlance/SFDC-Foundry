//#region Init Variable
const {
    Worker
} = require('worker_threads')

const jsforce = require('jsforce')

const _ = require('lodash')

var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://warm-garden-23298.herokuapp.com/auth3/login/return'
});

const axios = require('axios')
const Pool = require('pg-pool')
//DEV

var conn = new jsforce.Connection({
    oauth2: oauth2,
    instanceUrl: global.instanceUrl,
    accessToken: global.accesscode,
    version: '48.0'
})

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Beaver2',
    password: 'P@ssw0rd1',
    port: 5432,
    max: 20, // set pool max size to 20
    min: 4
  }) 

//#endregion
/**
var conn = new jsforce.Connection({
    oauth2: oauth2,
    version: '48.0'
    // instanceUrl: global.instanceUrl,
    // accessToken: global.accesscode
})

const pool = new Pool({
    user: 'bxhbybpvxuyesk',
    host: 'ec2-54-174-221-35.compute-1.amazonaws.com',
    database: 'detjik593i3enh',
    password: '6ec25f57a5d561b4a6eb6e8cd93b8de3f1dbae20fed0dc55b484637bd7ef1489',
    port: 5432,
    max: 20, // set pool max size to 20
    min: 4
}) 
 */
module.exports = {
    getAllMeta,
    getAllLayout,
    getAllRecordType,
    getAllProfile,
    get_TotalUsersByProfile,
    getAllProfile2Layout,
    getAllValidationRules,
    getAllWorkflowRules,
    getAllBusinessProcess,
    getAllCustomApplication,
    getAllApexTrigger,
    getAllApexPage,
    getAllApexComponent,
    getAllApexClass,
    get_UserWithLicense2,
    get_Org_limitInfo,
    getAllObjectOnce,
    sObjectDescribe,
    getAllSecurityRisk,
    letsGetEverything,
    set_ConnObject,
    insertBackgroundData,
    getAllProcessBuilderANDFlow,
    getMoreDetails_ProcessbuilderAndFlow, insertDataDebugMode
}

async function insertBackgroundData(orgid, meta, objectinfo, license, orglimit, securityrisk, sobject, apextrigger, apexpage, apexclass, apexcomponent, profile, userbyProfile, layout, profilelayout, customapp,businessprocess, workflowrules, validationRules, recordtype, processflow, processflow_meta){
    try {
        let sqlid = await pool.query("INSERT INTO orginformation (orgid, metainformation, objectinformation, orgLicenseInformation, orgLimitsInformation, orgSecurityRisk, sobjectdescribe, apextrigger, apexpage, apexclass, apexcomponent, profile, profile_user, layout, profileslayout, customAppn, businessprocess, workflowrule, validationrule, recordtype, processflow, processflow_metadata) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING id",[orgid, meta, objectinfo, license, orglimit, securityrisk, sobject, apextrigger, apexpage, apexclass, apexcomponent, profile, userbyProfile, layout, profilelayout, customapp, businessprocess, workflowrules, validationRules, recordtype, processflow, processflow_meta])

        console.log("Returning ID from SQL insert : " + sqlid)
     } catch (error) {
         console.log("Error from SQL : " + error)
     }
}

async function letsGetEverything(session) {
    try {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./svc_background/backgroundsvc.js', {
                workerData: {
                    instance: session.instanceUrl,
                    accesscode: session.accesscode,
                    orgId: session.orgId
                }
            });
            
            console.log("Worker Started")
            worker.on ('message', resolve("Success"));
            //worker.on('message', (message) => {
            //    console.log("Completed !!!! I am here " + message.status);
            //    //resolve("Success")
            //    return "Success"
            //});
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0)
                    reject(new Error(`Worker stopped with exit code ${code}`));
            })
        })
    } catch (error) {
        console.log("Error [sfdc-api/letsGetEverything] : " + error)
    }
}

function set_ConnObject(workerData) {
    conn.accessToken = workerData.accesscode
    conn.instanceUrl = workerData.instance
}

async function getAllMeta() {
    try {
        return new Promise((resolve, reject) => {
            conn.metadata.describe().then(response => {
                console.log("[sfdc-api/getAllMeta] : " + response)
                resolve(response)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllMeta]: " + error)
    }
}
async function getAllObjectOnce() {
    try {
        return new Promise((resolve, reject) => {
            conn.describeGlobal(async function (err, res) {
                if (err) {
                    return console.error("Error [sfdc-api/getAllObjectsOnce - describeGlobal] : " + err)
                }
                console.log('[sfdc-api/getAllObjectsOnce] No of Objects ' + res.sobjects.length)
                //resolve(res.sobjects)
                console.log("GetAllObject Once : " + res)
                jsonResult = await sObjectDescribe(res.sobjects)
                console.log("GetAllObject Once Returning")
                resolve([res.sobjects, jsonResult])
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllObjectsOnce] : " + error)
    }
}

async function getAllApexTrigger() {
    try {
        return new Promise((resolve, reject) => {
            console.log("Conn : " + conn.accessToken)
            conn.tooling.query("SELECT Name,BodyCrc,ApiVersion, Status, IsValid, EntityDefinitionId,UsageAfterDelete, UsageAfterInsert,UsageAfterUndelete,UsageAfterUpdate,UsageBeforeDelete,UsageBeforeInsert,UsageBeforeUpdate,UsageIsBulk FROM ApexTrigger", function (error, result) {
                if (error) {
                    console.log("Error [sfdc-api/getAllApexTrigger - conn.tooling] : " + error)
                }
                console.log("[sfdc-api/getAllApexTrigger] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllApexTrigger] : " + error)
    }
}
async function getAllApexPage() {
    try {
        return new Promise((resolve, reject) => {            
            conn.tooling.query("SELECT Name, NamespacePrefix, ApiVersion FROM ApexPage", function (error, result) {
                if (error) {
                    console.log("Error [sfdc-api/getAllApexPage - conn.tooling] : " + error)
                }
                console.log("[sfdc-api/getAllApexPage] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllApexPage] : " + error)
    }
}
async function getAllApexClass() {
    try {
        return new Promise((resolve) => {
              conn.tooling.query("SELECT Name, NamespacePrefix, ApiVersion, Status, IsValid FROM ApexClass", function (error, result) {
                if (error) {
                    console.log("Error [sfdc-api/getAllApexClass - conn.tooling] : " + error)
                }
                console.log("[sfdc-api/getAllApexClass] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllApexClass] : " + error)
    }
}
async function getAllApexComponent() {
    try {
        return new Promise((resolve) => {
            conn.tooling.query("SELECT Name, NamespacePrefix, ApiVersion FROM ApexComponent", function (error, result) {
                if (error) {
                    console.log("Error [sfdc-api/getAllApexComponent - conn.tooling] : " + error)
                }
                console.log("[sfdc-api/getAllApexComponent] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllApexComponent] : " + error)
    }
}

async function getAllLayout() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT Name, LayoutType, ManageableState, TableEnumOrId FROM Layout", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllLayout]: " + err)
                }
                console.log("[sfdc-api/getAllLayout] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllLayout] : " + error)
    }
}
//Average 1 seconds
async function getAllProfile() {
    try {
        return new Promise((resolve) => {
            conn.tooling.query("SELECT Description, Name FROM Profile", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllProfile]: " + err)
                }
                console.log("[sfdc-api/getAllProfile] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllProfile] : " + error)
    }
}
async function getAllProfile2Layout() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT LayoutId, ProfileId, RecordTypeId, TableEnumOrId FROM ProfileLayout", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllProfile2Layout]: " + err)
                }
                console.log("[sfdc-api/getAllProfile2Layout] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllProfile2Layout] : " + error)
    }

}
async function getAllRecordType() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT BusinessProcessId, Description, Name, IsActive,ManageableState,SobjectType FROM RecordTYpe", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllRecordType] : " + err)
                }
                console.log("[sfdc-api/getAllRecordType] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllRecordType] : " + error)
    }
}
async function getAllValidationRules() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT Active, Description,ErrorDisplayField,Id, ManageableState,NamespacePrefix,ValidationName FROM ValidationRule", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllValidationRules] : " + err)
                }
                console.log("[sfdc-api/getAllValidationRules] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllValidationRules] : " + error)
    }
}
async function getAllWorkflowRules() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT ManageableState,Name,TableEnumOrId FROM WORKFLOWRULE", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllWorkflowRules] : " + err)
                }
                console.log("[sfdc-api/getAllWorkflowRules] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllWorkflowRules] : " + error)
    }
}
async function getAllBusinessProcess() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT Description,IsActive,ManageableState, Name FROM BusinessProcess", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllBusinessProcess] : " + err)
                }
                console.log("[sfdc-api/getAllBusinessProcess] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllBusinessProcess] : " + error)
    }
}
async function getAllCustomApplication() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT Description,DeveloperName,ManageableState,NavType,UiType FROM CustomApplication", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllCustomApplication] : " + err)
                }
                console.log("[sfdc-api/getAllCustomApplication] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllCustomApplication] : " + error)
    }  
}
async function get_TotalUsersByProfile() {
    try {
        return new Promise((resolve, reject) => {
            conn.query("select count(id) Total ,profile.name from user  WHERE Profile.UserLicense.Name != null group by profile.name", function (err, result) {
                if (err) {
                    return console.error("Error " + err)
                }
                let totalUserLicense = _(result.records).groupBy('Profile.UserLicense.Name').value()
                console.log("[sfdc-api/get_TotalUsersByProfile] : " + totalUserLicense)
                resolve(totalUserLicense)
            });
        })
    } catch (error) {
        console.error("Error [sfdc-api/get_TotalUsersByProfile] : " + error)
    }
}
async function sObjectDescribe(result) {
    var result2 = filter_BeforeCallingAPI(result)
    //console.log(result);
    console.log("I am starting SobjectDescribe")
    //TODO : this section can do child relationship
    try {
        let lessthan100fields = 0;
        let morethan100fields = 0;
        const pLimit = require('p-limit');
        const limit = pLimit(100);

        let allObjectTotalFields = await Promise.all(result2.map(async (item) => limit(async () => {
            var totalfields = await conn.sobject(item.name).describe().then(async response => {

                return {
                    totalfields: response.fields.length,
                    layout: response.namedLayoutInfos.length,
                    childRelatioship: response.childRelationships.length,
                    recordType: response.recordTypeInfos.length,
                    createable: response.createable,
                    deletable: response.deletable,
                    childRelationship_details: response.childRelationships,
                    undeletable: response.undeletable
                }
            })

            if (totalfields.totalfields > 100) {
                morethan100fields++
            } else {
                lessthan100fields++
            }

            return {
                Objectname: item.name,
                totalfields: totalfields.totalfields,
                Custom: item.custom,
                Label: item.label,
                childRelationships: totalfields.childRelationships,
                recordType: totalfields.recordType,
                layout: totalfields.layout,
                createable: totalfields.createable,
                deletable: totalfields.deletable,
                undeletable: totalfields.undeletable,
                childRelationship_details: totalfields.childRelationship_details
            }
        })))
        let jsonResult = {
            allObject: allObjectTotalFields,
            morethan100: morethan100fields,
            lessthan100: lessthan100fields
        }

        return jsonResult

    } catch (err) {
        console.log("Error [sfdc-api/sObjectDescribe]" + err)
    }
}

async function get_UserWithLicense2() {
    try {
        return new Promise((resolve, reject) => {
            conn.query("SELECT LicenseDefinitionKey, MasterLabel, MonthlyLoginsEntitlement, MonthlyLoginsUsed, Name, Status, TotalLicenses, UsedLicenses,UsedLicensesLastUpdated FROM UserLicense", function (err, result) {
                if (err) {
                    return console.error("Error : " + err)
                }
                console.log("[sfdc-api/get_UserWithLicense2] : " + result.records)
                resolve(result.records)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/get_UserWithLicense2] : " + error)
    }
}
async function get_Org_limitInfo(accesscode, instanceurl) {
    try {
        const headers = {
            'Authorization': 'Bearer ' + accesscode,
            'X-PrettyPrint': 1,
        };
        return await axios.get(instanceurl + '/services/data/v45.0/limits/', {
            headers
        })
    } catch (error) {
        console.error("Error [sfdc-api/get_Org_limitInfo] : " + error)
    }
}

async function getAllSecurityRisk() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT RiskType, Setting, SettingGroup, OrgValue, StandardValue FROM SecurityHealthCheckRisks", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllCustomApplication] : " + err)
                }
                console.log("[sfdc-api/getAllSecurityRisk] : " + result)
                resolve(_.defaultTo(result.records, "{0}"))
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllSecruityRisk] : " + error)
    }
}

async function insertDataDebugMode(result){
    await pool.query("Update orginformation SET processflow_metadata = $1 WHERE id = 2", [JSON.stringify(result)])
}

async function getAllProcessBuilderANDFlow() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT DefinitionId, Description, IsTemplate, ManageableState, MasterLabel, ProcessType, RunInMode, Status, VersionNumber FROM FLOW", function (error, result) {
                if (error) {
                    console.log("Error [sfdc-api/getAllProcessBuilder - conn.tooling] : " + error)
                }
                console.log("[sfdc-api/getAllProcessBuilder] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllProcessBuilder] : " + error)
    }
}

async function getMoreDetails_ProcessbuilderAndFlow() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT DefinitionId, VersionNumber, Status FROM FLOW WHERE Status = 'Active' GROUP BY DefinitionId, VersionNumber, Status ORDER BY DefinitionId ",async function (error, result) {
                if (error) {
                    console.log("Error [sfdc-api/getAllProcessBuilder - conn.tooling] : " + error)
                }
                //console.log("[sfdc-api/getAllProcessBuilder] : " + result)
                let finalJson = await getEachProcessDefinition(result)
                //need to use JSON.parse to get back JSON object
                resolve(finalJson)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllProcessBuilder] : " + error)
    }
}

//PRIVATE Methods Section

//PRIVATE function for getMoreDetails_ProcessbuilderAndFlow
async function getEachProcessDefinition(result){
    try {
        var tempArray = await Promise.all( result.records.map(async item => {
            var something = await conn.tooling.query("SELECT FullName, DefinitionId, Metadata FROM FLOW Where DefinitionId = '" + item.DefinitionId + "' AND VersionNumber =" + item.VersionNumber)
            //return  JSON.stringify(something.records[0])
            return something.records
        }))
        return tempArray 
    }catch (error){
        console.error("Erro [axxx] " + error)
    }   
te}

function filter_BeforeCallingAPI(result) {
    console.log("result : " + result.length)
    var custom_is_false = _.filter(result, function (o) {
        if (o.custom == false)
            return o
    })
    console.log("*******************")
    console.log(custom_is_false.length)

    var layoutable_is_true = _.filter(custom_is_false, function (i) {
        if (i.layoutable == true) {
            return i
        }
    })

    console.log(layoutable_is_true.length)

    var createable_is_true = _.filter(layoutable_is_true, function (i) {
        if (i.createable == true) {
            return i
        }
    })

    console.log(createable_is_true.length)

    return createable_is_true
}