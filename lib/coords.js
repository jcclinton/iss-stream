var Readable = require('stream').Readable;
var util = require('util');
var https = require('https');


exports.create = function(id, rate, transform){
	return new LocStream(id, rate, transform);
};


// dont reject self signed ca
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


util.inherits(LocStream, Readable);


// constructor for location stream
// id is the id of the satellite you want to track
// rate is how often you want to request info, it is measured in seconds between requests
// showDiff is a boolean that determines whether the lat/long relative to the last update will be shown or the absolute lat/long values
function LocStream(id, rate, showDiff){
	if( typeof id !== "number" || id <= 0){
		throw "invalid id";
	}

	// rate is the number of requests per minute
	// it must be a non-negative integer
	if( typeof rate !== "number" || rate <= 0 ){
		throw "invalid rate";
	}

	Readable.call(this);

	this._url = "https://api.wheretheiss.at/v1/satellites/" + id;
	this._timeout = rate * 1000;
	this._running = false;
	this._showDiff = showDiff;
	this.lastLat = null;
	this.lastLng = null;
	this._delayTimer = null;
}

/**
* _read is a private method used by the Readable class to extract data from the underlying resource
* in this case, the data is taken from the run function so _read does nothing
*
*/
LocStream.prototype._read = function(n){
	return this.push('');
}

// starts requesting data from the server
// when the data arrives, it will be put onto the stream
LocStream.prototype.start = function(){
		if( this._running ){
			return;
		}
		// clean up, just in case
		clearTimeout(this._delayTimer);

		this._running = true;
		run.call(this);
};


// stops requests and stops putting data in the stream
LocStream.prototype.stop = function(){
	// stop timeout if one exists
	clearTimeout(this._delayTimer);
	this._running = false;
}



// private functions

// request data from wheretheiss website
// when it arrives, put it in the stream
function run(){
		var that = this;

	// if we are not running, dont do anything
	if( !this._running ){
		return;
	}

	https.get(this._url, function(res){

		//console.log(res.headers["x-rate-limit-remaining"]);

		if( res.statusCode == 200 ){
			// data is valid
			res.on('data', function(data){
				// format response data and then push it to the stream
				that.push(format.call(that, data));
			});

			// set next request to fire after a timeout
			// dont set timeout if we have stopped running
			if( that._running ){
				setTimeout(function(){
					run.call(that);
				}, that._timeout);
			}

		}else if( res.statusCode == 404 ){
			// no data found for given id
			that.stop();
			that.emit('error');
		}else{
			// wheretheiss returns a 429 status code when the timeout has been exceeded
			// if we hit the rate limit, wait 60 seconds to start again
			var t = 1000 * 60;

			that.stop();
			this._delayTimer = setTimeout(function(){
				that.start();
			}, t);
		}

	});

}

// takes the given buffer
// converts it to an object
// gives it proper formatting
//
// return value of this function gets pushed to the stream
function format(buffer){

	var lat
		, lng
		, output
		, data
		;

	// convert buffer to object
	if( Buffer.isBuffer(buffer) ){
		data = bufferToObj(buffer);
	}

	lat = data.latitude;
	lng = data.longitude;


	// start building up the object that will be pushed to the stream
	output = {
		"id": data.id
	};


	if( this._showDiff ){
		// print relative lat/long difference

		if( this.lastLat == null || this.lastLng == null ){
			// first time running
			// dont push data onto stream
			// since there is nothing to show
			this.lastLat = lat;
			this.lastLng = lng;
			return '';
		}


		output.latDiff = this.lastLat - lat;
		output.lngDiff = this.lastLng - lng;
		this.lastLat = lat;
		this.lastLng = lng;

	}else{
		// print absolute lat/long values
		output.latitude = lat;
		output.longitude = lng;
	}

	return objToBuffer(output);
}

// converts buffer to object
function bufferToObj(buffer){
	return JSON.parse(buffer.toString());
}

// converts object to buffer
function objToBuffer(obj){
	return new Buffer(JSON.stringify(obj));
}
