var check = require('check-types'),
    Simulation = require('../models/Simulation'),
    fs = require("fs"), async = require("async"),
    moment = require('moment'), crypto = require('crypto');

var insertLocalizations = function(simulation,finalCallback){
    async.each(simulation.Circunscriptions,function(circunscription,callback){
        if(circunscription.localizationPath){
            fs.readFile(circunscription.localizationPath,'utf8',function(err,data){
                if(err){
                    callback(err);
                }else{
                    circunscription.localization = data;
                    callback();
                }
            });
        }else{
            callback();
        }
    },function(err){
        finalCallback(err);
    });
};


exports.list = function(req,res){
    var sendList = function(simulationDocs){
        var simulations = [];
        for(var i = 0;i<simulationDocs.length;i++){
            var simulation = simulationDocs[i].toObject();
            simulation.id = simulation._id;
            simulations.push(simulation);
        }
        async.each(simulations,insertLocalizations,function(err){
            if(err){
                res.status(500).send(err);
            }else{
                res.status(200).json(simulations);
            }
        });
    };

    if(req.query.templates){
        Simulation.find({ isTemplate: true }).exec(function(err,docs){
            sendList(docs);
        });
    }else{
        if(req.query.creator){
            Simulation.find({ creator: req.query.creator }).exec(function(err,docs){
                sendList(docs);
            });
        }else{
            Simulation.find({}).exec(function(err,docs){
                sendList(docs);
            });
        }
    }
};

exports.create = function (req, res) {
    var simulation = new Simulation(req.body);
    async.forEachOf(req.body.Circunscriptions, function(circumscription,index, callback) {
        //For each circumscription, save the localization
        if(circumscription.localization){
            var hash =crypto.createHash('sha256').update(circumscription.localization).digest('hex');
            var path = "files/"+hash+".json";
            fs.writeFile(path, circumscription.localization, function(err) {
                if(err) {
                    callback(err);
                }else{
                    simulation.Circunscriptions[index].localizationPath = path;
                    callback();
                }
            });
        }else{
            callback();
        }
    }, function(err){
        if( err ) {
            console.log('A file failed to process');
            res.status(500).send("Failed to save localizations");
        } else {
            simulation.save(function(err){
                if(err){
                    res.status(500).send("Failed to save simulation");
                }else{
                    res.status(200).send(simulation._id.toString());
                }
            });
        }
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    if (check.string(id)) {
        Simulation.find({_id: id}, function (err, simulations) {
            if (simulations.length == 1) {
                var simulation = simulations[0];
                simulation.remove(function (err) {
                    if (err)
                        res.status(500).send("Error deleting");
                    else
                        res.status(200).send("Success");
                });
            } else {
                res.status(404).send("Simulation not found");
            }
        });
    } else {
        res.status(400).send("Bad format");
    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    if (check.string(id)) {
        Simulation.find({_id: id}, function (err, simulations) {
            if(err){
                res.status(404).send("Simulation not found");
            }else{
            if (simulations.length == 1) {
                var simulation = simulations[0].toObject();
                insertLocalizations(simulation,function(err){
                    if(err){
                        res.status(500).send("Error retrieving localizations");
                    }else{
                        simulation.id = simulation._id.toString();
                        res.status(200).json(simulation);
                    }
                })
            } else {
                res.status(404).send("Simulation not found");
            }}
        });
    } else {
        res.status(400).send("Bad format");
    }
};

exports.update = function (req,res) {
    var id = req.params.id;

    async.forEachOf(req.body.Circunscriptions, function(circumscription,index, callback) {
        //For each circumscription, save the localization
        if(circumscription.localization){
            var hash =crypto.createHash('sha256').update(circumscription.localization).digest('hex');
            var path = "files/"+hash+".json";
            fs.writeFile(path, circumscription.localization, function(err) {
                if(err) {
                    callback(err);
                }else{
                    circumscription.localizationPath = path;
                    callback();
                }
            });
        }else{
            callback();
        }
    }, function(err){
        if( err ) {
            console.log('A file failed to process');
            res.status(500).send("Failed to save localizations");
        } else {
            Simulation.update({_id: id}, req.body, function (err, numAffected) {
                if(err){
                    res.status(400).send("Error saving");
                }else{
                    res.status(200).send("success");
                }
            });
        }
    });
};
