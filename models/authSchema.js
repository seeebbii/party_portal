const mongoose = require('mongoose');
const AuthSchema = mongoose.Schema;
const Location = mongoose.Schema;

const location = new Location({
    latitude: Number,
    longitude: Number,
    locationName: String
});

const authSchema = new AuthSchema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true
    },
    fcmToken: {
        type: String,
        required: false,
    },
    imageUrl: {
        type: String,
        required: false,
        default: ""
    },
    createdParties: {
        type: [{ "partyId": String, "location": location }],
        required: false,
    },
    joinedParties: {
        type: [{ "partyId": String, "location": location }],
        required: false,
    },
    placedBids: {
        type: [{ "partyId": String, "amount": Number }],
        required: false
    }


}, { timestamps: true })



module.exports = mongoose.model('AuthSchema', authSchema);