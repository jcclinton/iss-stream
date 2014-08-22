var locStream = require('../lib/loc_stream')
	, id
	, rate
	;

id = 25544;
rate = 1; // run every second


exports['run'] = function(test){
	var stream = locStream.create(id, rate, false);
	test.equal(1, 1);
	test.done();
};
