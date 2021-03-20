
module.exports = {start_BackGroundService}

async function start_BackGroundService(session) {
    try {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./sfdc_background_service.js', {
                workerData: {
                    instance: session.instanceUrl,
                    accesscode: session.accesscode,
                    orgId: session.orgId
                }
            });
            
            console.log("Worker Started")
            worker.on ('message', resolve("Success"));
            //worker.on('message', (message) => {
            //    console.log("Completed !!!! I am here " + message.status);
            //    //resolve("Success")
            //    return "Success"
            //});
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0)
                    reject(new Error(`Worker stopped with exit code ${code}`));
            })
        })
    } catch (error) {
        console.log("Error [sfdc-api/letsGetEverything] : " + error)
    }
}
