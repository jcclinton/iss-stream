var loc = require("./coords.js");

var iss = loc.create(25544, 60);

iss.on('readable', function(){
	var data = iss.read();
	console.log('data readeable: ' + data);
});

/*
iss.on('data', function(chunk){
	console.log('data chunk: ' + chunk);
});
*/

iss.start();

setTimeout(function(){
	iss.stop();
}, 10000);
