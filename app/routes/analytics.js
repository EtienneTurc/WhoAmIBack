const router = require('express').Router()
const axios = require('axios');
const config = require('../../config/config')

router.get("/analytics", async(req, res) => {
    try {
        axios.get(config.kite_url + '/analytics')
            .then(function(response) {
                res.send(response)
            })
            .catch(function(error) {
                // handle error
                console.log(error);
            })
            .finally(function() {
                // always executed
            });
    } catch (error) {
        res.send(error)
    }
})