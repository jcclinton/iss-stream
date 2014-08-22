var Readable = require('stream').Readable;
var util = require('util');
var https = require('https');
var _ = require('underscore');


// dont reject unauthorized ca
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

util.inherits(Coords, Readable);

function Coords(id, rate){
	if(!_.isNumber(id) || id <= 0){
		throw "invalid id";
	}

	// rate is the number of requests per minute
	// it must be a non-negative integer
	// it cant be run more than once per second
	if( !_.isNumber(rate) || rate <= 1 || rate > 60 ){
		throw "invalid rate";
	}

	Readable.call(this);

	this._id = id;
	this._rate = rate;
	this._interval = null;
}

Coords.prototype._read = function(n){
}

Coords.prototype.start = function(){
	var milliseconds
		, that = this
		, url = "https://api.wheretheiss.at/v1/satellites/" + this._id
		;

		// convert requests/minute to milliseconds/request
		milliseconds = Math.round((60 * 1000) / this._rate);

	this._interval = setInterval(function(){

		https.get(url, function(res){

			res.on('data', function(data){
				that.push(data);
			});
		});

	}, milliseconds);

};


Coords.prototype.stop = function(){
	if(this._interval){
		clearInterval(this._interval);
		this._interval = null;
	}
}



exports.create = function(id, rate){
	return new Coords(id, rate);
};
