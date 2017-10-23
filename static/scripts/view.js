$(document).ready(function() {
    var socket = io();

    socket.on('subscribe', function(msg) {
        window.location.href = 'subscribe';
    });

    socket.on('resub', function(msg) {
        window.location.href = 'resub';
    });
    
    socket.on('hosted', function(msg) {
        window.location.href = 'hosted';
    });
});

function subscribe() {
    var audio = document.createElement('audio');
    audio.setAttribute('src', 'sound/subscribe-notification.mp3');
    
    var container = $('#subscribe-notify');
    container.fadeIn(0);
    container.addClass('animated bounceInLeft');
    audio.play();
    container.delay(8000).fadeOut('slow', function() { container.removeClass('animated bounceInLeft'); });
}

function hosted() {
    var container = $('#host-notify');
    container.fadeIn(0);
    container.addClass('animated bounceInRight');
    container.delay(8000).fadeOut('slow', function() { container.removeClass('animated bounceInRight'); });
}

function counter() {
    var container = $('#counter-notify');
}