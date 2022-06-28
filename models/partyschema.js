const mongoose = require('mongoose');
const PartySchema = mongoose.Schema;
const Location = mongoose.Schema;

const location = new Location({
    latitude: Number,
    longitude: Number,
    locationName: String
});

const partySchema = new PartySchema({

    createdBy: {
        type: String,
        required: true,
    },
    partySize: {
        type: String
    },
    hostCount: Number,
    guestCount: Number,
    partyImages: Array,
    partyInfo: String,
    startingDate: {
        type: Date,
        default: Date.now()
    },
    endingDate: Date,
    location: location,
    drinks: Array,
    games: Array,
    partyRating: String,
    joinedGuest: {
        type: [{ "guestId": String, "username": String, "imageUrl": String }],
        required: false,
    },
    bids: {
        type: [{ "guestId": String, "amount": Number, "username": String }],
        required: false
    }

}, { timestamps: true })

const PartySchemas = mongoose.model('PartySchema', partySchema);
const LocationSchemas = mongoose.model('Location', location);

module.exports = {
    PartySchemas,
    LocationSchemas
}