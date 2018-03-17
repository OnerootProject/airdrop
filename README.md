# AirDrop
this project is created to airdrop RNT tokens to accurate addresses .It contains contract of AirDrop.sol which should be deployed before running the nodejs script "index.js" .

## deploy contract
1. deployed AirDrop.sol to testnet or mainet .
2. the sender should approve the AirDrop contract to send RNT tokens;

## about the config file "config/config.json".
```json
{
    "src":"./resource/output.csv",//the location of the addresses to loaded from
    "node":"http://127.0.0.1:8545",//ethereum node url
    "wallet":{},//the sender's wallet (keystore)
    "timeout":5000,//parallel send interval time
    "contractAddr":"0xC93243dA5ad92eE87626AdEb2F6202C9cA95eF6E",//the airdrop contract
    "contractABI":"./resource/AirDrop.json",//location of the contract abi 
    "tokenAddr":"0x7Da8470794fD52463956D8deeD55eDec9fA6C662",
    "privateKey":true  //use private key to unlock wallet if true
}
```

## run the script
```bash
nodejs index.js ${pwd}
```
> where pwd is the password or privateKey of sender's wallet
> you should config privaeKey:true in the config.json file