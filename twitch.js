// twitch.js

module.exports = function(app, io) {
    var tmi = require('tmi.js');
    var auth = require('./confidential/auth.js')
    var simpleTimer = require('node-timers/simple')
    var util = require('./app/util.js')
    
    var options = {
        options: {
            debug: true 
        },
        connection: {
            cluster: 'aws',
            reconnect: true
        },
        identity: {
            username: auth.username,
            password: auth.password
        },
        channels: ['belkoca']
    }
    
    // create client and connect to twitch
    var client = new tmi.client(options)
    client.connect()

    /** Listen for certain events */
    
    // on subscription
    client.on('subscription', function(channel, username, method, message, userstate) {
        io.emit('subscribe', { username: username })
    }) 

    // on resub
    client.on('resub', function(channel, username, months, message, userstate, methods) {
        io.emit('resub', { username: username, months: months })
    })

    // on hosted
    client.on('hosted', function(channel, username, viewers, autohost) {
        io.emit('hosted', { username: username, viewers: viewers })
    })

    /**
     * Check if the channel is currently streaming,
     * if not, checks again every 5 seconds.
     */
    function checkIfOnline(callback) {
        var interval = setInterval(function() {
            client.api({
                url: 'https://api.twitch.tv/kraken/streams/' + auth.username.toLowerCase(),
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.twitchtv.v3+json',
                    'Client-ID': auth.clientID
                }
            }, function(err, res, body) {
                // check if stream value is null (meaning they are offline)
                if(body.stream == null) {
                    console.log(body)
                    console.log('Stream is offline, checking in 5 seconds...')
                } else {
                    console.log('Stream is online.')
                    clearInterval(interval) // stop interval
                    startTimer(body.stream.created_at) // call ze callback
                }
            })
        }, 5000)
    }

    /**
     * callback function to checkIfOnline()
     */
    function startTimer(created_at) {
        var simple = simpleTimer({pollInterval: 1000})
        simple.start()

        // boolean to track if message has been sent to client(s)
        var alreadySent = false
        // the magic number, how many minutes from next hour the timer
        // should appear
        var minutes = 5 

        simple.on('poll', function() {
            // time when stream started
            var timeStarted = Date.parse(created_at)
            // current time
            var currentTime = Date.now()
            // how long stream has been on
            var totalTime = currentTime - timeStarted
            // date for formatting milliseconds from totalTime
            var date = new Date(totalTime)
            // how many minutes from next hour
            var minutesUntilNextHour = 60 - date.getMinutes()
            // next hour in the stream
            var nextHour = Math.floor(totalTime / 3600000) + 1

            /** CURRENTLY TESTING */
            if(!alreadySent) {
                io.emit('timer', { time: totalTime })
                alreadySent = true
            }
            
            // tell view to show the timer, but only once each hour
            /*
            if(minutesUntilNextHour <= minutes && !alreadySent) {
                io.emit('timer', { time: util.convertMillisToTime(totalTime) })
                alreadySent = true
            }
            */
            
            /*
            // reset alreadySent boolean for the next hour
            if(minutesUntilNextHour != minutes && alreadySent) { 
                alreadySent = false
            }
            */
        })
    }

    // now check if the channel is online
    checkIfOnline(startTimer)
}
