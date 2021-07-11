
module.exports = {start_BackGroundService}

const { Worker } = require('worker_threads');

async function start_BackGroundService(session) {
    try {
        return new Promise((resolve, reject) => {
            console.log(" I m here");
            if (process.env.APP_ENV ==  "dev"){
                session.instanceUrl = global.instanceUrl;
                session.accesscode = global.accesscode;
                session.orgId = 8889;
            }
            console.log(" I m here 2");
            const worker = new Worker('./core/sfdc_background_service.js', {
                workerData: {
                    instance: session.instanceUrl,
                    accesscode: session.accesscode,
                    orgId: session.orgId
                }
            });
            console.log(" I m here 3");         
            console.log("Worker Started")
            //worker.on ('message', resolve("Success"));
            worker.on('message', (message) => {
                //console.log("Completed !!!! I am here " + JSON.stringify(message));
                if (message.status == "Done"){
                    console.log("Hello");
                    resolve("Success");
                }
            //    return "Success"
            });
            worker.on('error', (error) => {
                console.log("Error : " + error);
            });
            worker.on('exit', (code) => {
                console.log("Exited for backgroundservice with code : " + code);
                if (code !== 0)
                    reject(new Error(`Worker stopped with exit code ${code}`));
            })
        })
    } catch (error) {
        console.log("Error [sfdc-api/letsGetEverything] : " + error)
    }
}
