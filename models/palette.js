let mongoose = require('mongoose');
let Palette = require('./../colorlib');
let paletteSchema = mongoose.Schema({
    palette: {
        type: Palette,
        require: true
                
    },
    date:{
        type: [Number],
        require: true
    }
        
});

let PaletteM = module.exports = mongoose.model('palettes', paletteSchema);
