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
    
    var client = new tmi.client(options)
    client.connect()

    /** TESTING FOR NOW */
    client.on('chat', function (channel, userstate, message, self) {
        // store the username in app.set
        app.set('username', userstate.username)

        if(message === '!subscribe')
            io.emit('subscribe', { for: 'everyone' })
        else if(message === '!hosted')
            io.emit('hosted', { for: 'everyone' })
    })

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
}
