// main.js

var express = require('express')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('static'))
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
    res.render('index.ejs')
})

// load tmi.js connectivity
require('./twitch.js')(app, io)

// listen on 3000
http.listen(3000, function() {
    console.log('Listening on port: ' + 3000)
})