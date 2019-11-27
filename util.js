module.exports = {
    //Average Run: 3,637 ms to 4,000 ms
    getAllObjects: getAllObjects,
    getAllApex: getAllApex,
    getAllMeta, getAllMeta
}

async function getAllMeta(conn){
}

async function getAllObjects(conn) {
    try {
        return new Promise((resolve, reject) => {
            var customObject = []
            var standardObject = []
            var finalsetOfoBject = []
            conn.describeGlobal(function (err, res) {
                if (err) {
                    return console.log(err)
                }
                console.log('No of Objects ' + res.sobjects.length)
                /*
                res.sobjects.forEach(function (sobject) {
                    if (sobject.custom && !sobject.deletable && !sobject.deprecatedAndHidden) {
                       customObject.push(sobject)
                       
                    } else if (!sobject.custom && !sobject.deletable && !sobject.deprecatedAndHidden) {
                        standardObject.push(sobject)
                    }
                })
                */
                res.sobjects.forEach(function (sobject) {
                    if (!sobject.deletable && !sobject.deprecatedAndHidden) {
                        finalsetOfoBject.push(sobject)
                    }
                })

                //console.log('Count C : ' + customObject.length + "And Standard : " + standardObject.length)
                //console.log("Count  finalsetOfoBject: " + finalsetOfoBject.length)
                resolve(finalsetOfoBject)
            })
        }).then(result => sObjectDescribe(conn, result))
    } catch (err) {
        console.log(err)
    }
}

async function sObjectDescribe(conn, result) {

    //TODO : this section can do child relationship
    try {
        var i = 0;
        var lessthan100fields = 0;
        var morethan100fields = 0;
        var allObjectTotalFields = await Promise.all(result.map(async (item) => {
            var totalfields = await conn.sobject(item.name).describe().then(response => {
                return {totalfields: response.fields.length, layout: response.namedLayoutInfos.length, childRelatioship: response.childRelationships.length, recordType:response.recordTypeInfos.length}
            })
            //For Debug
            //console.log("custom " + i + ": " + some)
            
            if (totalfields.totalfields > 100){
                morethan100fields++
            }else{
                lessthan100fields++
            }
            i++
            return {Objectname: item.name, totalfields: totalfields.totalfields, Custom: item.custom, Label: item.label, childRelationships: totalfields.childRelationships, recordType: totalfields.recordType, layout: totalfields.layout}
        }))
        return {allObject: allObjectTotalFields, morethan100: morethan100fields, lessthan100: lessthan100fields}
    } catch (err) {
        console.log(err)
    }
}

async function getAllApex(conn, type) {
    //TODO: Check what can ApexPage, ApexClass and ApexComponent return
    return new Promise((resolve, reject) => {
        var query = ""
        if (type == "ApexTrigger"){
            query = "SELECT Name, TableEnumOrId, NamespacePrefix, ApiVersion, Status, IsValid FROM ApexTrigger"
        }else if (type == "ApexPage"){
            query = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexPage"
        }else if (type == "ApexClass"){
            query = "SELECT Name, NamespacePrefix, ApiVersion, Status, IsValid FROM ApexClass"
        }else if (type == "ApexComponent"){
            query = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexComponent"
        }
        
        conn.tooling.query(query, function(err,result){
            if (err){console.log(err)}
            console.log("A : " +result)
            resolve(result)
        })
    })
}