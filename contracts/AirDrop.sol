pragma solidity ^0.4.18;

contract Token{
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success);
}

contract AirDrop {

    function multiSend(address _t,address[] _to, uint256[] _value)
    returns (bool _success) {
        require(_to.length == _value.length);
        require(_to.length <= 150);
        // loop through to addresses and send value
        for (uint8 i = 0; i < _to.length; i++) {
            assert((Token(_t).transferFrom(msg.sender,_to[i], _value[i])) == true);
        }
        return true;
    }
}