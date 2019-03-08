let mongoose = require('mongoose');


let userSchema = mongoose.Schema({
        firstDate:{
                type: [Number],
                require: true
        },
        latestDate:{
                type:[Number],
                require:true
        },
        user:{
                type:String,
                require:true
        },
        usages:{
                type:Number,
                require:true
        },
        searched:{
                type:[String],
                require:true
        }
});


let UserM = module.exports = mongoose.model('users', userSchema);

