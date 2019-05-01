let mongoose = require('mongoose');
let Palette = require('./../colorlib');

let frequencySchema = mongoose.Schema({
    date_added:{
        type: [Number],
        require: true
    },
    date_latest:{
        type:[Number],
        require:true
    },
    palette: {
        type: Palette,
        require: true
                
    },
    searches:{
        type:Number,
        require: true
    }
        
});





// eslint-disable-next-line no-unused-vars
let FrequencyM = module.exports = mongoose.model('frequency', frequencySchema);


