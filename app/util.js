// app/util.js

module.exports = {
    /**
     * Converts millseconds to minutes and seconds
     * ex: "00:04:44"
     */
    convertMillisToTime: function(millis) {
        var hours = Math.floor(millis / 3600000)
        var minutes = Math.floor((millis - (hours * 3600000)) / 60000)
        var seconds = parseInt((millis - (hours * 3600000) - (minutes * 60000)) / 1000)

        if(hours < 10)
            hours = '0' + hours
        if(minutes < 10)
            minutes = '0' + minutes      
        if(seconds < 10)
            seconds = '0' + seconds

        return hours + ':' + minutes + ':' + seconds
    },

    /**
     * Converts time to millseconds
     * ex: "4:44" -> 4399528392 (not really but yeah)
     */
    convertTimeToMillis: function(t) {
        return Number(t.split(':')[0]) * (60000 * 60) + Number(t.split(':')[1]) * 60000 + Number(t.split(':')[2]) * 1000
    },

    /**
     * Cut the time from created_at in stream response
     * ex: 2017-10-26T13:17:22Z -> 13:17:22
     */
    getStartTime: function(created_at) {
        return (created_at.split('T').pop()).slice(0, -1)
    }
}