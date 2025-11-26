// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

/**
 * @title P2PWagers
 * @notice Peer-to-peer betting contract for personal wagers
 * @dev Allows two users to bet against each other with a designated resolver
 */

contract P2PWagers {
    // ============ Structs ============

    struct Wager {
        uint256 id;
        address userA;
        address userB;
        uint256 stakeAmount;
        string claim;
        address resolver;
        bool resolved;
        address winner;
        uint256 createdAt;
        uint256 expiryTime;
        bool accepted;
        bool isEth; // true = ETH, false = USDC
    }

    // ============ State Variables ============

    uint256 public wagerCounter;
    uint256 public platformFeePercent = 2; // 2% platform fee
    address public owner;
    bool public paused;
    IERC20 public betToken; // ERC-20 token used for betting (e.g., USDC)

    mapping(uint256 => Wager) public wagers;
    mapping(address => uint256) public userWins;
    mapping(address => uint256) public userLosses;

    // ============ Events ============

    event WagerCreated(
        uint256 indexed wagerId,
        address indexed userA,
        string claim,
        uint256 stakeAmount,
        address resolver,
        uint256 expiryTime
    );

    event WagerAccepted(
        uint256 indexed wagerId,
        address indexed userB
    );

    event WagerResolved(
        uint256 indexed wagerId,
        address indexed winner
    );

    event WagerCancelled(
        uint256 indexed wagerId
    );

    event WinningsClaimed(
        uint256 indexed wagerId,
        address indexed winner,
        uint256 amount
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
     * @notice Create a new peer-to-peer wager
     * @param claim The claim or argument being wagered on
     * @param resolver Address that will resolve the wager
     * @param expiryTime Unix timestamp when wager expires if not accepted
     * @param stakeAmount Amount of tokens to stake
     */
    function createWager(
        string memory claim,
        address resolver,
        uint256 expiryTime,
        uint256 stakeAmount
    ) external whenNotPaused returns (uint256) {
        require(stakeAmount > 0, "Stake amount must be greater than 0");
        require(bytes(claim).length > 0, "Claim required");
        require(resolver != address(0), "Resolver required");
        require(resolver != msg.sender, "Cannot be own resolver");
        require(expiryTime > block.timestamp, "Expiry time must be in future");

        // Transfer tokens from user to contract
        require(
            betToken.transferFrom(msg.sender, address(this), stakeAmount),
            "Token transfer failed"
        );

        uint256 wagerId = wagerCounter;

        wagers[wagerId] = Wager({
            id: wagerId,
            userA: msg.sender,
            userB: address(0),
            stakeAmount: stakeAmount,
            claim: claim,
            resolver: resolver,
            resolved: false,
            winner: address(0),
            createdAt: block.timestamp,
            expiryTime: expiryTime,
            accepted: false,
            isEth: false
        });

        wagerCounter++;

        emit WagerCreated(wagerId, msg.sender, claim, stakeAmount, resolver, expiryTime);
        return wagerId;
    }

    /**
     * @notice Create a new peer-to-peer wager with ETH
     * @param claim The claim or argument being wagered on
     * @param resolver Address that will resolve the wager
     * @param expiryTime Unix timestamp when wager expires if not accepted
     */
    function createWagerWithEth(
        string memory claim,
        address resolver,
        uint256 expiryTime
    ) external payable whenNotPaused returns (uint256) {
        require(msg.value > 0, "Stake amount must be greater than 0");
        require(bytes(claim).length > 0, "Claim required");
        require(resolver != address(0), "Resolver required");
        require(resolver != msg.sender, "Cannot be own resolver");
        require(expiryTime > block.timestamp, "Expiry time must be in future");

        uint256 wagerId = wagerCounter;

        wagers[wagerId] = Wager({
            id: wagerId,
            userA: msg.sender,
            userB: address(0),
            stakeAmount: msg.value,
            claim: claim,
            resolver: resolver,
            resolved: false,
            winner: address(0),
            createdAt: block.timestamp,
            expiryTime: expiryTime,
            accepted: false,
            isEth: true
        });

        wagerCounter++;

        emit WagerCreated(wagerId, msg.sender, claim, msg.value, resolver, expiryTime);
        return wagerId;
    }

    // ============ Wager Acceptance ============

    /**
     * @notice Accept an open USDC wager by matching the stake
     * @param wagerId The wager ID to accept
     */
    function acceptWager(uint256 wagerId) external whenNotPaused wagerExists(wagerId) {
        Wager storage wager = wagers[wagerId];

        require(!wager.accepted, "Wager already accepted");
        require(!wager.resolved, "Wager already resolved");
        require(block.timestamp < wager.expiryTime, "Wager expired");
        require(msg.sender != wager.userA, "Cannot accept own wager");
        require(msg.sender != wager.resolver, "Resolver cannot accept");
        require(!wager.isEth, "Use acceptWagerWithEth for ETH wagers");

        // Transfer tokens from user to contract
        require(
            betToken.transferFrom(msg.sender, address(this), wager.stakeAmount),
            "Token transfer failed"
        );

        wager.userB = msg.sender;
        wager.accepted = true;

        emit WagerAccepted(wagerId, msg.sender);
    }

    /**
     * @notice Accept an open ETH wager by matching the stake
     * @param wagerId The wager ID to accept
     */
    function acceptWagerWithEth(uint256 wagerId) external payable whenNotPaused wagerExists(wagerId) {
        Wager storage wager = wagers[wagerId];

        require(!wager.accepted, "Wager already accepted");
        require(!wager.resolved, "Wager already resolved");
        require(block.timestamp < wager.expiryTime, "Wager expired");
        require(msg.sender != wager.userA, "Cannot accept own wager");
        require(msg.sender != wager.resolver, "Resolver cannot accept");
        require(wager.isEth, "Use acceptWager for USDC wagers");
        require(msg.value == wager.stakeAmount, "Must match stake amount");

        wager.userB = msg.sender;
        wager.accepted = true;

        emit WagerAccepted(wagerId, msg.sender);
    }

    // ============ Wager Resolution ============

    /**
     * @notice Resolve a wager (only resolver can call)
     * @param wagerId The wager ID to resolve
     * @param winner The address of the winner (userA or userB)
     */
    function resolveWager(
        uint256 wagerId,
        address winner
    ) external wagerExists(wagerId) {
        Wager storage wager = wagers[wagerId];

        require(!wager.resolved, "Already resolved");
        require(wager.accepted, "Wager not accepted yet");
        require(msg.sender == wager.resolver || msg.sender == owner, "Not authorized");
        require(winner == wager.userA || winner == wager.userB, "Invalid winner");

        wager.resolved = true;
        wager.winner = winner;

        // Update win/loss records
        if (winner == wager.userA) {
            userWins[wager.userA]++;
            userLosses[wager.userB]++;
        } else {
            userWins[wager.userB]++;
            userLosses[wager.userA]++;
        }

        // Calculate payout (total stake minus platform fee)
        uint256 totalStake = wager.stakeAmount * 2;
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

        emit WagerResolved(wagerId, winner);
        emit WinningsClaimed(wagerId, winner, payout);
    }

    // ============ Wager Cancellation ============

    /**
     * @notice Cancel an unaccepted wager after expiry
     * @param wagerId The wager ID to cancel
     */
    function cancelWager(uint256 wagerId) external wagerExists(wagerId) {
        Wager storage wager = wagers[wagerId];

        require(!wager.accepted, "Cannot cancel accepted wager");
        require(!wager.resolved, "Wager already resolved");
        require(block.timestamp >= wager.expiryTime, "Wager not expired yet");
        require(msg.sender == wager.userA, "Only creator can cancel");

        // Refund stake to userA
        if (wager.isEth) {
            (bool success, ) = payable(wager.userA).call{value: wager.stakeAmount}("");
            require(success, "ETH transfer failed");
        } else {
            require(
                betToken.transfer(wager.userA, wager.stakeAmount),
                "Token transfer failed"
            );
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
