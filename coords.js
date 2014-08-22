var Readable = require('stream').Readable;
var util = require('util');
var https = require('https');
var _ = require('underscore');


// dont reject self signed ca
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

util.inherits(Coords, Readable);

function Coords(id, rate, transform){
	if(!_.isNumber(id) || id <= 0){
		throw "invalid id";
	}

	// rate is the number of requests per minute
	// it must be a non-negative integer
	if( !_.isNumber(rate) || rate <= 1 ){
		throw "invalid rate";
	}

	Readable.call(this);

	this._url = "https://api.wheretheiss.at/v1/satellites/" + id;
	this._timeout = Math.round((60 * 1000) / rate);
	this._running = false;
	this._transform = transform;
	this.lastLat = null;
	this.lastLng = null;
}

Coords.prototype._read = function(n){
	return this.push('');
}

Coords.prototype.start = function(){
		if( this._running ){
			return;
		}
		this._running = true;
		this._run();
};


Coords.prototype._run = function(){
		var that = this;

	if( !this._running ){
		return;
	}

	https.get(this._url, function(res){

		//console.log(res.headers["x-rate-limit-remaining"]);

		// wheretheiss returns a 429 status code when the timeout has been exceeded
		if( res.statusCode == 200 ){
			res.on('data', function(data){
				that.push(that._format(data));
			});

			// set next request to fire after a timeout
			setTimeout(function(){
				that._run();
			}, that._timeout);

		}else if( res.statusCode == 404 ){
			that.stop();
			that.emit('error');
		}else{
			// if we hit the rate limit, wait 60 seconds to start again
			var t = 1000 * 60;

			that.stop();
			setTimeout(function(){
				that.start();
			}, t);
		}

	});

}


Coords.prototype.stop = function(){
	this._running = false;
}

Coords.prototype._format = function(buffer){

	var lat
		, lng
		, diff
		, data
		;

	// if we are not transforming the data
	// just pass it straight through
	if( !this._transform ){
		return buffer;
	}

	//data = JSON.parse(buffer.toJSON());
	data = JSON.parse(buffer.toString());

	lat = data.latitude;
	lng = data.longitude;
	//console.log(data);
	//console.log(this.lastLat);


	if( this.lastLat == null || this.lastLng == null ){
		this.lastLat = lat;
		this.lastLng = lng;
		return '';
	}

	diff = {};

	diff.latDiff = this.lastLat - lat;
	diff.lngDiff = this.lastLng - lng;
	this.lastLat = lat;
	this.lastLng = lng;

	return new Buffer(JSON.stringify(diff));
}



exports.create = function(id, rate, transform){
	return new Coords(id, rate, transform);
};
