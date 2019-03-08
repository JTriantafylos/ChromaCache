let mongoose = require('mongoose');
let Searches = require('./../colorlib');

let userSchema = mongoose.Schema({
        firstDate:{
                type: [Number],
                require: true
        },
        latestDate:{
                type:[Number],
                require:true
        },
        searched:{
                type:Searches,
                require:true
        },
        user:{
                type:String,
                require:true
        },
        usages:{
                type:Number,
                require:true
        }
});


let UserM = module.exports = mongoose.model('users', userSchema);

