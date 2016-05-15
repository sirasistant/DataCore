var mongoose = require('mongoose');

/*
 Modelo de datos de reporte
 */

var ParlamentaryGroup = new mongoose.Schema({
    deputies     : Number,
    name:String
});

var Congress = new mongoose.Schema({
    localVoters : Number,
    localPopulation       : Number,
    locationName : String,
    parlamentaryGroup :[ParlamentaryGroup]
});

var Report = new mongoose.Schema({
    name       : String,
    creator    : String,
    simulation    : String,
    createDate : Date,
    isPublic : Boolean,
    congress : [Congress],
    globalCongress : Congress,
    territories : mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Report', Report);