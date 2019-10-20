var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

var userSchema = new Schema({
    user_id: Schema.Types.ObjectId,
    name: String,
    type: String,
    phone_number: Number,
    password: String,
    location: {type: String, coordinates: []},
    address_readable: String
});

var donationSchema = new Schema({
    donation_id: Schema.Types.ObjectId,
    data_created: {type: Date, default: Date.now()},
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
    perishable: Boolean,
    visible: Boolean
});


var userModel = mongoose.model("Users", userSchema);
var donationModel = mongoose.model("Donations", donationSchema);


exports.addUser = function(user_object, callback) {
    user = new userModel(
        {
            name: user_object.name, 
            type: user_object.type, 
            phone_number: user_object.phone_number, 
            password: user_object.password, 
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

exports.getUserInfo = function(user_name, user_password, callback) {
    userModel.findOne({name: user_name, password: user_password}, function(err, res) {
        if(err) {
            console.log(err);
            callback({success: false});
        } else {
            // returns null if user is not found
            callback({success: true, result: res});
        }
    })
}

exports.addDonation = function(donation_object,callback) {
    donation = new donationModel(
        {
        date_created: Date.now(),
        description: donation_object.description,
        'location': {type: "Point", coordinates: [donation_object.longitude, donation_object.latitude]},
        address_readable: donation_object.address_readable,
        created_by: donation_object.created_by,
        perishable: donation_object.perishable,
        visible: donation_object.visible
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
    console.log(radius_in_radians)
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

exports.deleteDonationList = function(id, callback) {
    donationModel.findOneAndDelete({donation_id: id}, function(err, result) {
        if(err) {
            console.log(err);
            callback({success: false});
        } else {
            console.log("Deleted" + result);
            callback({success: true});
        }
    })
}






