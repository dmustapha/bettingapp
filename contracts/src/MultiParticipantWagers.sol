// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

/**
 * @title MultiParticipantWagers
 * @notice Multi-participant peer-to-peer betting contract with public/private wagering
 * @dev Supports multiple participants with winner-takes-all mechanism
 */

contract MultiParticipantWagers {
    // ============ Structs ============

    struct Wager {
        uint256 id;
        address creator;
        uint256 stakeAmount;
        string claim;
        address resolver;
        bool resolved;
        address winner;
        uint256 createdAt;
        uint256 expiryTime;
        bool isPublic;
        uint8 maxParticipants;
        uint8 currentParticipants;
        address[] participants;
        bool isEth; // true = ETH, false = USDC
    }

    // ============ State Variables ============

    uint256 public wagerCounter;
    uint256 public platformFeePercent = 2; // 2% platform fee
    address public owner;
    bool public paused;
    IERC20 public betToken; // ERC-20 token used for betting (e.g., USDC)

    mapping(uint256 => Wager) public wagers;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(address => uint256) public userWins;
    mapping(address => uint256) public userLosses;

    // ============ Events ============

    event WagerCreated(
        uint256 indexed wagerId,
        address indexed creator,
        string claim,
        uint256 stakeAmount,
        address resolver,
        uint256 expiryTime,
        bool isPublic,
        uint8 maxParticipants
    );

    event ParticipantJoined(
        uint256 indexed wagerId,
        address indexed participant,
        uint8 currentParticipants
    );

    event WagerResolved(
        uint256 indexed wagerId,
        address indexed winner,
        uint256 payout
    );

    event WagerCancelled(
        uint256 indexed wagerId
    );

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier wagerExists(uint256 wagerId) {
        require(wagerId < wagerCounter, "Wager does not exist");
        _;
    }

    // ============ Constructor ============

    constructor(address _betToken) {
        require(_betToken != address(0), "Invalid token address");
        owner = msg.sender;
        betToken = IERC20(_betToken);
    }

    // ============ Wager Creation ============

    /**
     * @notice Create a new multi-participant wager
     * @param claim The claim or argument being wagered on
     * @param resolver Address that will resolve the wager
     * @param expiryTime Unix timestamp when wager expires if not filled
     * @param isPublic Whether the wager is publicly visible
     * @param maxParticipants Maximum number of participants (2-10)
     * @param stakeAmount Amount of tokens to stake
     */
    function createWager(
        string memory claim,
        address resolver,
        uint256 expiryTime,
        bool isPublic,
        uint8 maxParticipants,
        uint256 stakeAmount
    ) external whenNotPaused returns (uint256) {
        require(stakeAmount > 0, "Stake amount must be greater than 0");
        require(bytes(claim).length > 0, "Claim required");
        require(resolver != address(0), "Resolver required");
        require(resolver != msg.sender, "Cannot be own resolver");
        require(expiryTime > block.timestamp, "Expiry time must be in future");
        require(maxParticipants >= 2 && maxParticipants <= 10, "Max participants must be 2-10");

        // Transfer tokens from user to contract
        require(
            betToken.transferFrom(msg.sender, address(this), stakeAmount),
            "Token transfer failed"
        );

        uint256 wagerId = wagerCounter;

        address[] memory initialParticipants = new address[](1);
        initialParticipants[0] = msg.sender;

        wagers[wagerId] = Wager({
            id: wagerId,
            creator: msg.sender,
            stakeAmount: stakeAmount,
            claim: claim,
            resolver: resolver,
            resolved: false,
            winner: address(0),
            createdAt: block.timestamp,
            expiryTime: expiryTime,
            isPublic: isPublic,
            maxParticipants: maxParticipants,
            currentParticipants: 1,
            participants: initialParticipants,
            isEth: false
        });

        hasJoined[wagerId][msg.sender] = true;
        wagerCounter++;

        emit WagerCreated(wagerId, msg.sender, claim, stakeAmount, resolver, expiryTime, isPublic, maxParticipants);
        return wagerId;
    }

    /**
     * @notice Create a new multi-participant wager with ETH
     * @param claim The claim or argument being wagered on
     * @param resolver Address that will resolve the wager
     * @param expiryTime Unix timestamp when wager expires if not filled
     * @param isPublic Whether the wager is publicly visible
     * @param maxParticipants Maximum number of participants (2-10)
     */
    function createWagerWithEth(
        string memory claim,
        address resolver,
        uint256 expiryTime,
        bool isPublic,
        uint8 maxParticipants
    ) external payable whenNotPaused returns (uint256) {
        require(msg.value > 0, "Stake amount must be greater than 0");
        require(bytes(claim).length > 0, "Claim required");
        require(resolver != address(0), "Resolver required");
        require(resolver != msg.sender, "Cannot be own resolver");
        require(expiryTime > block.timestamp, "Expiry time must be in future");
        require(maxParticipants >= 2 && maxParticipants <= 10, "Max participants must be 2-10");

        uint256 wagerId = wagerCounter;

        address[] memory initialParticipants = new address[](1);
        initialParticipants[0] = msg.sender;

        wagers[wagerId] = Wager({
            id: wagerId,
            creator: msg.sender,
            stakeAmount: msg.value,
            claim: claim,
            resolver: resolver,
            resolved: false,
            winner: address(0),
            createdAt: block.timestamp,
            expiryTime: expiryTime,
            isPublic: isPublic,
            maxParticipants: maxParticipants,
            currentParticipants: 1,
            participants: initialParticipants,
            isEth: true
        });

        hasJoined[wagerId][msg.sender] = true;
        wagerCounter++;

        emit WagerCreated(wagerId, msg.sender, claim, msg.value, resolver, expiryTime, isPublic, maxParticipants);
        return wagerId;
    }

    // ============ Joining Wagers ============

    /**
     * @notice Join an existing USDC wager by matching the stake
     * @param wagerId The wager ID to join
     */
    function joinWager(uint256 wagerId) external whenNotPaused wagerExists(wagerId) {
        Wager storage wager = wagers[wagerId];

        require(!wager.resolved, "Wager already resolved");
        require(block.timestamp < wager.expiryTime, "Wager expired");
        require(msg.sender != wager.resolver, "Resolver cannot join");
        require(!hasJoined[wagerId][msg.sender], "Already joined this wager");
        require(wager.currentParticipants < wager.maxParticipants, "Wager is full");
        require(!wager.isEth, "Use joinWagerWithEth for ETH wagers");

        // Transfer tokens from user to contract
        require(
            betToken.transferFrom(msg.sender, address(this), wager.stakeAmount),
            "Token transfer failed"
        );

        wager.participants.push(msg.sender);
        wager.currentParticipants++;
        hasJoined[wagerId][msg.sender] = true;

        emit ParticipantJoined(wagerId, msg.sender, wager.currentParticipants);
    }

    /**
     * @notice Join an existing ETH wager by matching the stake
     * @param wagerId The wager ID to join
     */
    function joinWagerWithEth(uint256 wagerId) external payable whenNotPaused wagerExists(wagerId) {
        Wager storage wager = wagers[wagerId];

        require(!wager.resolved, "Wager already resolved");
        require(block.timestamp < wager.expiryTime, "Wager expired");
        require(msg.sender != wager.resolver, "Resolver cannot join");
        require(!hasJoined[wagerId][msg.sender], "Already joined this wager");
        require(wager.currentParticipants < wager.maxParticipants, "Wager is full");
        require(wager.isEth, "Use joinWager for USDC wagers");
        require(msg.value == wager.stakeAmount, "Must match stake amount");

        wager.participants.push(msg.sender);
        wager.currentParticipants++;
        hasJoined[wagerId][msg.sender] = true;

        emit ParticipantJoined(wagerId, msg.sender, wager.currentParticipants);
    }

    // ============ Wager Resolution ============

    /**
     * @notice Resolve a wager (only resolver can call)
     * @param wagerId The wager ID to resolve
     * @param winner The address of the winner
     */
    function resolveWager(
        uint256 wagerId,
        address winner
    ) external wagerExists(wagerId) {
        Wager storage wager = wagers[wagerId];

        require(!wager.resolved, "Already resolved");
        require(wager.currentParticipants >= 2, "Need at least 2 participants");
        require(msg.sender == wager.resolver || msg.sender == owner, "Not authorized");
        require(hasJoined[wagerId][winner], "Winner must be a participant");

        wager.resolved = true;
        wager.winner = winner;

        // Update win/loss records for all participants
        for (uint256 i = 0; i < wager.participants.length; i++) {
            if (wager.participants[i] == winner) {
                userWins[wager.participants[i]]++;
            } else {
                userLosses[wager.participants[i]]++;
            }
        }

        // Calculate payout (total stake minus platform fee)
        uint256 totalStake = wager.stakeAmount * wager.currentParticipants;
        uint256 fee = (totalStake * platformFeePercent) / 100;
        uint256 payout = totalStake - fee;

        // Transfer winnings to winner
        if (wager.isEth) {
            (bool success, ) = payable(winner).call{value: payout}("");
            require(success, "ETH transfer failed");
        } else {
            require(
                betToken.transfer(winner, payout),
                "Token transfer failed"
            );
        }

        emit WagerResolved(wagerId, winner, payout);
    }

    // ============ Wager Cancellation ============

    /**
     * @notice Cancel a wager after expiry if not enough participants joined
     * @param wagerId The wager ID to cancel
     */
    function cancelWager(uint256 wagerId) external wagerExists(wagerId) {
        Wager storage wager = wagers[wagerId];

        require(!wager.resolved, "Wager already resolved");
        require(block.timestamp >= wager.expiryTime, "Wager not expired yet");
        require(wager.currentParticipants < 2, "Wager has participants");

        // Refund stake to creator
        if (wager.isEth) {
            (bool success, ) = payable(wager.creator).call{value: wager.stakeAmount}("");
            require(success, "ETH transfer failed");
        } else {
            require(
                betToken.transfer(wager.creator, wager.stakeAmount),
                "Token transfer failed"
            );
        }

        wager.resolved = true;
        emit WagerCancelled(wagerId);
    }

    /**
     * @notice Refund all participants if wager expires without minimum participants
     * @param wagerId The wager ID to refund
     */
    function refundWager(uint256 wagerId) external wagerExists(wagerId) {
        Wager storage wager = wagers[wagerId];

        require(!wager.resolved, "Wager already resolved");
        require(block.timestamp >= wager.expiryTime, "Wager not expired yet");
        require(wager.currentParticipants < 2, "Wager has enough participants");

        // Refund all participants
        for (uint256 i = 0; i < wager.participants.length; i++) {
            if (wager.isEth) {
                (bool success, ) = payable(wager.participants[i]).call{value: wager.stakeAmount}("");
                require(success, "ETH transfer failed");
            } else {
                require(
                    betToken.transfer(wager.participants[i], wager.stakeAmount),
                    "Token transfer failed"
                );
            }
        }

        wager.resolved = true;
        emit WagerCancelled(wagerId);
    }

    // ============ View Functions ============

    /**
     * @notice Get wager details
     * @param wagerId The wager ID
     */
    function getWager(uint256 wagerId) external view wagerExists(wagerId) returns (Wager memory) {
        return wagers[wagerId];
    }

    /**
     * @notice Get all participants for a wager
     * @param wagerId The wager ID
     */
    function getParticipants(uint256 wagerId) external view wagerExists(wagerId) returns (address[] memory) {
        return wagers[wagerId].participants;
    }

    /**
     * @notice Check if an address has joined a wager
     * @param wagerId The wager ID
     * @param participant The address to check
     */
    function hasParticipantJoined(uint256 wagerId, address participant) external view wagerExists(wagerId) returns (bool) {
        return hasJoined[wagerId][participant];
    }

    /**
     * @notice Get user's wager statistics
     * @param user The user address
     */
    function getUserStats(address user) external view returns (uint256 wins, uint256 losses) {
        return (userWins[user], userLosses[user]);
    }

    // ============ Admin Functions ============

    /**
     * @notice Update platform fee
     * @param newFeePercent New fee percentage (0-10)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 10, "Fee too high");
        platformFeePercent = newFeePercent;
    }

    /**
     * @notice Pause or unpause the contract
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    /**
     * @notice Withdraw collected USDC fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = betToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(
            betToken.transfer(owner, balance),
            "Token transfer failed"
        );
    }

    /**
     * @notice Withdraw collected ETH fees
     */
    function withdrawEthFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH fees to withdraw");
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "ETH transfer failed");
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
