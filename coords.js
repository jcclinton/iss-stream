var Readable = require('stream').Readable;
var util = require('util');
var https = require('https');
var _ = require('underscore');


process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

util.inherits(Coords, Readable);

function Coords(id, rate){
	if(!_.isNumber(id) || id <= 0){
		throw "invalid id";
	}

	// rate is the number of requests per minute
	// so it must be a non-negative integer
	// it cant go more than once per second
	if( !_.isNumber(rate) || rate <= 1 || rate > 60 ){
		throw "invalid rate";
	}

	Readable.call(this);

	this._id = id;
	this._rate = rate;
	this._interval = null;
	this._locs = [];
}

Coords.prototype._read = function(){
	var len
		, data
		;

	len = this._locs.length;

	console.log("reading");
	if(this._locs.length > 0){
		data = this._locs.shift();
		this.push(data);
	}else{
		this.push(null);
	}
}

Coords.prototype.start = function(){
	var milliseconds
		, that = this
		, url = "https://api.wheretheiss.at/v1/satellites/" + this._id
		;

		// convert reqs/minute to milliseconds/req
		milliseconds = Math.round((60 * 1000) / this._rate);

	this._interval = setInterval(function(){

		https.get(url, function(res){

			res.on('data', function(data){
				//console.log("got response: " + data);
				console.log("response");
				that.push(data);
				//that._locs.push(data);
			});
		});

	}, milliseconds);

};


Coords.prototype.stop = function(){
	if(this._interval){
		clearInterval(this._interval);
		this._interval = null;
	}
	this._locs = [];
}



exports.create = function(id, rate){
	return new Coords(id, rate);
};
