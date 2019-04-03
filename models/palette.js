let mongoose = require('mongoose');
let Palette = require('./../colorlib');

let paletteSchema = mongoose.Schema({
    date:{
        type: [Number],
        require: true
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





let PaletteM = module.exports = mongoose.model('palettes', paletteSchema);


