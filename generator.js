///"StAuth10065: I Minh Dang, 746305 certify that this material is my original work.
// No other person's work has been used without due acknowledgement. 
//I have not made my work available to anyone else."
//connect to redis database
const redis = require('redis');
const channels = ["mashing", "boiling", "fermentation"]
const status = ["valid", "warning", "error"]
const messages = ["Lorem ipsum dolor sit amet",
 "Consectetur lorem donec massa",
 "At quis risus sed vulputate odio",
 "Consectetur adipiscing elit duis tristique",
 "Aenean euismod elementum nisi",
 "Tellus in hac habitasse platea",
 "Eu augue ut lectus arcu bibendum",
 "Purus in massa tempor nec",
 "Amet purus gravida quis blandit",
]

// For todays date;
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

const publisher = redis.createClient(
    {url: "redis://redis-14112.c13.us-east-1-3.ec2.cloud.redislabs.com:14112"
     ,password: "ouZjXZVpCKlRLzoeZAXQ2tVQL0tnx6Ta"
    }
);

publisher.on('connect', ()=>{
    console.log("connected to redis");
})

let newDate = new Date()
//Publish message every 1 second
function publishMessage()
{
    let cindex = Math.floor(Math.random() * 3)
    let sindex = Math.floor(Math.random() * 3)
    let mindex = Math.floor(Math.random() * 9)
    let messageToSend = {
        "status": status[sindex],
        "message": messages[mindex],
        "timestamp": newDate.today() + "  " + newDate.timeNow(),
        "channel": channels[cindex]
    }

    publisher.publish(channels[cindex],JSON.stringify(messageToSend))
    console.log(JSON.stringify(messageToSend))
    
    setTimeout(publishMessage, 1000);
}

publishMessage();

