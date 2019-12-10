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
    getAllLayout
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
//This section onwards is not tested
async function getAllLayout(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT FullName,  Name, LayoutType, ManageableState, TableEnumOrId FROM Layout", function (err, result) {
            if (err) {
                console.log("Error [util/getAllLayout]: " + err)
            }
            console.log("[util/getAllLayout] : " + result)
            resolve(result)
        })
    })
}

async function getAllProfile(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Description, FullName, Name FROM Profile", function (err, result) {
            if (err) {
                console.log("Error [util/getAllLayout]: " + err)
            }
            console.log("[util/getAllLayout] : " + result)
            resolve(result)
        })
    })
}

async function getAllProfile2Layout(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT LayoutId, ProfileId, RecordTypeId, TableEnumOrId FROM ProfileLayout", function (err, result) {
            if (err) {
                console.log("Error [util/getAllLayout]: " + err)
            }
            console.log("[util/getAllLayout] : " + result)
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
            console.log("[util/getAllLayout] : " + result)
            resolve(result)
        })
    })
}

//NOT Tested : May need to do after SOBJECTDESCRIBE.
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
        conn.tooling.query("SELECT Description,IsActive,ManageableState, Name, FROM BusinessProcess", function (err, result) {
            if (err) {
                console.log("Error [util/getAllWorkflowRules] : " + err)
            }
            console.log("[util/getAllBusinessProcess] : " + result)
            resolve(result)
        })
    })
}

async function getAllCustomApplication(conn) {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Description,DeveloperName,FullName,IsNavAutoTempTabsDisabled,IsNavPersonalizationDisabled,ManageableState,NavType,UiType,UtilityBar FROM CustomApplication", function (err, result) {
            if (err) {
                console.log("Error [util/getAllWorkflowRules] : " + err)
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