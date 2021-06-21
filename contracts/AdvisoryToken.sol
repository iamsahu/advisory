// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AdvisoryToken is ERC20, Ownable {
    using SafeMath for uint256;
    uint256 public lastClaimedAt;

    mapping(address=>uint256) stakeMapping;

    constructor() ERC20("AdvisoryToken", "ADT") {
        _mint(msg.sender, 100000 * 10 ** decimals());
        lastClaimedAt = block.timestamp;
    }

    function mint() public onlyOwner {
        uint256 hoursPassed = block.timestamp.sub(lastClaimedAt).div(3600);
        _mint(msg.sender, hoursPassed * 10 ** decimals());
        lastClaimedAt = block.timestamp;
    }

    function stake() public payable {
        _mint(msg.sender,msg.value/1000);
        stakeMapping[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external{
        require(stakeMapping[msg.sender]*1000>=amount,"You don't own that much token");
        (bool sent, bytes memory data) = msg.sender.call{value: amount*1000}("");
        require(sent, "Failed to send Ether");
        stakeMapping[msg.sender] -= amount*1000;

        //Burning
        _burn(msg.sender,amount);
    }

    
}