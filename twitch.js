// twitch.js

module.exports = function(app, io) {
    var tmi = require('tmi.js')
    var auth = require('./confidential/auth.js')
    var simpleTimer = require('node-timers/simple')
    var util = require('./app/util.js')
    var config = require('./config.json')
    
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
        channels: [auth.channelName]
    }
    
    // create client and connect to twitch
    var client = new tmi.client(options)
    client.connect()

    /**
     * TODO:
     * 
     * Add !promo, read from text file n such
     */

    // chat variables
    var game
    
    // on chat
    client.on('chat', function(channel, userstate, message, self) {
        if(self) return

        if(message == '!about') {
            // return hard-coded commands and find commands in the config.json
            var commands = '!game !credit'
            for(var i = 0; i < config.commands.length; i++) {
                commands += ' ' + config.commands[i].command
            }

            client.action(auth.channelName, 'Avaliable commands are: ' + commands)
        }

        if(message == '!credit') {
            client.action(auth.channelName, 'https://chrisreading.net/')
        }

        if(message == '!game') {
            client.action(auth.channelName, game)
        }

        // get configurable commands from config.json
        for(var i = 0; i < config.commands.length; i++) {
            if(message == config.commands[i].command) {
                client.action(auth.channelName, config.commands[i].message)
            }
        }
    })
    
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
     * Get a list of all followers and notify the view
     * if there is a new one
     * 
     * Checks every 30 seconds
     */
    function checkFollowers() {
        var sent = [] // usernames already sent to the view

        setInterval(function() {
            client.api({
                url: 'https://api.twitch.tv/kraken/channels/' + auth.username.toLowerCase() + '/follows',
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.twitchtv.v3+json',
                    'Client-ID': auth.clientID
                }
            }, function(err, res, body) {
                var currentDate = Date.now()
    
                for(var i = 0; i < body.follows.length; i++) {
                    var username = body.follows[i].user.display_name
                    var dateFollowed = body.follows[i].created_at
    
                    // only grab followers if they have followed within the last 10 minutes
                    if(Date.parse(dateFollowed) > currentDate - 600000) {
                        if(!util.contains(username, sent)) {
                            io.emit('followed', { username: username })
                            sent.push(username)
                        }
                    }   
                }
    
            })
        }, 30000)
    }

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

                    // get other stream details
                    game = body.stream.game
                }
            })
        }, 5000)
    }

    /**
     * callback to checkIfOnline()
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
            
            // tell view to show the timer, but only once each hour
            if(minutesUntilNextHour <= minutes && !alreadySent) {
                io.emit('timer', { time: totalTime })
                alreadySent = true
            }
            
            // reset alreadySent boolean for the next hour
            if(minutesUntilNextHour > minutes && alreadySent) {
                alreadySent = false
            }
        })
    }

    // start checking if stream is online
    checkIfOnline(startTimer)
    // check for new followers
    checkFollowers()
}
