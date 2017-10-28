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

    socket.on('timer', function(data) {
        timer(data.time);
    });

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
        var container = $('#timer');
        container.find('.notif-plain b#time').text(time);
        container.fadeIn(0);
        container.addClass('animated bounceInRight');
        container.delay(8000).fadeOut('slow', function() { container.removeClass('animated bounceInLeft'); });
    }
});