///"StAuth10065: I Minh Dang, 746305 certify that this material is my original work.
// No other person's work has been used without due acknowledgement. 
//I have not made my work available to anyone else."



const app = require('express')();
const redis = require('redis');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SlackBot = require('slackbots');

//Slackbot
const bot = new SlackBot({
    token: 'xoxb-791981539143-777351271090-OPWcYQszofHntZ0I1icNDJX2',
    name: 'yelphelp'
});

let defaultparams = {
    icon_emoji: 'robot_face'
}

let errorParams = {
    icon_emoji: 'exclamation'
}


//Send a welcome message when bot is called
bot.on('start', () => {
    bot.postMessageToChannel('general', 'Update status to Microbrewery Process', defaultparams);
});



//error handler
bot.on('error', err => console.log(err));

//message event handler
bot.on('message', data => {
    if(data.type !== 'message'){
        return;
    }
    handleMessage(data.text);
})

//This function handle message in the group chat, dectect command and call appropriate query function
function handleMessage(message){

    //Update Status
    if(message.includes('StatusUpdate ')){
        //slice the command string to get the request number of restaurants and address
        let commandDetails = message.substring(13);
        let [status, ...text] = commandDetails.split(" ")
        text = text.join(" ");
        updateStatus(status, text);
    }

}


//This function insert a message into the database
function updateStatus(status, message){
    let jsondata = {};
    jsondata['status'] = status;
    jsondata['message'] = message;
    jsondata['timestamp'] = getCurrentTimeStamp();
    jsondata['channel'] = "mashing",
    memory.push(jsondata);
    io.emit('allrecords', memory);

    bot.postMessageToChannel('general', `Status inserted successfully`, defaultparams);
}

//Redis subscriber
const subscriber = redis.createClient(
    {url: "redis://redis-14112.c13.us-east-1-3.ec2.cloud.redislabs.com:14112"
     ,password: "ouZjXZVpCKlRLzoeZAXQ2tVQL0tnx6Ta"
    }
);

//create array to store all the messages from all the channels
let memory = []


subscriber.monitor(function (err, res) {	
    console.log("Enabled monitoring mode.");
});

 //Receive status update from FaaS
subscriber.on("monitor", function (time, args, raw_reply) {
    if(args[0] == 'hmset' || args[0]=='set'){
        
        let jsondata = {};
        jsondata['status'] = args[2];
        jsondata['message'] = args[3];
        jsondata['timestamp'] = getCurrentTimeStamp();
        jsondata['channel'] = "boiling"
        memory.push(jsondata);
        io.emit('allrecords', memory);
    }
});

subscriber.subscribe("mashing");
subscriber.subscribe("boiling");
subscriber.subscribe("fermentation");

subscriber.on('connect', ()=>{
    console.log("connected to redis");
})
subscriber.on('message', (channel, message)=>{
    //store messages on memory
    console.log(message)
    memory.push(JSON.parse(message))
    //use socket to send data to the front end
    io.emit('allrecords', memory)


})

//send data to the front end
io.on('connection', function (socket) {
    console.log("Socket connected")

});

app.get('/', function (req, res) {
    io.emit('allrecords', memory);
    console.log()
    res.sendFile(__dirname + '/index.html')
});


http.listen(3000,() => {
    console.log("server is listening to port 3000");
})