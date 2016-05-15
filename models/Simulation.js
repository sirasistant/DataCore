var mongoose = require('mongoose');

/* 
 Modelo de datos de simulación
 */

var VotingIntent = new mongoose.Schema({
    voters     : Number,
    party     : {
       name:String
    }
});

var Circumscription = new mongoose.Schema({
    population : Number,
    name       : String,
    localizationPath : String,
    localizationFilename : String,
    seats      : Number,
    votingIntents :[VotingIntent]
});

var Simulation = new mongoose.Schema({
    name       : String,
    creator    : String,
    createDate : Date,
    isTemplate : Boolean,
    Circunscriptions :[Circumscription]
});




module.exports = mongoose.model('Simulation', Simulation);