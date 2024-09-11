// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "hardhat/console.sol";
import "./ERC721Token.sol";
import "./ERC20Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract APR is Ownable {
    ERC721Token private erc721Contract;
    ERC20Token private erc20Contract;

    //Constructor
    constructor(address _erc20Contract, address _erc721Address) Ownable(msg.sender) {
        erc20Contract = ERC20Token(_erc20Contract);
        erc721Contract = ERC721Token(_erc721Address);
    }

    // Structs
    struct UserInfor{
        uint8 bonusAPR;
        uint256 erc20Balance;
        uint256 claimTime;
        uint256 withdrawERC20Time;
        uint256 depositNftCount;
    }

    struct RewardTracking{
        uint256 time;
        uint256 reward;
    }

    // Constants
    uint8 public  DEFAULT_APR = 8;
    uint8 public constant DEFAULT_NFT_APR = 2;
    uint256 public constant SECONDS_IN_YEAR = 31536000;
    uint256 public constant SECONDS_IN_DAY = 86400;
    uint256 public constant SECONDS_IN_HOUR = 3600;
    uint256 public constant SECONDS_IN_MINUTE = 2;
    uint256 public constant INTERVAL_TIME_DEPOSIT_IN_SECONDS = 15 * SECONDS_IN_MINUTE;
    uint256 public constant ERC20_PER_NFT = 10**6;

    // Enums
    enum EventType{
        MINT,
        DEPOSIT_ERC20,
        WITHDRAW_ERC20,
        CLAIM,
        DEPOSIT_NFT,
        WITHDRAW_NFT
    }

    // Mapping
    mapping(address => UserInfor) private _users;
    mapping(uint256 => address) private _depositNfts;
    mapping(address => RewardTracking) private _rewardTrackings;

    // Events
    event MintToken(address indexed from, uint256 indexed amount, uint256 indexed time);
    event Deposit(address indexed from, uint256 indexed amount, uint256 indexed time);
    event Withdraw(address indexed from, uint256  indexed amount,   uint256 indexed time);
    event Claim(address indexed from, uint256 indexed amount, uint256 indexed time);
    event DepositNft(address indexed from, uint256 indexed tokenId, uint256 indexed time);
    event WithdrawNft(address indexed from, uint256 indexed tokenId, uint256 indexed time);

    // Modifiers
    modifier isEnoughToken(address from){
        require(_users[from].erc20Balance > 0, "Address is not enough token");
        _;
    }

    modifier isClaimed(address from){
        require(_users[from].claimTime != 0 && _users[from].claimTime  <= block.timestamp , "APR: Claim interval is not passed");
        _;
    }

    modifier isApprovedWithdraw(address from){
        require(_users[from].withdrawERC20Time != 0 && _users[from].withdrawERC20Time <= block.timestamp, "APR: Withdraw interval is not passed");
        _;
    }

    modifier isApprovedDepositNft(address from){
        require(erc721Contract.balanceOf(from) > 0, "APR: Deposit NFT interval is not passed");
        _;
    }

    modifier isWithdrawNft(address from, uint256 tokenId){
        require(erc721Contract.ownerOf(tokenId) == address(this) && _depositNfts[tokenId] == from, "APR: this contract are not owner of this token");
        _;
    }

    // Functions
    function getAPR(address from) public view returns (uint256) {
        return _users[from].bonusAPR + DEFAULT_APR;
    }

    function setDefaultAPR(uint8 amount) external onlyOwner {
        DEFAULT_APR = amount;
    }

    function _deposit(address from, uint256 amount) private {
         if(_rewardTrackings[from].time == 0){
            _rewardTrackings[from].time = block.timestamp;
        } else {
            uint256 timeDiff = block.timestamp - _rewardTrackings[from].time;
            uint256 reward = (_users[from].erc20Balance * getAPR(from) * timeDiff) / (100 * SECONDS_IN_YEAR);
            _rewardTrackings[from].time = block.timestamp;
            _rewardTrackings[from].reward += reward;
        }
        _users[from].erc20Balance += amount;
        
        if(_users[from].erc20Balance < ((erc721Contract.balanceOf(from) + getDepositNftCount().length) * ERC20_PER_NFT * (10 ** erc20Contract.decimals()))){
           return;
        }
         uint256 leftAmount = _users[from].erc20Balance - ((erc721Contract.balanceOf(from) + getDepositNftCount().length) * ERC20_PER_NFT * (10 ** erc20Contract.decimals()));
        if(leftAmount >= ERC20_PER_NFT * (10 ** erc20Contract.decimals())){
            for(uint256 i = 0; i < leftAmount / (ERC20_PER_NFT * 10 ** erc20Contract.decimals()); i++){
                    erc721Contract.mint(from, erc721Contract.totalSupply()); 
            }    
        }
       
    }

    function deposit(uint256 amount) external {
        address from = msg.sender;
        amount = amount * (10 ** erc20Contract.decimals());
        erc20Contract.transferFrom(from, address(this), amount);
        _deposit(from, amount);
        _users[from].withdrawERC20Time = block.timestamp + INTERVAL_TIME_DEPOSIT_IN_SECONDS;
        _users[from].claimTime = block.timestamp + INTERVAL_TIME_DEPOSIT_IN_SECONDS;
        emit Deposit(from, amount, block.timestamp);
    }

     function _claimReward(address from) private isEnoughToken(from) isClaimed(from) returns (uint256){
        uint256 timeNow = block.timestamp;
        uint256 timeDiff = timeNow - _rewardTrackings[from].time;
        uint256 reward = (_users[from].erc20Balance * getAPR(from) * timeDiff) / (100 * SECONDS_IN_YEAR);
        _rewardTrackings[from].reward += reward;
        _users[from].claimTime = timeNow + INTERVAL_TIME_DEPOSIT_IN_SECONDS;
        return _rewardTrackings[from].reward;
    }

    function claimReward() external {
       uint256 reward =  _claimReward(msg.sender);
        erc20Contract.claimReward(msg.sender, reward);
       _rewardTrackings[msg.sender].reward = 0;
        emit Claim(msg.sender, reward, block.timestamp);
    }

    function _withdraw(address from) private isApprovedWithdraw(from) returns (uint256) {
        uint256 rewardAmount = _claimReward(from);
        erc20Contract.claimReward(msg.sender, rewardAmount);
        erc20Contract.transferToUser(from, _users[from].erc20Balance);
        uint256 totalAmount = _users[from].erc20Balance + rewardAmount;
        _rewardTrackings[msg.sender].reward = 0;
        _users[from].erc20Balance = 0;
        _users[from].withdrawERC20Time = block.timestamp + INTERVAL_TIME_DEPOSIT_IN_SECONDS;
        return totalAmount;
    }

    function withdraw() external {
       uint256 totalAmount = _withdraw(msg.sender);
        emit Withdraw(msg.sender, totalAmount, block.timestamp);
    }

    function depositERC721(uint256 tokenId) external isApprovedDepositNft(msg.sender){
        require(erc721Contract.ownerOf(tokenId) == msg.sender, "APR: You are not owner of this token");
        erc721Contract.deposit(address(this), tokenId);
        _users[msg.sender].bonusAPR += DEFAULT_NFT_APR;
        _users[msg.sender].depositNftCount++;
        _depositNfts[tokenId] = msg.sender;
        emit DepositNft(msg.sender, tokenId, block.timestamp);
    }

    function withdrawERC721(uint256 tokenId) external isWithdrawNft(msg.sender, tokenId) {
        erc721Contract.withdraw(msg.sender, tokenId);
         _users[msg.sender].bonusAPR -= DEFAULT_NFT_APR;
        _users[msg.sender].depositNftCount--;
        delete _depositNfts[tokenId];
        emit WithdrawNft(msg.sender, tokenId, block.timestamp);
    }

    function getDepositNftCount() public view returns (uint256[] memory){
        address from = msg.sender;
        uint256[] memory result = new uint256[](_users[from].depositNftCount);
        uint256 index = 0;
        for(uint256 i = 0; i < erc721Contract.totalSupply(); i++){
            if(_depositNfts[i] == from){
                result[index] = i;
                index++;
            }

            if(index == _users[from].depositNftCount){
                break;
            }
        }
        return result;
    }

    function getErc20Balance() public view returns (uint256){
        return erc20Contract.balanceOf(msg.sender);
    }

    function getDepositedErc20Balance() public view returns (uint256){
        return _users[msg.sender].erc20Balance;
    }

    function getErc721Balance() public view returns (uint256[] memory){
        uint256 erc721Length =  erc721Contract.balanceOf(msg.sender);
        uint256[] memory result = new uint256[](erc721Length);
        uint256 count = 0;
        for(uint256 i = 0; i < erc721Contract.totalSupply(); i++){
            if(erc721Contract.ownerOf(i) == msg.sender){
                result[count] = i;
                count++;
            }
            if(count == erc721Length){
                break;
            }
        }
        return result;
    }

    function getClaimTime() external view returns (uint256){
        return _users[msg.sender].claimTime;
    }

    function getWithdrawTime() external view returns (uint256){
        return _users[msg.sender].withdrawERC20Time;
    }
}

