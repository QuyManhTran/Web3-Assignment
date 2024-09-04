// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "hardhat/console.sol";
import "./ERC721Token.sol";
import "./ERC20Token.sol";
contract APR {
    ERC721Token private erc721Contract;
    ERC20Token private erc20Contract;

    //Constructor
    constructor(address _erc20Contract, address _erc721Address) {
        erc20Contract = ERC20Token(_erc20Contract);
        erc721Contract = ERC721Token(_erc721Address);
    }

    // Structs
    struct UserInfor{
        uint8 apr;
        uint256 erc20Balance;
        uint256 lastDepositTime;
        uint256 lastClaimTime;
        uint256 lastWithdrawTime;
        uint256 lastDepositNftTime;
        uint256 depositNftCount;
    }

    struct MintInfor{
        address from;
        uint256 amount;
        uint256 time;
    }

    struct DepositERC20Infor{
        address from;
        uint256 amount;
        uint256 time;
    }

    struct DepositNftInfor{
        address from;
        uint256 tokenId;
        uint256 time;
    }

    struct WithdrawERC20Infor{
        address from;
        uint256 amount;
        uint256 reward;
        uint256 time;
    }

    struct WithdrawNftInfor{
        address from;
        uint256 tokenId;
        uint256 time;
    }

    struct ClaimInfor{
        address from;
        uint256 reward;
        uint256 time;
    }
    
    struct RewardTracking{
        uint256 time;
        uint256 reward;
    }

    // Constants
    uint8 public constant DEFAULT_APR = 8;
    uint8 public constant DEFAULT_NFT_APR = 2;
    uint256 public constant SECONDS_IN_YEAR = 31536000;
    uint256 public constant SECONDS_IN_DAY = 86400;
    uint256 public constant SECONDS_IN_HOUR = 3600;
    uint256 public constant SECONDS_IN_MINUTE = 2;
    uint256 public constant INTERVEL_TIME_DEPOSIT_IN_SECONDS = 5 * SECONDS_IN_MINUTE;
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
    mapping(address => uint256) private _aprs;
    mapping(address => UserInfor) private _users;
    mapping(uint256 => address) private _depositNfts;
    mapping(uint8 => uint256) private _countEvent;
    mapping(uint256 => MintInfor) private _mintInfors;
    mapping(uint256 => DepositERC20Infor) private _depositERC20Infors;
    mapping(uint256 => DepositNftInfor) private _depositNftInfors;
    mapping(uint256 => WithdrawERC20Infor) private _withdrawERC20Infors;
    mapping(uint256 => WithdrawNftInfor) private _withdrawNftInfors;
    mapping(uint256 => ClaimInfor) private _claimInfors;
    mapping(address => RewardTracking) private _rewardTrackings;

    // Events
    event MintToken(address indexed from, uint256 indexed amount, uint256 indexed time);
    event Deposit(address indexed from, uint256 indexed amount, uint256 indexed time);
    event Withdraw(address indexed from, uint256  indexed amount,   uint256 indexed time);
    event Claim(address indexed from, uint256 indexed amount, uint256 indexed time);
    event DepositNft(address indexed from, uint256 indexed tokenId, uint256 indexed time);
    event WithdrawNft(address indexed from, uint256 indexed tokenId, uint256 indexed time);

    // Modifiers
    modifier isExisted(address from){
        require(getAPR(from) > 0, "Address is not exist in the system");
        _;
    }

    modifier isApprovedDeposit(address from){
        require(_users[from].lastDepositTime == 0 || _users[from].lastDepositTime + INTERVEL_TIME_DEPOSIT_IN_SECONDS < block.timestamp, "APR: Deposit interval is not passed");
        _;
    }

    modifier isClaimed(address from){
        require(_users[from].lastClaimTime == 0 || _users[from].lastClaimTime + INTERVEL_TIME_DEPOSIT_IN_SECONDS < block.timestamp , "APR: Claim interval is not passed");
        _;
    }

    modifier isApprovedWithdraw(address from){
        require(_users[from].lastWithdrawTime == 0 || _users[from].lastWithdrawTime + INTERVEL_TIME_DEPOSIT_IN_SECONDS < block.timestamp, "APR: Withdraw interval is not passed");
        _;
    }

    modifier isApprovedDepositNft(address from){
        require(erc721Contract.balanceOf(from) > 0 && (_users[from].lastDepositNftTime == 0 || _users[from].lastDepositNftTime + INTERVEL_TIME_DEPOSIT_IN_SECONDS < block.timestamp), "APR: Deposit NFT interval is not passed");
        _;
    }

    modifier isWithdrawNft(address from, uint256 tokenId){
        require(erc721Contract.ownerOf(tokenId) == address(this) && _depositNfts[tokenId] == from, "APR: this contract are not owner of this token");
        _;
    }

    // Functions
    function getAPR(address from) public view returns (uint256) {
        return _aprs[from];
    }

    function _deposit(address from, uint256 amount) private isApprovedDeposit(from){
         if(_rewardTrackings[from].time == 0){
            _rewardTrackings[from].time = block.timestamp;
        } else {
            uint256 timeDiff = block.timestamp - _rewardTrackings[from].time;
            uint256 reward = (_users[from].erc20Balance * getAPR(from) * timeDiff) / (100 * SECONDS_IN_YEAR);
            _rewardTrackings[from].time = block.timestamp;
            _rewardTrackings[from].reward += reward;
        }
        _users[from].erc20Balance += amount;
        _users[from].lastDepositTime = block.timestamp;
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
        if(getAPR(from) == 0){
            _aprs[from] = DEFAULT_APR;
        }
        amount = amount * (10 ** erc20Contract.decimals());
        erc20Contract.transferFrom(from, address(this), amount);
        _deposit(from, amount);
        _depositERC20Infors[_countEvent[uint8(EventType.DEPOSIT_ERC20)]] = DepositERC20Infor(from, amount, block.timestamp);
        _countEvent[uint8(EventType.DEPOSIT_ERC20)]++;
        emit Deposit(from, amount, block.timestamp);
    }

     function _claimReward(address from) private isExisted(from) isApprovedDeposit(from) isApprovedWithdraw(from) isClaimed(from) returns (uint256){
        uint256 timeNow = block.timestamp;
        uint256 timeDiff = timeNow - _rewardTrackings[from].time;
        uint256 reward = (_users[from].erc20Balance * getAPR(from) * timeDiff) / (100 * SECONDS_IN_YEAR);
        _rewardTrackings[from].reward += reward;
        _users[from].lastClaimTime = timeNow;
        return _rewardTrackings[from].reward;
    }

    function claimReward() external {
       uint256 reward =  _claimReward(msg.sender);
        erc20Contract.claimReward(msg.sender, reward);
       _rewardTrackings[msg.sender].reward = 0;
         _claimInfors[_countEvent[uint8(EventType.CLAIM)]] = ClaimInfor(msg.sender, reward, block.timestamp);
        _countEvent[uint8(EventType.CLAIM)]++;
        emit Claim(msg.sender, reward, block.timestamp);
    }

    function _withdraw(address from) private returns (uint256){
        uint256 rewardAmount = _claimReward(from);
        erc20Contract.claimReward(msg.sender, rewardAmount);
        erc20Contract.transferToUser(from, _users[from].erc20Balance);
        uint256 totalAmount = _users[from].erc20Balance + rewardAmount;
        _rewardTrackings[msg.sender].reward = 0;
        _users[from].erc20Balance = 0;
        _users[from].lastWithdrawTime = block.timestamp;
        return totalAmount;
    }

    function withdraw() external {
       uint256 totalAmount = _withdraw(msg.sender);
        // _withdrawERC20Infors[_countEvent[uint8(EventType.WITHDRAW_ERC20)]] = WithdrawERC20Infor(msg.sender, totalAmount, rewardAmount, block.timestamp);
        _countEvent[uint8(EventType.WITHDRAW_ERC20)]++;
        emit Withdraw(msg.sender, totalAmount, block.timestamp);
    }

    function depositERC721(uint256 tokenId) external isApprovedDepositNft(msg.sender){
        require(erc721Contract.ownerOf(tokenId) == msg.sender, "APR: You are not owner of this token");
        erc721Contract.deposit(address(this), tokenId);
        _aprs[msg.sender] += DEFAULT_NFT_APR;
        _users[msg.sender].depositNftCount++;
        _depositNfts[tokenId] = msg.sender;
        _depositNftInfors[_countEvent[uint8(EventType.DEPOSIT_NFT)]] = DepositNftInfor(msg.sender, tokenId, block.timestamp);
        _countEvent[uint8(EventType.DEPOSIT_NFT)]++;
        emit DepositNft(msg.sender, tokenId, block.timestamp);
    }

    function withdrawERC721(uint256 tokenId) external isWithdrawNft(msg.sender, tokenId) {
        erc721Contract.withdraw(msg.sender, tokenId);
        _aprs[msg.sender] -= DEFAULT_NFT_APR;
        _users[msg.sender].depositNftCount--;
        delete _depositNfts[tokenId];
        _withdrawNftInfors[_countEvent[uint8(EventType.WITHDRAW_NFT)]] = WithdrawNftInfor(msg.sender, tokenId, block.timestamp);
        _countEvent[uint8(EventType.WITHDRAW_NFT)]++;
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

    // function getReward() public view returns (uint256) {
    //     return erc20Contract.getReward(msg.sender);
    // }

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
}

