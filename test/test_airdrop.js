var Web3 = require("web3");
var web3 = new Web3("http://127.0.0.1:7545");


/**
 * 0xDf7774148a64bf1aECE9B9073c571Dba09514063
 * 0xdBdD2Ecfab08CdBCB211A637882Fd17836cbfeac
 * @type {{from: string, to: string, value: string | }}
 */
let tx = {
    from: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
    to: "0xdBdD2Ecfab08CdBCB211A637882Fd17836cbfeac".toLowerCase(),
    value: web3.utils.toWei("0.01","ether"),
    // data: transferData,
    gas: 2000000,
    // nonce: _nonce
};
web3.eth.accounts.wallet.add("0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3")

web3.eth.sendTransaction(tx)
.on("receipt",console.log)
.on("error",console.error);

console.log(web3.eth.accounts.wallet[0])