var Readable = require('stream').Readable;
var LocStream = require('./loc_stream.js');
var util = require('util');
var https = require('https');


exports.create = function(id, rate){
	return new DiffStream(id, rate);
	//return new LocStream(id, rate, transform);
};


util.inherits(DiffStream, Readable);

// constructor for location stream
// id is the id of the satellite you want to track
// rate is how often you want to request info, it is measured in seconds between requests
function DiffStream(id, rate){
	Readable.call(this);

	// create new loc stream
	this._locStream = LocStream.create(id, rate);
	this._lastLat = null;
	this._lastLng = null;

	var that = this;

	// read data off the stream, then write to our own stream
	this._locStream.on('readable', readStream);

	function readStream(){
		var buffer = that._locStream.read()
			, data
			, lat
			, lng
			, output
			;

		if( buffer ){
			data = bufferToObj(buffer);

			lat = data.latitude;
			lng = data.longitude;

			if( that._lastLat == null || that._lastLng == null ){
				// first time running
				// dont push data onto stream
				// since there is nothing to show
				that._lastLat = lat;
				that._lastLng = lng;
				return '';
			}

			output = {};
			output.id = data.id;
			output.latDiff = that._lastLat - lat;
			output.lngDiff = that._lastLng - lng;
			that._lastLat = lat;
			that._lastLng = lng;

			return that.push( objToBuffer(output) );

		}
	}
}

DiffStream.prototype._read = function(){
	return this.push('');
};


// starts requesting data from the server
// when the data arrives, it will be put onto the stream
DiffStream.prototype.start = function(){
	this._locStream.start();
};


// stops requests and stops putting data in the stream
DiffStream.prototype.stop = function(){
	this._locStream.stop();
}


// converts buffer to object
function bufferToObj(buffer){
	return JSON.parse(buffer.toString());
}

// converts object to buffer
function objToBuffer(obj){
	return new Buffer(JSON.stringify(obj));
}
