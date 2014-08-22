var locStream = require('../lib/loc_stream')
	, specify = require('specify')
	, id
	, rate
	;

id = 25544;
rate = .001; // run every second


// test that lat/lng values get put in stream
specify('request-absolute', function(test){
	var stream = locStream.create(id, rate, false);

	test.expect(1);

	stream.on('readable', function(){
		var buffer = stream.read()
			, newId
			, data
			, lat
			, lng
			;

		if( buffer ){
			data = JSON.parse(buffer.toString());
			newId = data.id;
			lat = data.latitude;
			lng = data.longitude;
			test.equal(typeof lat, "number");
			test.equal(typeof lng, "number");
			test.equal(data.id, id);
			stream.stop();
		}
	});
	stream.start();

});

// test that lat/lng differences get put in stream
specify('request-relative', function(test){
	var stream = locStream.create(id, rate, true);

	test.expect(1);

	stream.on('readable', function(){
		var buffer = stream.read()
			, newId
			, data
			, lat
			, lng
			;

		if( buffer ){
			data = JSON.parse(buffer.toString());
			newId = data.id;
			lat = data.latDiff;
			lng = data.lngDiff;
			test.equal(typeof lat, "number");
			test.equal(typeof lng, "number");
			test.equal(data.id, id);
			stream.stop();
		}
	});
	stream.start();

});

// run through all bad inputs
specify('exceptions', function(test){

	// list of some bad inputs
	var list = [
		[0, rate],
		[id, 0],
		[-1, rate],
		[id, -1],

		['a', rate],
		[id, 'a'],
		[null, rate],
		[id, null]
	];

	test.expect(list.length);

	for(var i = 0; i < list.length; i++){
		try{
			locStream.create.apply(null, list[i]);
			// should never get here
			test.ok(false);
		}catch(e){
			// should always get here
			test.ok(true);
		}
	}

});

specify.run();
