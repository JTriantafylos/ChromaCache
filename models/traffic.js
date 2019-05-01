let mongoose = require('mongoose');


let  trafficSchema = mongoose.Schema({
    date:{
        type: [Number],
        require: true
    },
    traffic:{
        type: Number,
        require:true
    }
});


// eslint-disable-next-line no-unused-vars
let TrafficM = module.exports = mongoose.model('traffics', trafficSchema);