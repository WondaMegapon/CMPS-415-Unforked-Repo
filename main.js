// Package Management~
var express = require('express'); // Rendering our material.
var cookieParser = require('cookie-parser'); // Grabbing and handling cookies.

var app = express(); // Our app~
app.listen(3000); // And our listener.

// Routes!
app.get('/', function(req, res) {
    res.send("Broil.");
})