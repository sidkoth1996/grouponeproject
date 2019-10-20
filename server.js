var dotenv = require('dotenv');
dotenv.config();

var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var client = require('twilio')(process.env.accountSid, process.env.authToken);
var db = require('./DatabaseManager.js');



var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/** 
client.messages.create({
    body: "Hello world",
    from: "+12073897355",
    to: "+14807994131"
}).then(message => console.log(message));
*/

const from_number = "+12073897355";

const states = {
    donor_location: "donor_location",
    donor_food_desc: "donor_food_desc",
    food_location:"food_loc",
    food_list:"food_list"
}

app.post('/sms', function(req, res) {
    var sender_number = req.body.From;
    var rec_msg_body = req.body.Body.toLowerCase();

    var outgoing_msg = {
        from: from_number,
        to: sender_number
    }

    if(rec_msg_body == "donate") {
        outgoing_msg.body = "Please provide your street address";
        client.messages.create(outgoing_msg, function(err, msg) {
            if(err) {
                console.log(err);
                //handleError();
            } else {
                db.setState(sender_number, states.donor_location, undefined, function(res) {
                    if(!res.success) {
                        //handleError();
                    }
                });
                console.log(msg);
            }  
        })
    } else if(rec_msg_body == "food") {
        outgoing_msg.body = "Please provide your street address";
        client.messages.create(outgoing_msg, function(err, msg) {
            if(err) {
                console.log(err);
                //handlerError();
            } else {
                db.setState(sender_number, states.food_location, undefined, function(res) {
                    if(!res.success) {
                        //handleError();
                    }
                })
                console.log(msg);
            }
        })
    } else {
        db.getState(sender_number, function(res) {

            if(res.result.location != undefined) {
                var temp_address = res.location;
            }

            if(res.success) {
                var current_state = res.result.state;
                if(current_state == undefined) {
                    
                    outgoing_msg.body = "Please text FOOD to view donations near you or DONATE to donate to shelters nearby";
                    client.messages.create(outgoing_msg, function(err, msg) {
                        if(err) {
                            console.log(err);
                            //handlerError();
                        } else {
                            console.log(msg);
                        }
                    })
                } else {
                    // THIS IS WHERE THE BULK OF THE LOGIC GOES

                    switch(current_state) {
                        case states.donor_location:
                            db.setState(sender_number, states.donor_food_desc, rec_msg_body, function(res) {
                                if(res.success) {
                                    outgoing_msg.body = "Please describe your food donation";

                                    client.messages.create(outgoing_msg, function(err, msg) {
                                        if(err) {
                                            console.log(err);
                                            //handleError();
                                        } else {
                                            console.log(msg);
                                        }
                                    })
                                } else {
                                    //handleError();
                                }
                            })
                            break;
                        case states.donor_food_desc:
                            db.setState(sender_number, undefined, undefined, function(res) {
                                if(res.success) {
                                    outgoing_msg.body = "Thank you for your donation";
                                    
                                    let url = getGoogleMapsUrl(temp_address);
                                    
                                    db.getUserInfo(sender_number, function(response) {
                                        getGoogleMapsLongAndLat(url, function(res) {
                                                db.addDonation({
                                                    description: rec_msg_body,
                                                    longitude: res.coordinates[0],
                                                    latitude: res.coordinates[1],
                                                    address_readable: res.address_readable,
                                                    created_by: response.result.name
                                                }, function(res) {
                                                    client.messages.create(outgoing_msg, function(err, msg) {
                                                        if(err) {
                                                            console.log(err);
                                                            //handleError();
                                                        } else {
                                                            console.log(msg);
                                                        }
                                                    })
                                                })
                                            })
                                    })
                                }
                            })
                            break;
                        case states.food_location:
                            // list out all nearby donations

                            db.setState(sender_number, undefined, undefined, function(res) {
                                let url = getGoogleMapsUrl(rec_msg_body); 
                                getGoogleMapsLongAndLat(url, function(res) {
                                    let address_readable = res.address_readable;
                                    let longitude = res.coordinates[0];
                                    let latitude = res.coordinates[1];

                                    db.getDonationList(longitude, latitude, 10, function(res) {
                                        res.result.forEach(function(element) {

                                            outgoing_msg.body = `Desc: ${element.description},\nAddress: ${element.address_readable},\nBy: ${element.name}`;
                                            client.messages.create(outgoing_msg, function(err, msg) {
                                                if(err) {
                                                    console.log(err);
                                                    //handleError();
                                                } else {
                                                    console.log(msg);
                                                }
                                            })
                                        })
                                    })

                                })
                            })
                    }
                }
            } else {
                //handleError();
            }
        })
        
    }
    
})

app.listen(process.env.PORT, function() {
    console.log("Listening on port " + process.env.PORT);
})

function getGoogleMapsUrl(address_readable) {
    var address = address_readable.trim().replace(/\s/g, "+");
    return "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyDY4EMcxMvTqc-erjM4SVFUqUQRh0nCJSI";
}

function getGoogleMapsLongAndLat(url, callback) {
    axios.get(url).then(function(res) {
        callback({address_readable: res.data.results[0].formatted_address, coordinates: [res.data.results[0].geometry.location.lng,res.data.results[0].geometry.location.lat]});
        }
    )
}