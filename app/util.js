// app/util.js

module.exports = {
    /**
     * Converts millseconds to minutes and seconds
     * returns a string, ex: "4:44"
     * 
     * kinda long function name, I know.
     */
    convertMillisToMinutesAndSeconds: function(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0)
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
    }
}