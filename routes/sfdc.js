const axios = require('axios').default

axios.defaults.headers.common['Authorization'] = 'Bearer' + global.accesscode
axios.defaults.headers.common['Content-Type'] = 'application/json'

module.exports = ({
    router
}) => {

    router.get('/lance', (ctx, next) => {

        axios.post('https://singaporeexchangelimited.my.salesforce.com' + '/services/data/v47.0/tooling/sobjects/')
            .then(response => {
                console.log(response.data)
            })
            .catch(error => {
                console.log("Error : " + error)
            })
    })
}