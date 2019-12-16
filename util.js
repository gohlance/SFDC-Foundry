const jsforce = require('jsforce')
var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://testingauth123.herokuapp.com/auth3/login/return'
});

module.exports = {
    //Average Run: 3,637 ms to 4,000 ms
    getAllObjects: getAllObjects,
    getAllApex: getAllApex,
    getAllMeta: getAllMeta,
    getAllLayout,
    getAllProfile,getAllRecordType,getAllProfile2Layout,getAllValidationRules,getAllWorkflowRules,getAllBusinessProcess,getAllCustomApplication,
    letsGetEverything
}

async function letsGetEverything(conn, pool){
    const step1 = new Promise(async (resolve)=>{
        const result = getAllMeta(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO metas (orgid, meta) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 1 : " + error))
    .finally(console.log("Step 1 done"))


    const step2 = new Promise(async(resolve) =>{
        const result = getAllLayout(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO layouts (orgid, layout) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 2 : " + error))
    .finally(console.log("Step 2 done"))

    const step3 = new Promise(async(resolve) =>{
        const result = getAllRecordType(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO recordtypes (orgid, recordtype) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 3 : " + error))
    .finally(console.log("Step 3 done"))

    const step4 = new Promise(async(resolve) =>{
        const result = getAllProfile(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO profiles (orgid, profile) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 4 : " + error))
    .finally(console.log("Step 4 done"))

    const step5 = new Promise(async(resolve) =>{
        const result = getAllProfile2Layout(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO profileslayouts (orgid, profileslayout) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 5 : " + error))
    .finally(console.log("Step 5 done"))

    const step6 = new Promise(async(resolve) =>{
        const result = getAllValidationRules(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO validationrules (orgid, validationrule) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 6 : " + error))
    .finally(console.log("Step 6 done"))

    const step7 = new Promise(async(resolve) =>{
        const result = getAllWorkflowRules(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO workflowrules (orgid, workflowrule) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 7 : " + error))
    .finally(console.log("Step 7 done"))

    const step8 = new Promise(async(resolve) =>{
        const result = getAllBusinessProcess(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO businessprocess (orgid, businessprocess) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 8 : " + error))
    .finally(console.log("Step 8 done"))

    const step9 = new Promise(async(resolve) =>{
        const result = getAllCustomApplication(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO customapps (orgid, customapp) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 9 : " + error))
    .finally(console.log("Step 9 done"))

    const step10 = new Promise(async (resolve)=>{
        const result = await getAllApex(conn, "ApexTrigger");
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO apextriggers (orgid, apextrigger) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 10 : " + error))
    .finally(console.log("Step 10 done"))

    const step11 = new Promise(async (resolve)=>{
        const result = await getAllApex(conn, "ApexPage");
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO apexpages (orgid, apexpage) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 11 : " + error))
    .finally(console.log("Step 11 done"))

    const step12 = new Promise(async (resolve)=>{
        const result = await getAllApex(conn, "ApexClass");
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO apexclass (orgid, apexclass) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 12: " + error))
    .finally(console.log("Step 12 done"))

    const step13 = new Promise(async (resolve)=>{
        const result = await getAllApex(conn, "ApexComponent");
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO apexcomponent (orgid, apexcomponent) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 12: " + error))
    .finally(console.log("Step 12 done"))

    const step14 = new Promise(async (resolve) =>{
        const result = await getAllObjects(conn)
        resolve(result)
    })
    .then(result => pool.query("INSERT INTO objects (orgid, objectinfo) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)]))
    .catch(error => console.log("Step 14 : " + error))
    .finally(console.log("Step 14 done"))

    Promise.all([step1, step2, step3, step4, step5, step6, step7, step8, step9, step10])
}

async function getAllMeta(conn) {
    try {
        return new Promise((resolve, reject) => {
            conn.metadata.describe().then(response => {
                resolve(response)
            })
        })
    } catch (err) {
        console.log("Error [util/getAllMeta]: " + err)
    }
}

//33 seconds run time for 2050 objects
async function getAllObjects(conn) {
    try {
        
        return new Promise((resolve, reject) => {
            conn.describeGlobal(function (err, res) {
                if (err) {
                    return console.log(err)
                }
                console.log('[util/getAllObjects] No of Objects ' + res.sobjects.length)

                resolve(res.sobjects)
            })
        }).then(result => sObjectDescribe(conn, result))
       
    } catch (err) {
        console.log("[util/getAllObjects]" + err)
    }
}

async function sObjectDescribe(conn, result) {
    //TODO : this section can do child relationship
    try {
        var i = 0;
        var lessthan100fields = 0;
        var morethan100fields = 0;
        const pLimit = require('p-limit');
        const limit = pLimit(100);
       
        var i = 1
        var allObjectTotalFields = await Promise.all(result.map(async (item) => limit(async () => {

            var totalfields = await conn.sobject(item.name).describe().then(async response => {
                return {
                    totalfields: response.fields.length,
                    layout: response.namedLayoutInfos.length,
                    childRelatioship: response.childRelationships.length,
                    recordType: response.recordTypeInfos.length,
                    createable: response.createable,
                    deletable: response.deletable,
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
                undeletable: totalfields.undeletable
            }
        })))

        return {
            allObject: allObjectTotalFields,
            morethan100: morethan100fields,
            lessthan100: lessthan100fields
        }
    } catch (err) {
        console.log("[util/sObjectDescribe]" + err)
    }
}

async function getAllApex(conn, type) {
    //TODO: Check what can ApexPage, ApexClass and ApexComponent return
    return new Promise((resolve, reject) => {
        var query = ""
        if (type == "ApexTrigger") {
            query = "SELECT Name, TableEnumOrId, NamespacePrefix, ApiVersion, Status, IsValid FROM ApexTrigger"
        } else if (type == "ApexPage") {
            query = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexPage"
        } else if (type == "ApexClass") {
            query = "SELECT Name, NamespacePrefix, ApiVersion, Status, IsValid FROM ApexClass"
        } else if (type == "ApexComponent") {
            query = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexComponent"
        }

        conn.tooling.query(query, function (err, result) {
            if (err) {
                console.log(err)
            }
            console.log("[util/getAllApex] : " + result)
            resolve(result)
        })
    })
}

async function getAllLayout(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Name, LayoutType, ManageableState, TableEnumOrId FROM Layout", function (err, result) {
            if (err) {
                console.log("Error [util/getAllLayout]: " + err)
            }
            console.log("[util/getAllLayout] : " + result)
            resolve(result)
        })
    })
}

//Average 1 seconds
async function getAllProfile(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Description, Name FROM Profile", function (err, result) {
            if (err) {
                console.log("Error [util/getAllProfile]: " + err)
            }
            console.log("[util/getAllProfile] : " + result)
            resolve(result)
        })
    })
}

async function getAllProfile2Layout(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT LayoutId, ProfileId, RecordTypeId, TableEnumOrId FROM ProfileLayout", function (err, result) {
            if (err) {
                console.log("Error [util/getAllProfile2Layout]: " + err)
            }
            console.log("[util/getAllProfile2Layout] : " + result)
            resolve(result)
        })
    })
}

async function getAllRecordType(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT BusinessProcessId, Description, Name, IsActive,ManageableState,SobjectType FROM RecordTYpe", function (err, result) {
            if (err) {
                console.log("Error [util/getAllRecordType] : " + err)
            }
            console.log("[util/getAllRecordType] : " + result)
            resolve(result)
        })
    })
}

//TODO : May need to do after SOBJECTDESCRIBE.
async function getAllValidationRules(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Active, Description,ErrorDisplayField,Id, ManageableState,ValidationName FROM ValidationRule", function (err, result) {
            if (err) {
                console.log("Error [util/getAllValidationRules] : " + err)
            }
            console.log("[util/getAllValidationRules] : " + result)
            resolve(result)
        })
    })
}

async function getAllWorkflowRules(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT ManageableState,Name,TableEnumOrId FROM WORKFLOWRULE", function (err, result) {
            if (err) {
                console.log("Error [util/getAllWorkflowRules] : " + err)
            }
            console.log("[util/getAllWorkflowRules] : " + result)
            resolve(result)
        })
    })
}

async function getAllBusinessProcess(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Description,IsActive,ManageableState, Name FROM BusinessProcess", function (err, result) {
            if (err) {
                console.log("Error [util/getAllBusinessProcess] : " + err)
            }
            console.log("[util/getAllBusinessProcess] : " + result)
            resolve(result)
        })
    })
}

async function getAllCustomApplication(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Description,DeveloperName,ManageableState,NavType,UiType FROM CustomApplication", function (err, result) {
            if (err) {
                console.log("Error [util/getAllCustomApplication] : " + err)
            }
            console.log("[util/getAllCustomApplication] : " + result)
            resolve(result)
        })
    })
}



/**
 * Get metadata for profiles and for layouts. The layouts metadata provides you a full list of page layouts across all objects, while the profile files contain the info on which page layout/record type combos the profile is associated with.

Compare the profiles' assignments to page layouts to the list of page layouts. I did this using some scripting code which parsed through the xml files.
 */

/**
 * Objects - Triggers on Same Event
 * Objects - Validation Rules Active
 */