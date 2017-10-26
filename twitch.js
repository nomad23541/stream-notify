// twitch.js

module.exports = function(app, io) {
    var tmi = require('tmi.js');
    var auth = require('./confidential/auth.js')
    var simpleTimer = require('node-timers/simple')
    
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

    /**
     * Check if the channel is currently streaming,
     * if not, checks again every 5 seconds.
     */
    function checkIfOnline(callback) {
        var interval = setInterval(function() {
            client.api({
                url: 'https://api.twitch.tv/kraken/streams/' + 'yoda',
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
                    console.log('Stream is now online!')
                    clearInterval(interval) // stop interval
                    startTimer() // call ze callback
                }
            })
        }, 5000)
    }

    /**
     * callback function to checkIfOnline()
     */
    function startTimer() {
        var simple = simpleTimer({pollInterval: 1000})
        simple.start()

        simple.on('poll', function() {
            // convert the current time to a readable format
            var convert = convertMillisToMinutesAndSeconds(simple.time())
            
            // probably not in best practice to check if the timer
            // has reach 55:00 by string, but oh well I'm 18, I can do what I want
            if(convert === '55:00') {
                // TODO: redirect to timer view (to be created)
            }
        })
    }

    // now check if the channel is online
    checkIfOnline(startTimer)

    /**
     * Converts millseconds to minutes and seconds
     * returns a string, ex: "4:44"
     * 
     * kinda long function name, I know.
     */
    function convertMillisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0)
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
    }
}
