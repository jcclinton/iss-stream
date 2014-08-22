var Readable = require('stream').Readable;
var util = require('util');
var https = require('https');
var _ = require('underscore');


// dont reject self signed ca
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

util.inherits(Coords, Readable);

function Coords(id, rate){
	if(!_.isNumber(id) || id <= 0){
		throw "invalid id";
	}

	// rate is the number of requests per minute
	// it must be a non-negative integer
	if( !_.isNumber(rate) || rate <= 1 ){
		throw "invalid rate";
	}

	Readable.call(this);

	this._id = id;
	this._rate = rate;
	this._running = false;
}

Coords.prototype._read = function(n){
}

Coords.prototype.start = function(){
		if( this._running ){
			return;
		}
		this._running = true;
		this._run();
};


Coords.prototype._run = function(){
	var milliseconds = Math.round((60 * 10) / this._rate)
		, url = "https://api.wheretheiss.at/v1/satellites/" + this._id
		, that = this
		;

	if( !this._running ){
		return;
	}

	https.get(url, function(res){

		console.log(res.headers["x-rate-limit-remaining"]);

		// wheretheiss returns a 429 status code when the timeout has been exceeded
		if( res.statusCode == 200 ){
			res.on('data', function(data){
				that.push(data);
			});

			setTimeout(function(){
				that._run();
			}, milliseconds);

		}else{
			// if we hit the rate limit, wait 60 seconds to start again
			console.log("rate limit");
			var t = 1000 * 60;

			that.stop();
			setTimeout(function(){
				console.log("starting again");
				that.start();
			}, t);
		}

	});

}


Coords.prototype.stop = function(){
	this._running = false;
}



exports.create = function(id, rate){
	return new Coords(id, rate);
};
