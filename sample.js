var PromiseThrottle = require('promise-throttle');

let RATE_PER_SECOND = 5; // 5 = 5 per second, 0.5 = 1 per every 2 seconds

var pto = new PromiseThrottle({
    requestsPerSecond: RATE_PER_SECOND, // up to 1 request per second
    promiseImplementation: Promise  // the Promise library you are using
});

let timeStart = Date.now();
var myPromiseFunction = function (arg) {
    return new Promise(function (resolve, reject) {
        console.log("myPromiseFunction: " + arg + ", " + (Date.now() - timeStart) / 1000);
        let response = arg;
        return resolve(response);
    });
};

let NUMBER_OF_REQUESTS = 15;
let promiseArray = [];
for (let i = 1; i <= NUMBER_OF_REQUESTS; i++) {
    promiseArray.push(
            pto
            .add(myPromiseFunction.bind(this, i)) // passing am argument using bind()
            );
}

Promise
        .all(promiseArray)
        .then(function (allResponsesArray) { // [1 .. 100]
            console.log("All results: " + allResponsesArray);
        });