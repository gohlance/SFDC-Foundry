
const axios = require('axios')

let config = {
    headers: {
        'Authorization': "Bearer" + accesscode,
        'Content-Type': 'application/json'
    }
  }
  
module.exports = ({router}) => {

router.get('/lance', async (ctx, next) => {
    await axios.get('https://singaporeexchangelimited.my.salesforce.com' + '/services/data/v47.0/tooling/sobjects/',headers)
    .then(response => {
        console.log(response.data)
    })
    .catch(error => {
        console.log("Error : " + error)
    })
})
}