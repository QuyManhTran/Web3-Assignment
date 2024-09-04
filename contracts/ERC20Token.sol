// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./APR.sol";
// import "./ERC721Token.sol";

contract ERC20Token is ERC20, Ownable {
    // Mapping
    mapping(address => uint256) private _reward;
    mapping(address => bool) private _approveForTransfer;

    // Constructor
    constructor(uint256 total) ERC20("ERC20Token", "ERC20") Ownable(msg.sender) {
        _mint(msg.sender, total * 10 ** decimals());
        approve(address(this), (total) * 10 ** decimals());
    }

    // Modifiers
    modifier isEnoughToken(uint256 amount) {
        require(amount * 10 ** decimals() <= allowance(owner(), address(this)) , "ERC20: Not enough token");
        _;
    }

    modifier onlyApprovedForTransfer(address from) {
        require(_approveForTransfer[from], "ERC20: Not approved for transfer");
        _;
    }

    // Functions

    function faucet(uint256 amount) external isEnoughToken(amount) {
        amount = amount * 10 ** decimals();
        this.transferFrom(owner(), msg.sender, amount);
    }

    function approveForTransfer(address operator) external onlyOwner {
        _approveForTransfer[operator] = true;
    }

    function transferToUser(address to, uint256 amount) external onlyApprovedForTransfer(msg.sender) {
        _transfer(msg.sender, to, amount);
    }

    function _claimReward(address to, uint256 amount) internal {
       this.transferFrom(owner(), to, amount);
    }

    function claimReward(address to, uint256 amount) external onlyApprovedForTransfer(msg.sender){
      _claimReward(to, amount);
    }
}
