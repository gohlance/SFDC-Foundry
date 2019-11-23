async function getAllFieldsInAllObject(conn) {
    return new Promise((resolve, reject) => {

        var customObject = []
        var standardObject = []
        conn.describeGlobal(function (err, res) {
            if (err) {
                return console.error(err)
            }
            console.log('No of Objects ' + res.sobjects.length)
            res.sobjects.forEach(function (sobject) {
                if (sobject.custom) {

                    customObject.push(sobject)
                } else {

                    standardObject.push(sobject)
                }
            })
            console.log("Done")
            resolve([customObject, standardObject])
        })
    })
}

function sObjectDescribe(conn, sobjectname) {
    conn.sobject(sobjectname).describe(function (err, meta) {
        if (err) {
            return console.error(err);
        }

        console.log('meta : ' + meta)
        console.log('Label : ' + meta.label);
        console.log('Num of Fields : ' + meta.fields.length);
        // ...
    })
}

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
    //This give the information on the Objects
    conn.describeGlobal(function (err,res){
        if (err){return console.error(err)}
        console.log('No of Objects ' + res)
        var customObject =[]
        var standardObject =[]
        res.sobjects.forEach(function(sobject){
            if (sobject.custom){
                customObject.push(sobject)
            }else{
                standardObject.push(sobject)
            }
        })
        console.log("Standard object : " + standardObject.length)
        console.log("Custom Object : " + customObject.length)
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
    //This get the fields in the ApexTrigger
    conn.tooling.describe('ApexTrigger', function(err, result){
        if (err){return console.error(err)}
        var i = 1
        result.fields.forEach(function(item){
            console.log(i + ':' + item.label)
            i++
        })
    })*/
}


module.exports = {
    sObjectDescribe: sObjectDescribe,
    meta: meta,
    getAllFields: getAllFieldsInAllObject
}