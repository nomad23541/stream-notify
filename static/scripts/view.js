$(document).ready(function() {
    var socket = io();

    socket.on('subscribe', function(data) {
        subscribe(data.username);
    });

    socket.on('resub', function(data) {
        resub(data.username, data.months);
    });
    
    socket.on('hosted', function(data) {
        hosted(data.username, data.viewers);
    });

    /*
    socket.on('timer', function(data) {
        timer(data.time);
    });
    */

    timer(3590000);

    function subscribe(username) {
        var audio = document.createElement('audio');
        audio.setAttribute('src', 'sound/subscribe-notification.mp3');
    
        var container = $('#subscribe');
        container.find('.notif-main').text(username);
        container.fadeIn(0);
        container.addClass('animated bounceInLeft');
        audio.play();
        container.delay(8000).fadeOut('slow', function() { container.removeClass('animated bounceInLeft'); });
    }

    function resub(username, months) {
        var container = $('#resub');
        container.find('.notif-main').text(username);
        container.find('.notif-footer').text('resubbed for ' + months + ' months!');
        container.fadeIn(0);
        container.addClass('animated bounceInLeft');
        container.delay(8000).fadeOut('slow', function() { container.removeClass('animated bounceInLeft'); });
    }

    function hosted(username, viewers) {
        var container = $('#hosted');
        container.find('.notif-plain b#username').text(username);
        container.find('.notif-plain b#viewers').text(viewers);
        container.fadeIn(0);
        container.addClass('animated bounceInRight');
        container.delay(8000).fadeOut('slow', function() { container.removeClass('animated bounceInLeft'); });
    }

    function timer(time) {
        var colors = ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c'];
        var container = $('#timer');
        var timeLabel = container.find('.notif-plain b#time');
        
        timeLabel.text(convertMillisToTime(time));
        container.fadeIn(0);
        container.addClass('animated bounceInRight');

        var currentHour = Math.floor(time / 3600000);
        var nextHour = currentHour + 1;

        // continue to count up the timer from here
        setInterval(function() {
            time += 1000
            currentHour = Math.floor(time / 3600000);

            timeLabel.text(convertMillisToTime(time));

            console.log('current time: ' + time); // debugging

            // when the next hour has been reached
            if(currentHour == nextHour) {
                timeLabel.css({'color': 'white'});
                timeLabel.addClass('flash');

                setTimeout(function() {
                    timeLabel.animate({'color': '#9b59b6'}, 4000);
                }, 500);

                // remove flash after 4 seconds and start slow fade out
                setTimeout(function() {
                    timeLabel.removeClass('flash');
                    container.fadeOut(9000, function() { container.removeClass('animated bounceInLeft'); });
                }, 2000);

                nextHour += 1; // stop this if statement from repeating
            }
        }, 1000);
    }

    function convertMillisToTime(millis) {
        var hours = Math.floor(millis / 3600000);
        var minutes = Math.floor((millis - (hours * 3600000)) / 60000);
        var seconds = parseInt((millis - (hours * 3600000) - (minutes * 60000)) / 1000);

        if(hours < 10)
            hours = '0' + hours;
        if(minutes < 10)
            minutes = '0' + minutes;    
        if(seconds < 10)
            seconds = '0' + seconds;

        return hours + ':' + minutes + ':' + seconds;
    }
});