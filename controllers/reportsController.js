var check = require('check-types'),
    Report = require('../models/Report'),
    fs = require("fs"), async = require("async"),
    moment = require('moment'), crypto = require('crypto');

var insertTerritories = function(report,finalCallback){
    async.each(Object.keys(report.territories),function(territoryName,callback){
        var path =report.territories[territoryName];
        if(path){
            fs.readFile(path,'utf8',function(err,data){
                if(err){
                    callback(err);
                }else{
                    report.territories[territoryName] = data;
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

var extractTerritories = function(report,finalCallback){
    async.each(Object.keys(report.territories),function(territoryName,callback){
        var territory = report.territories[territoryName];
        if(territory){
            var hash =crypto.createHash('sha256').update(territory).digest('hex');
            var path = "files/"+hash+".json";
            fs.writeFile(path, territory, function(err) {
                if(err) {
                    callback(err);
                }else{
                    report.territories[territoryName] = path;
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
    var sendList = function(reportDocs){
        var reports = [];
        for(var i = 0;i<reportDocs.length;i++){
            var report = reportDocs[i].toObject();
            report.id = report._id;
            reports.push(report);
        }
        async.each(reports,insertTerritories,function(err){
            if(err){
                res.status(500).send(err);
            }else{
                res.status(200).json(reports);
            }
        });
    };

        if(req.query.creator){
            console.log("Report by creator request");
            Report.find({ creator: req.query.creator }).exec(function(err,docs){
                sendList(docs);
            });
        }else{
            console.log("List report request");
            Report.find({}).exec(function(err,docs){
                sendList(docs);
            });
    }
};


exports.create = function (req, res) {
    extractTerritories(req.body,function(err){
        if(err){
            res.status(500).send("Failed to save report files");
        }else{
            var report = new Report(req.body);
            report.save(function(err){
                if(err){
                    res.status(500).send("Failed to save report");
                }else{
                    res.status(200).send(report._id.toString());
                }
            });
        }
    });
};

exports.delete = function (req, res) {
    var id = req.params.id;
    if (check.string(id)) {
        Report.find({_id: id}, function (err, reports) {
            if (reports.length == 1) {
                var report = reports[0];
                report.remove(function (err) {
                    if (err)
                        res.status(500).send("Error deleting");
                    else
                        res.status(200).send("Success");
                });
            } else {
                res.status(404).send("Report not found");
            }
        });
    } else {
        res.status(400).send("Bad format");
    }
};

exports.get = function (req, res) {
    var id = req.params.id;
    if (check.string(id)) {
        Report.find({_id: id}, function (err, reports) {
            if(err){
                res.status(404).send("Report not found");
            }else{
                if (reports.length == 1) {
                    var report = reports[0].toObject();
                    insertTerritories(report, function(err){
                        if(err){
                            res.status(500).send("Files not found for report.")
                        }else{
                            report.id = report._id.toString();
                            res.status(200).json(report);
                        }
                    });

                } else {
                    res.status(404).send("Report not found");
                }
            }
        });
    } else {
        res.status(400).send("Bad format");
    }
};

exports.update = function (req,res) {
    var id = req.params.id;

    extractTerritories(req.body,function(err){
        if(err){
            res.status(500).send("Failed to save report files");
        }else{
            Report.update({_id: id}, req.body, function (err, numAffected) {
                if(err){
                    res.status(400).send("Error saving");
                }else{
                    res.status(200).send("success");
                }
            });
        }
    });


};
