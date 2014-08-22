var coords = require("./coords.js");

var id = 25544;
var rate = 60; // 60 requests / second

// create coords stream for iss
var iss = coords.create(id, rate);

iss.on('readable', function(){
	var data = iss.read();
	if( data ){
		console.log('data readeable: ' + data);
	}
});

/*
iss.on('data', function(chunk){
	console.log('data chunk: ' + chunk);
});
*/

iss.on('error', function(){
	console.log('data stream errored');
});

iss.start();
