const mongoose = require('mongoose');
const db2 = require('../config/keys2').mongoURI;
var conn2 = mongoose.createConnection(db2);


const HospitalSchema = new mongoose.Schema({
    State: {
        type: String,
        required: true
    },
    Hospital: {
        type: String,
        required: true
    },
    Beds: {
        type: String,
        required: true
    },
    info: {
        type: Date,
        default: Date.now
    },
    RampingBeds: {
        type: String,
        default: Date.now
    }
});

const Hospital = conn2.model('Hospital', HospitalSchema);

module.exports = Hospital;
