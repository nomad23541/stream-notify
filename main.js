// main.js

var express = require('express')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('static'))
app.set('view engine', 'ejs')

/* Setup Routes */

app.get('/', function(req, res) {
    res.render('index.ejs', {
        user: req.app.get('username')
    })
})

app.get('/subscribe', function(req, res) {
    res.render('subscribe.ejs', {
        user: req.app.get('username')
    })
})

app.get('/resub', function(req, res) {
    res.render('resub.ejs', {
        user: req.app.get('username'),
        months: req.app.get('months')
    })
})

app.get('/hosted', function(req, res) {
    res.render('hosted.ejs', {
        user: req.app.get('username'),
        viewers: req.app.get('viewers')
    })
})

// load tmi.js connectivity
require('./twitch.js')(app, io)

// listen on 3000
http.listen(3000, function() {
    console.log('Listening on port: ' + 3000)
})