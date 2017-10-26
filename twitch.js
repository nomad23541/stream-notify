// twitch.js

module.exports = function(app, io) {
    var tmi = require('tmi.js');
    var auth = require('./confidential/auth.js')
    
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
        // TODO: add timer
    }

    // now check if the channel is online
    checkIfOnline(startTimer)
}
