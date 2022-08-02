const { resetalldocs } = require("./functions");

const resetUplods = () => {
    console.log("rest timer started")
    setInterval(function () {
        console.log("reseting uplods")
        var date = new Date();
        if (date.getDate() === 1) {
            resetalldocs()
        }
    }, 24*60*60*1000)
}

module.exports = resetUplods