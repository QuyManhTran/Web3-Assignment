// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./APR.sol";
import "hardhat/console.sol";
contract ERC721Token is ERC721, Ownable{  
    uint256 private _totalSupply;

    // Mapping
    mapping(address => bool) private _approveForMint;

    //Constructor
    constructor() ERC721("ERC721Token", "ERC721") Ownable(msg.sender) {
        _totalSupply = 0;
    }

    // Modifiers
    modifier isApprovedForMint(){
        require(_approveForMint[msg.sender], "ERC721: Not approved for mint");
        _;
    }

    //Functions

    function approveForMint(address operator) external onlyOwner {
        _approveForMint[operator] = true;
    }

    function mint(address to, uint256 tokenId) public isApprovedForMint(){
        _mint(to, tokenId);
        _totalSupply++;
    }

    function approveForAll(address operator) external {
        setApprovalForAll(operator, true);
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function deposit(address from, uint256 tokenId) external {
        console.log("from: ", from);
        console.log("msg.sender: ", msg.sender);
        address owner = ownerOf(tokenId);
        require(getApproved(tokenId) == msg.sender, "ERC721: Not approved for all");
        transferFrom(owner, from, tokenId);
    }

    function withdraw(address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "ERC721: You are not owner of this token");
        _transfer(msg.sender, to, tokenId);
    }
}