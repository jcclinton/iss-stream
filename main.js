var loc = require("./loc_data.js");

var iss = loc.create(25544, 60);

iss.on('readable', function(){
	console.log('data readeable');
});

iss.on('data', function(chunk){
	console.log('data chunk: ' + chunk);
});

iss.start();
