const {
    workerData,
    parentPort
} = require('worker_threads')

const sfdcmethod = require('./sfdc-api_background.js')

/**
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

//DEV


async function start_background_call() {
    try {
        console.log("background starting")

        sfdcmethod.set_ConnObject(workerData)

        Promise.all([
            sfdcmethod.getAllMeta(),  //testing
            sfdcmethod.getAllLayout(), //done
            sfdcmethod.getAllRecordType(), //done
            sfdcmethod.getAllProfile(), //done
            sfdcmethod.get_TotalUsersByProfile(),  //testing
            sfdcmethod.getAllProfile2Layout(), //done
            sfdcmethod.getAllValidationRules(), //done
            sfdcmethod.getAllWorkflowRules(), //done
            sfdcmethod.getAllBusinessProcess(), //done
            sfdcmethod.getAllCustomApplication(), //done
            sfdcmethod.getAllApexTrigger(), //testing
            sfdcmethod.getAllApexPage(), //testing
            sfdcmethod.getAllApexClass(), //testing
            sfdcmethod.getAllApexComponent(), //testing
            sfdcmethod.get_UserWithLicense2(), //testing
            sfdcmethod.get_Org_limitInfo(workerData.accesscode, workerData.instance),
            sfdcmethod.getAllSecurityRisk(), //Testing
            sfdcmethod.getAllObjectOnce() //testing
         ]).then((
                [meta, 
                layout, 
                recordtype, 
                profile, 
                userbyProfile, 
                profilelayout, 
                validationRules, 
                workflowrules, 
                businessprocess, 
                customapp, 
                apextrigger, 
                apexpage, 
                apexclass, 
                apexcomponent,
                license, 
                orglimit, 
                securityrisk, 
                objectinfo ]
             ) => {
                    sfdcmethod.insertBackgroundData(workerData.orgId, 
                        JSON.stringify(meta), 
                        JSON.stringify(objectinfo[0]),
                        JSON.stringify(license.records),
                        JSON.stringify(orglimit.data), 
                        JSON.stringify(securityrisk.records), 
                        JSON.stringify(objectinfo[1]), 
                        JSON.stringify(apextrigger), 
                        JSON.stringify(apexpage), 
                        JSON.stringify(apexclass), 
                        JSON.stringify(apexcomponent), 
                        JSON.stringify(profile), 
                        JSON.stringify(userbyProfile),
                        JSON.stringify(layout), 
                        JSON.stringify(profilelayout), 
                        JSON.stringify(customapp), 
                        JSON.stringify(businessprocess), 
                        JSON.stringify(workflowrules), 
                        JSON.stringify(validationRules), 
                        JSON.stringify(recordtype))
                
                //parentPort.postMessage({
                //    status: 'Done'
                //})
             })
    } catch (error) {
        console.log("Error [backgroundsvc.js] : " + error)
    }
}

start_background_call()