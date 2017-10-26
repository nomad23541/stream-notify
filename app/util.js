// app/util.js

module.exports = {
    /**
     * Converts millseconds to minutes and seconds
     * ex: "4:44"
     */
    convertMillisToTime: function(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0)
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
    },

    /**
     * Cut the time from created_at in stream response
     * ex: 2017-10-26T13:17:22Z -> 13:17:22
     */
    getStartTime: function(created_at) {
        return (created_at.split('T').pop()).slice(0, -1)
    }
}