#### Location Stream Documenation

###### usage
Import lib/loc\_stream.js. Create readable stream by calling `create(id, rate, showDiff)` method. Id is the id of the satellite you wish to track, rate is the time interval between updates (measured in seconds) and showDiff is a boolean value that determines whether you will be reading the absolute lat/lng values or the relative lat/lng diffs.

Id and rate must be non-negative numbers or an exception will be thrown.

###### test
To run the unit tests, run `npm-run-script test` from the command line in the top level directory of the library.
