var fs = require("fs");
var readline = require('readline');
class Send {
    constructor(config) {
        this.config=config;
        let Web3 = require("web3");
        this.web3 = new Web3(config.node);

        if(config.privateKey){
            this.senderAccount=this.web3.eth.accounts.wallet.add(config.pwd)

        }else{
            this.senderAccount = this.web3.eth.accounts.decrypt(config.wallet, config.pwd)
        }
        console.log(this.senderAccount)

        this.web3.eth.accounts.defaultAccount = this.senderAccount.address;
        let abi = this.readContractAbi(config.contractABI);
        this.Contract = new this.web3.eth.Contract(abi, config.contractAddr);

        let log4js = require('log4js');
        log4js.configure('./config/log4js.json');
        this.sendLogger = log4js.getLogger('send');
        this.recvLogger = log4js.getLogger('recv');
        this.errorLogger = log4js.getLogger('error');

        this.lastNonce = 0;
        this.loadNum = 100;
    }

    readContractAbi(_path) {
        return JSON.parse(fs.readFileSync(_path));
    }


    start(src){
        let lineReader=readline.createInterface({input:fs.createReadStream(src)})
        let lines=[]
        lineReader.on('line',(line)=>{

            if(line !=''){
                let ls=line.split(" ");
                if(this.checkInput(ls)){
                    let ll={
                        // id:i++,
                        addr:ls[0].toLowerCase(),
                        amount:ls[1]
                    }
                    lines.push(ll)
                }

            }

        }).on('close',()=>{
            // console.log(lines.length)
            this.batchSend(lines)
        })
    }
    checkInput(ls){
        if(ls[0]==null||ls[0]==''){
            return false;
        }
        if(!ls[0].toLowerCase().indexOf('0x')<0&&ls[0].length!=42){
            return false;
        }
        if(ls[0].toLowerCase().indexOf('0x')<0&&ls[0].length!=40){
            return false;
        }
        if(ls[1]==null||ls[1]==''||!ls[1].match(/^-?[0-9.]+/)||ls[1]*1<=0){
            return false;
        }
        return true;
    }


    batchSend(lines) {
        let loadNum = this.loadNum, ls = [], addrs = [], values = [];
        for (let i = 0; i < lines.length; i++) {
            addrs[i % loadNum] = lines[i].addr;
            values[i % loadNum] = this.web3.utils.toWei(lines[i].amount, "ether");
            if (i % loadNum == loadNum - 1) {
                if (addrs.length > 0) {
                    ls.push({addrs: addrs, values: values})
                }
                addrs = [], values = []
            }

        }
        if (addrs.length > 0) {
            ls.push({addrs: addrs, values: values})
        }
        let i = 0;

        var clock = setInterval(() => {

            if (i < ls.length) {
                //send async
                this.send(
                    ls[i].addrs,
                    ls[i].values
                )
                    .catch((error) => {
                        console.log("EEEE>>>>>>", error)
                        // console.error("===ERROR:"+","+(lines[i].addr)+","+(lines[i].amount)+",NOT MINED",error);
                    })
                i++;
            } else {
                clearInterval(clock);
            }
        }, this.config.timeout);

    }

    async send(_to, _v) {
        try {
            let transferData = this.Contract.methods
                .multiSend(this.config.tokenAddr,_to, _v)
                .encodeABI();

            let _nonce = await this.web3.eth.getTransactionCount(this.senderAccount.address)
            while (_nonce <= this.lastNonce) _nonce++;
            this.lastNonce = _nonce;
            let tx = {
                from: this.senderAccount.address,
                to: this.config.contractAddr,
                // value: null,
                data: transferData,
                gas: 2000000,
                nonce: _nonce
            };
            let esGas = await this.web3.eth.estimateGas(tx)
            tx.gas = esGas;
            let result = await this.web3.eth.accounts.signTransaction(tx, this.senderAccount.privateKey)
            let hash;
            let res = true;

            this.web3.eth
                .sendSignedTransaction(result.rawTransaction)
                .on("transactionHash", h => {
                    hash = h;
                    let log="";
                    for (let i = 0; i < _to.length; i++) {
                        log += "SEND:SUCCESS,"+h+","+ _to[i] + "," + this.web3.utils.fromWei(_v[i],"ether");
                        if(i!=_to.length-1) log+="\n"
                    }
                    console.log(log);
                    this.sendLogger.info(log);
                })
                .on("receipt", rec => {
                    // console.log(rec)
                    if (rec.status == 1) {

                        if (rec.logs.length != 0) {
                            let log=""
                            for (let i = 0; i < _to.length; i++) {
                                 log+= "RECV:SUCCESS," + hash +","+ _to[i] + "," + this.web3.utils.fromWei(_v[i],"ether")+","+rec.gasUsed;
                                if(i!=_to.length-1) log+="\n"
                            }
                            console.log(log);
                            this.recvLogger.info(log);

                        } else {
                            let log =""
                            for (let i = 0; i < _to.length; i++) {
                                  log += "RECV:FAILURE,"+ hash+"," + _to[i] + "," + this.web3.utils.fromWei(_v[i],"ether"),+",NO LOG";
                                if(i!=_to.length-1) log+="\n"
                            }
                            console.log(log);
                            this.recvLogger.info(log);
                            this.errorLogger.error("RECV:FAILURE,NO LOG,"+"\n"+_to)
                        }
                    } else {
                        let log = "";
                        for (let i = 0; i < _to.length; i++) {
                             log+= "RECV:FAILURE," + hash+"," + _to[i] + "," + this.web3.utils.fromWei(_v[i],"ether")+",STATUS 0";
                            if(i!=_to.length-1) log+="\n"
                        }
                        console.log(log);
                        this.recvLogger.info(log);
                        this.errorLogger.error("RECV:FAILURE,"+hash+",STATUS 0\n"+_to)
                    }
                })
                .on("error", (error) => {
                    let log="";
                    for (let i = 0; i < _to.length; i++) {
                        log+="RECV:ERROR," + hash+","+"," + _to[i] + "," + this.web3.utils.fromWei(_v[i],"ether");
                        if(i!=_to.length-1) log+="\n"
                    }
                    console.error(log);
                    this.recvLogger.info(log);
                    this.errorLogger.error("RECV:FAILURE,"+hash+","+error+"\n"+_to)
                    res = false;
                });
            return res;
        } catch (e) {
            let log="";
            for (let i = 0; i < _to.length; i++) {
                log += "SEND:ERROR," + _to[i] + "," + this.web3.utils.fromWei(_v[i],"ether");
                if(i!=_to.length-1) log+="\n"

            }
            console.error(log);
            this.sendLogger.info(log);
            this.errorLogger.error("SEND:ERROR,"+e+"\n"+_to)
            return false;
        }
    }

}

module.exports = Send;