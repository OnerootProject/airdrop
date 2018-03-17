
var Airdrop = require("./src/Airdrop.js");
var fs = require("fs");
deleteLogs()//delete logs
let pwd = process.argv.splice(2)[0]; // get password from command
var config=JSON.parse(fs.readFileSync("./config/config.json"));

config.pwd=pwd;
var send = new Airdrop(config);

send.start(config.src)

function deleteLogs(){
    if(fs.existsSync('./logs/send.log'))
        fs.renameSync('./logs/send.log','./logs/send_'+new Date()+'.log')
    if(fs.existsSync('./logs/recv.log'))
        fs.renameSync('./logs/recv.log','./logs/recv_'+new Date()+'.log')
    if(fs.existsSync('./logs/error.log'))
        fs.renameSync('./logs/error.log','./logs/error_'+new Date()+'.log')
}


