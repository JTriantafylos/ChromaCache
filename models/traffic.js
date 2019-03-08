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


let TrafficM = module.exports = mongoose.model('traffics', trafficSchema);