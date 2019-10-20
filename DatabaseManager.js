var mongoose = require('mongoose');
var Schema = mongoose.Schema;


mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

var userSchema = new Schema({
    user_id: Schema.Types.ObjectId,
    name: String,
    phone_number: Number,
    location: {type: String, coordinates: []},
    address_readable: String
});

var donationSchema = new Schema({
    donation_id: Schema.Types.ObjectId,
    data_created: Date,
    description: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    address_readable: String,
    created_by: String,
});

var stateSchema = new Schema({
    phone_number: String,
    state: String,
    location: String,
})


var userModel = mongoose.model("Users", userSchema);
var donationModel = mongoose.model("Donations", donationSchema);
var stateModel = mongoose.model("States", stateSchema);

exports.addUser = function(user_object, callback) {
    user = new userModel(
        {
            name: user_object.name, 
            phone_number: user_object.phone_number, 
            location: {type: 'Point', coordinates: [user_object.longitude, user_object.latitude]},
            address_readable: user_object.address_readable
        }
    );

    user.save(function(err) {
        if(err) {
            console.log(err);
            callback({success: false});
        } else {
            callback({success: true});
        }
    })
}

exports.getUserInfo = function(user_phone_number, callback) {
    userModel.findOne({phone_number: user_phone_number}, function(err, res) {
        if(err) {
            console.log(err);
            callback({success: false});
        } else {
            // returns null if user is not found
            callback({success: true, result: res});
        }
    })
}

exports.addDonation = function(donation_object, callback) {

    donation = new donationModel(
        {
        date_created: Date.now(),
        description: donation_object.description,
        location: {type: "Point", coordinates: [donation_object.longitude, donation_object.latitude]},
        address_readable: donation_object.address_readable,
        created_by: donation_object.created_by
        }
    );

    donation.save(function(err){
        if(err) {
            console.log(err);
            callback({success: false});
        } else {
            callback({success: true});
        }
    })
}

exports.getDonationList = function(longitude, latitude, max_radius, callback) {

    let radius_in_radians = max_radius / 3963.2;

    donationModel.find(
    {
        location: {
            $geoWithin: {
                $centerSphere: [[longitude, latitude], radius_in_radians]
            }
        }
    }, function(err, res) {
        if(err) {
            console.log(err);
            callback({success: false});
        } else {
            callback({success: true, result: res});
        }
    })
}

exports.setState = function(phone_number,state, location, callback) {
    stateModel.findOne({phone_number: phone_number}, function(err,res) {
        if(err) {
            console.log(err);
            callback({success: false});
        } else {
            if(res == undefined) {
                
                if(location != undefined) {
                    let stateObj = new stateModel({phone_number: phone_number, state: state, location: location});
                    stateObj.save();
                    callback({success: true});
                } else {
                    let stateObj = new stateModel({phone_number: phone_number, state: state});
                    stateObj.save();
                    callback({success: true});
                }

            } else {
                res.state = state;
                res.save();
                callback({success: true});
            }
        }
    })
}

exports.getState = function(phone_number, callback) {
    stateModel.findOne({phone_number: phone_number}, function(err, res) {
        if(err) {
            console.log(err);
            callback({success: false});
        } else {
            callback({success: true, result: res});
        }
    })
}





