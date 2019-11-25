

function meta(conn) {
    
}

function dofinally(conn) {
    /*
            var types = [{
                type: 'CustomObject',
                folder: null
            }]
            conn.metadata.list(types, function (err, meta) {
                if (err) {
                    return console.error('err', err)
                }
                console.log(meta)
                console.log('metadata count: ' + metadata.length);
                console.log('createdById: ' + meta.createdById);
                console.log('createdByName: ' + meta.createdByName);
                console.log('createdDate: ' + meta.createdDate);
                console.log('fileName: ' + meta.fileName);
                console.log('fullName: ' + meta.fullName);
                console.log('id: ' + meta.id);
                console.log('lastModifiedById: ' + meta.lastModifiedById);
                console.log('lastModifiedByName: ' + meta.lastModifiedByName);
                console.log('lastModifiedDate: ' + meta.lastModifiedDate);
                console.log('manageableState: ' + meta.manageableState);
                console.log('namespacePrefix: ' + meta.namespacePrefix);
                console.log('type: ' + meta.type);
            })*/

    /*
    //This get the fields in the Visualforce Page?
    conn.tooling.sobject('ApexPage').describe(function (err, meta){
        if (err){return console.error(err)}
        console.log("label name : " + meta.label)
        var i = 1
        meta.fields.forEach(function(item){
            console.log(' *' + i + ' :' + item.label)
            i++
        })
    })
    */
}


module.exports = {
    //Average Run: 3,637 ms to 4,000 ms
    getAllObjects: getAllObjects,
    getAllApexTrigger: getAllApexTrigger,
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
                return response.fields.length
            })
            //For Debug
            //console.log("custom " + i + ": " + some)
            
            if (totalfields > 100){
                morethan100fields++
            }else{
                lessthan100fields++
            }
            i++
            return {Objectname: item.name, totalfields: totalfields, Custom: item.custom, Label: item.label}
        }))
        return {allObject: allObjectTotalFields, morethan100: morethan100fields, lessthan100: lessthan100fields}
    } catch (err) {
        console.log(err)
    }
}

async function getAllApexTrigger(conn) {
    return new Promise((resolve, reject) => {
        var result = []
        conn.version = 47
        var types = [{
            type: 'ApexTrigger',
            folder: null
        }]
       
        conn.metadata.list(types, function (err, meta) {
            if (err) {
                return console.error('err', err)
            }
            resolve(meta)
        })
    })
}