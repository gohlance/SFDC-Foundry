const axios = require('axios').default

axios.defaults.headers.common['Authorization'] = 'Bearer' + global.accesscode
axios.defaults.headers.common['Content-Type'] = 'application/json'

module.exports = ({
    router
}) => {

    router.get('lance','/lance', (ctx, next) => {
       
/*
          axios.get('https://dog.ceo/api/breeds/list/all')
          .then(response => {
              console.log(response.data)
          }).catch(error => {
              console.log(error)
          })
*/
          
          console.log("Access Token : " +  global.accesscode)
          //var url = 'https://singaporeexchangelimited.salesforce.com/services/data/v47.0/tooling/sobjects/'
          url = global.instanceUrl + "/services/data/v47.0/tooling/sobjects/"
          axios.get(url)
            .then(response => {
                console.log(response.data)
            })
            .catch(error => {
                console.log("Error  1: " + error)
            }) 
            

        
            return ctx.render('lance',{
                content: "getBreeds"})
             
    })
}