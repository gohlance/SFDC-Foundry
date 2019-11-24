function meta(conn) {
    var types = [{
        type: 'ApexTrigger',
        folder: null
    }]
    conn.metadata.list(types, function (err, meta) {
        if (err) {
            return console.error('err', err)
        }
        console.log(meta)
    })
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
    getAllApexTrigger: async function getAllApexTrigger(conn) {
        return new Promise((resolve, reject) => {
            var result = []
            conn.tooling.describe('ApexTrigger', function (err, result) {
                if (err) {
                    return console.log(err)
                }
                var i = 1
                result.fields.forEach(function (item) {
                    //console.log(i + ':' + item.label)
                    result.push(item.label)
                    i++
                })
            })
            resolve(result)
        })
    }
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
                console.log("Count  finalsetOfoBject: " + finalsetOfoBject.length)
                resolve(finalsetOfoBject)
            })
        }).then(result => sObjectDescribe(conn, result))
    } catch (err) {
        console.log(err)
    }
}

async function sObjectDescribe(conn, result) {
    try {
        var i = 0;
        var allObjectTotalFields = await Promise.all(result.map(async (item) => {
            var some = await conn.sobject(item.name).describe().then(response => {
                return response.fields.length
            })
            //For Debug
            //console.log("custom " + i + ": " + some)
            i++;
            return [item.name, some, item.custom, item.label]
        }))
        return [allObjectTotalFields]
    } catch (err) {
        console.log(err)
    }
}