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





let FrequencyM = module.exports = mongoose.model('frequency', frequencySchema);


