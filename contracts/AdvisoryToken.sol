// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AdvisoryToken is ERC20, Ownable {
    using SafeMath for uint256;
    uint256 public lastClaimedAt;
    constructor() ERC20("AdvisoryToken", "ADT") {
        _mint(msg.sender, 100000 * 10 ** decimals());
        lastClaimedAt = block.timestamp;
    }

    function mint() public onlyOwner {
        uint256 hoursPassed = block.timestamp.sub(lastClaimedAt).div(3600);
        _mint(msg.sender, hoursPassed * 10 ** decimals());
        lastClaimedAt = block.timestamp;
    }
}