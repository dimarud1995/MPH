const axios = require('axios');
var fs = require('fs');
var path = require('path');


var iterator = 0;

function intervalFunc() {
    console.log('Minutes in work: ' + iterator++);
}

function getNewPostWarhouses() {
    var data = {
        "modelName": "AddressGeneral",
        "calledMethod": "getWarehouses",
        "methodProperties": {
            "Language": "ua"
        },
        "apiKey": "7411e5c35fdc1359b24bd4c8bfb707b0"
    }
    console.log(data);
    axios.post('https://api.novaposhta.ua/v2.0/json/', data).then(res => {
        console.log("data");
        if (res.data) {
            var temp = JSON.stringify(res.data);
            fs.writeFile(path.join(__dirname, "../data/newPostWarhouses.json"), temp, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            console.log("Downloaded");
        }
    })

}
setInterval(intervalFunc, 60000);
setInterval(getNewPostWarhouses, 86345000);