var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    app = express(),
    http = require('http').Server(app),
    readLine = require('readline');

Array.prototype.findBy = function (item, attr) {
	if (attr === undefined)
		return this.indexOf(item);
	for (var i = 0; i < this.length; i++) {
		if (this[i][attr] === item[attr])
			return i;
	}
	return -1;
};

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(methodOverride('_method'));

var simulations = require('./routes/simulations');
app.use('/api/simulations', simulations);

mongoose.connect('mongodb://localhost/datacore');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

	http.listen(4000, function () {
	  console.log('DataCore listening on port 4000');
	});

});