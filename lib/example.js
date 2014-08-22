var coords = require("./loc_stream.js");

var id = 25544;
var rate = 2; // run every 2 seconds

// create coords stream for iss
var iss = coords.create(id, rate, true);

iss.on('readable', function(){
	var data = iss.read();
	if( data ){
		console.log(""+data);
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

setTimeout(function(){
	console.log("stopping");
	iss.stop();
}, 6000);

setTimeout(function(){
	console.log("starting");
	iss.start();
}, 15000);
