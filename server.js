var express = require('express');
// get rid of this in production
var dotenv = require('dotenv');
dotenv.config();

var bodyParser = require('body-parser');

var db = require('./DatabaseManager.js');



var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

    let lat = "33.416751, -111.920683";
    33.416751, -111.920683
    
    let donation = {
        description: "Desc 1",
        longitude: -111.923440,
        latitude: 33.418180,
        address_readable: "123 S Drive",
        created_by: "Me",
        perishable: true,
        visible: true, 
    }

    //db.addDonation(donation, function(response) {
    //    console.log(response);
    //})

    db.getDonationList(-111.919945,33.414958,0.5, function(response) {
        console.log(response.result[0]._id);
    })
    

app.listen(process.env.PORT, function() {
    console.log("Listening on port " + process.env.PORT);
})


