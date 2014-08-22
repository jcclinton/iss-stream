var locStream = require('../lib/loc_stream')
	, id
	, rate
	;

id = 25544;
rate = .001; // run every second


exports['request'] = function(test){
	var stream = locStream.create(id, rate, false);

	test.expect(1);

	stream.on('readable', function(){
		var buffer = iss.read()
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
		test.done();
	});
	stream.start();

};

exports['exceptions'] = function(test){

	test.throws(function(){ locStream.create(0, rate, false) });
	test.throws(function(){ locStream.create(id, 0, false) });
	test.throws(function(){ locStream.create(-1, rate, false) });
	test.throws(function(){ locStream.create(id, -1, false) });

	test.throws(function(){ locStream.create('a', rate, false) });
	test.throws(function(){ locStream.create(id, 'a', false) });
	test.throws(function(){ locStream.create(null, rate, false) });
	test.throws(function(){ locStream.create(id, null, false) });

	test.done();
};
