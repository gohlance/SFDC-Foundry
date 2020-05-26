const _ = require('lodash')

module.exports = {demystify_processbuilder}

async function demystify_processbuilder(definitionId, orgId){
    const result = await global.pool.query("SELECT elem FROM orginformation o, jsonb_array_elements(processflow_metadata) elem where elem -> 0 ->> 'DefinitionId' = $1 and orgid = $2",[definitionId, orgId])
    let meta = result.rows[0].elem[0].Metadata
    let variable_array = getVariables(meta.variables)
    //Get Decision
    let decision_array = getDecisions(meta.decisions)

    let startingElement = meta.startElementReference

    console.log("I am done")
    // this is going to have an issue, how do i split the value
    let recordsresult = []
    ;(await decision_array).forEach(e => {
        if(meta.recordCreates.length > 0){
            recordsresult= checkCRUD(meta.recordCreates, e)
        }else if (meta.recordDeletes.length > 0){
            recordsresult=  checkCRUD(meta.recordDeletes, e)
        }else if (meta.recordLookups.length > 0){
            recordsresult=  checkCRUD(meta.recordLookups,e)
        }else if (meta.recordUpdates.length > 0){
            recordsresult = checkCRUD(meta.recordUpdates, e)
        }
    })

    console.lgog(recordsresult)
    console.log("This process is about " + meta.processMetadataValues[0].value["stringValue"] + " condition to start : " + meta.processMetadataValues[3].value["stringValue"])
    console.log("There are " + decision_array.length + " decision in the " + meta.processType)
    console.log("The Starting node is " + startingElement)

}

async function getDecisions(meta_decisions){
    let decision_array = []
    if (meta_decisions.length > 0){
        meta_decisions.forEach(e => {
            let locX = e.locationX
            e.rules.forEach(f => {
                if (f.name.startsWith("myRule")){
                    decision_array.push(f.name)
                }
            })
        })
    }
    return decision_array
}

async function getVariables(meta_variables){
    let variable_array = []
    if (meta_variables.length > 0){
        meta_variables.forEach(e => {
            variable_array.push({"name": e.name, "objectType": e.objectType, "isInput": e.isInput, "isOutput": e.isOutput})
        })
    }
    return variable_array
}

//This is multi function method, that work with recordCreates, recordDeletes, recordLookups, recordUpdatesß
async function checkCRUD(meta_record, rule_name){
    let record_result = []
    meta_record.forEach(e=>{
        if (e.name.startsWith(rule_name)){
            record_result.push(e)
        }
    })
    return record_result
}