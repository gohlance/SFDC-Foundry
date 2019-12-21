//SFDC.JS

.get('getAllObjects', '/getAllObjects', async (ctx) => {
    try {
        const result = await global.pool.query('SELECT objectinfo FROM objects WHERE orgid = $1', [global.orgId])

        console.log("%%% : " + result)

        return ctx.render('objects', {
            allObject: result.rows[0]["objectinfo"]["allObject"],
            totalObject: result.rows[0]["objectinfo"]["allObject"].length,
            moreObject: result.rows[0]["objectinfo"].morethan100,
            lessObject: result.rows[0]["objectinfo"].lessthan100
        })

    } catch (err) {
        console.log("Error [getAllObjects] " + err)
    }
})
.get('getAllApexTrigger', '/getAllApexTrigger', async (ctx) => {
    try {
        const result = await sfdcmethods.getAllApex("ApexTrigger")
        return ctx.render('apex', {
            apex: result.records,
            type: "ApexTrigger"
        })
    } catch (err) {
        console.log("Error [getAllApexTrigger]: " + err)
    }
})
.get('getAllApexPage', '/getAllApexPage', async (ctx) => {
    try {
        var result = await sfdcmethods.getAllApex("ApexPage")

        return ctx.render('apex', {
            apex: result.records,
            type: "ApexPage"
        })
    } catch (err) {
        console.log("Error [getAllApexPage]: " + err)
    }
})
.get('getAllApexPage', '/getAllApexComponent', async (ctx) => {
    try {

        var result = await sfdcmethods.getAllApex("ApexComponent")

        return ctx.render('apex', {
            apex: result.records,
            type: "ApexComponent"
        })
    } catch (err) {
        console.log("Error [getAllApexComponet]: " + err)
    }
})
.get('getAllApexPage', '/getAllApexClass', async (ctx) => {
    try {


        var result = await sfdcmethods.getAllApex("ApexClass")

        return ctx.render('apex', {
            apex: result.records,
            type: "ApexClass"
        })
    } catch (err) {
        console.log("Error [getAllApexClass] : " + err)
    }
})
.get('getAllMeta', '/getAllMeta', async (ctx) => {
    try {
        const result = await global.pool.query("SELECT meta FROM metas WHERE orgid = $1", [global.orgId])

        return ctx.render('generic', {
            object: result
        })
    } catch (err) {
        console.log("Error [getAllMeta]: " + err)
    }
})
.get('getAllLayout', '/getAllLayout', async (ctx) => {
    try {
        const result = await global.pool.query("SELECT layout FROM layouts WHERE orgid=$1", [global.orgId])
        return ctx.render('generic', {
            object: result.rows[0]["layout"]["records"]
        })
    } catch (err) {
        console.log("Error [getAllLayout]:" + err)
    }
})
.get('getAllProfile', '/getProfile', async (ctx) => {
    try {
        const result = await global.pool.query("SELECT profile FROM profiles WHERE orgid=$1", [global.orgId])
    } catch (err) {
        console.log("Error [getAllLayout]:" + err)
    }
})
.get('getRecordTypes', '/getRecordTypes', async (ctx) => {
    try {
        const result = await global.pool.query("SELECT recordtype FROM recordtypes WHERE orgid=$1", [global.orgId])
    } catch (err) {
        console.log("Error [getAllLayout]:" + err)
    }
})
.get('getAllProfile2Layout', '/getAllProfile2Layout', async (ctx) => {
    try {
        const result = await global.pool.query("SELECT profileslayout FROM profileslayouts WHERE orgid=$1", [global.orgId])
    } catch (err) {
        console.log("Error [getAllLayout]:" + err)
    }
})
.get('getAllValidationRules', '/getAllValidationRules', async (ctx) => {
    try {
        const result = await global.pool.query("SELECT validationrule FROM validationrules WHERE orgid=$1", [global.orgId])

    } catch (err) {
        console.log("Error [getAllValidationRules]:" + err)
    }
})
.get('getAllWorkflowRules', '/getAllWorkflowRules', async (ctx) => {
    try {
        const result = await global.pool.query("SELECT workflowrule FROM workflowrules WHERE orgid=$1", [global.orgId])

    } catch (err) {
        console.log("Error [getAllWorkflowRules]:" + err)
    }
})
.get('getAllBusinessProcess', '/getAllBusinessProcess', async (ctx) => {
    try {
        const result = await global.pool.query("SELECT businessprocess FROM businessprocess WHERE orgid=$1", [global.orgId])
    } catch (err) {
        console.log("Error [getAllBusinessProcess]:" + err)
    }
})
.get('getAllCustomApplication', '/getAllCustomApplication', async (ctx) => {
    try {
        const result = await global.pool.query("SELECT customapp FROM customapps WHERE orgid=$1", [global.orgId])

    } catch (err) {
        console.log("Error [getAllCustomApplication]:" + err)
    }
})