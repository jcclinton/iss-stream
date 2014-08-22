#### ISS tracker
This is a node app that tracks the latitude/longitude of the international space station and puts it in a readable stream.

Read `doc/readme.md` for commands and usage.

#### libs

This package containst two libraries.

LocStream is a class that takes an id and a rate and tracks a satellites lat/lng.

DiffStream is a class that takes an id and a rate and shows the difference in lat/lng since the last measurement was taken. DiffStream uses LocStream as its underlying base.
