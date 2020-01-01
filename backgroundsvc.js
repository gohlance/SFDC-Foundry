const {
    workerData,
    parentPort
} = require('worker_threads')

const sfdcmethod = require('./sfdc-api')
const Pool = require('pg-pool')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Beaver',
    password: 'P@ssw0rd1',
    port: 5432,
    max: 20, // set pool max size to 20
    min: 4
})

async function start_background_call() {
    try {
        console.log("background starting")
        const step1 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllMeta()
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO metas (orgid, meta) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 1 : " + error))
            .finally(console.log("Step 1 done"))

        const step2 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllLayout()
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO layouts (orgid, layout) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 2 : " + error))
            .finally(console.log("Step 2 done"))

        const step3 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllRecordType()
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO recordtypes (orgid, recordtype) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 3 : " + error))
            .finally(console.log("Step 3 done"))

        const step4 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllProfile()
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO profiles (orgid, profile) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 4 : " + error))
            .finally(console.log("Step 4 done"))

        const step5 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllProfile2Layout()
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO profileslayouts (orgid, profileslayout) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 5 : " + error))
            .finally(console.log("Step 5 done"))

        const step6 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllValidationRules()
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO validationrules (orgid, validationrule) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 6 : " + error))
            .finally(console.log("Step 6 done"))

        const step7 = new Promise(async (resolve) => {
                const result = sfdcmethod.getAllWorkflowRules()
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO workflowrules (orgid, workflowrule) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 7 : " + error))
            .finally(console.log("Step 7 done"))

        const step8 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllBusinessProcess()
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO businessprocess (orgid, businessprocess) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 8 : " + error))
            .finally(console.log("Step 8 done"))

        const step9 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllCustomApplication()
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO customapps (orgid, customapp) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 9 : " + error))
            .finally(console.log("Step 9 done"))

        const step10 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllApex("ApexTrigger");
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO apextriggers (orgid, apextrigger) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 10 : " + error))
            .finally(console.log("Step 10 done"))

        const step11 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllApex("ApexPage");
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO apexpages (orgid, apexpage) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 11 : " + error))
            .finally(console.log("Step 11 done"))

        const step12 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllApex("ApexClass");
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO apexclass (orgid, apexclass) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 12: " + error))
            .finally(console.log("Step 12 done"))

        const step13 = new Promise(async (resolve) => {
                const result = await sfdcmethod.getAllApex("ApexComponent");
                resolve(result)
            })
            .then(result => pool.query("INSERT INTO apexcomponents (orgid, apexcomponent) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)]))
            .catch(error => console.log("Step 12: " + error))
            .finally(console.log("Step 13 done"))

        const step14 = new Promise(async (resolve) => {
                try {
                    console.log("starting step 14")
                    const result = await sfdcmethod.getAllObjectOnce()
                    resolve(result)
                } catch (error) {
                    console.log("Error ** : " + error);
                    throw new Error("will be caught");
                }
            }).then(result => {
                 console.log("Starting SobjectDescribe")
                 pool.query("INSERT INTO sobjectdesribe (orgid, sobjectdesribe) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(result)])
                 sfdcmethod.sObjectDescribe(result)  
            })
            .catch(error => console.log("Step 14: " + error))
            .finally(() => {
                parentPort.postMessage({
                    fileName: "Done",
                    status: 'Done'
                })
                console.log("Step 14 done")
            }) 
    } catch (error) {
        console.log("Error [backgroundsvc.js] : " + error)
    }
}

start_background_call()