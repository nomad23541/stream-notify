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
        app.set('username', username)

        // unsure if this is a correct call
        //app.set('plan', method.plan)

        io.emit('subscribe', { for: 'everyone' })
    }) 

    // on resub
    client.on('resub', function(channel, username, months, message, userstate, methods) {
        app.set('username', username)
        app.set('months', months)

        io.emit('resub', { for: 'everyone' })
    })

    // on hosted
    client.on('hosted', function(channel, username, viewers, autohost) {
        app.set('username', username)
        app.set('viewers', viewers)

        io.emit('hosted', { for: 'everyone' })
    })


    // check the last followers
    // TODO: make this actually work sometime...
    /*
    client.api({
        url: 'https://api.twitch.tv/kraken/channels/' + auth.username.toLowerCase() + '/follows?&limit=25&offset=0',
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.twitchtv.v3+json',
            'Client-ID': auth.clientID
        }
    }, function(err, res, body) {
        console.log(body)
    })
    */

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

        simple.on('poll', function() {
            // time when stream started
            var timeStarted = Date.parse(created_at)

            // current time
            var currentTime = Date.now()

            // how long stream has been on
            var totalTime = currentTime - timeStarted
            
            var date = new Date(totalTime)

            // how many millseconds from next hour
            var minutesUntilNextHour = 60 - date.getMinutes()

            // next hour in the stream
            var nextHour = Math.floor(totalTime / 3600000) + 1
            
            // tell view to show the timer, but only once each hour
            if(minutesUntilNextHour == 5 && !alreadySent) {
                console.log('5 minutes until ' + nextHour)
                io.emit('timer', { msg: util.convertMillisToTime(totalTime) })
                alreadySent = true
            } 

            // reset alreadySent boolean for the next hour
            if(minutesUntilNextHour != 5 && alreadySent) { 
                alreadySent = false
            }

            // console.log('Stream Time: ' + util.convertMillisToTime(totalTime) + ' Minutes Until Next Hour: ' + minutesUntilNextHour + ' Next Hour: ' + nextHour)
            
        })
    }

    // now check if the channel is online
    checkIfOnline(startTimer)
}
