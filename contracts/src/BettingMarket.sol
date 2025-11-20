// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BettingMarket
 * @notice A decentralized prediction market platform on Base chain
 * @dev Allows users to create binary markets and place bets on outcomes
 */
contract BettingMarket {
    // ============ Structs ============

    struct Market {
        uint256 id;
        address creator;
        string description;
        string category;
        uint256 endTime;
        uint256 totalYesBets;
        uint256 totalNoBets;
        uint256 minBet;
        bool resolved;
        bool winningOutcome; // true = YES, false = NO
        uint256 createdAt;
    }

    struct Bet {
        uint256 marketId;
        address bettor;
        bool outcome; // true = YES, false = NO
        uint256 amount;
        uint256 timestamp;
        bool claimed;
    }

    // ============ State Variables ============

    uint256 public marketCounter;
    uint256 public platformFeePercent = 2; // 2% platform fee
    address public owner;
    bool public paused;

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet[])) public userBets;
    mapping(address => uint256) public pendingWithdrawals;

    // ============ Events ============

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string description,
        string category,
        uint256 endTime,
        uint256 minBet
    );

    event BetPlaced(
        uint256 indexed marketId,
        address indexed bettor,
        bool outcome,
        uint256 amount
    );

    event MarketResolved(
        uint256 indexed marketId,
        bool winningOutcome
    );

    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed claimer,
        uint256 amount
    );

    event PlatformFeeUpdated(uint256 newFeePercent);
    event Paused(bool isPaused);

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier marketExists(uint256 marketId) {
        require(marketId < marketCounter, "Market does not exist");
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
    }

    // ============ Market Creation ============

    /**
     * @notice Create a new betting market
     * @param description Description of the market
     * @param category Market category (Sports, Politics, etc.)
     * @param endTime Unix timestamp when betting closes
     * @param minBet Minimum bet amount in wei
     */
    function createMarket(
        string memory description,
        string memory category,
        uint256 endTime,
        uint256 minBet
    ) external whenNotPaused returns (uint256) {
        require(endTime > block.timestamp, "End time must be in future");
        require(minBet > 0, "Min bet must be greater than 0");
        require(bytes(description).length > 0, "Description required");
        require(bytes(category).length > 0, "Category required");

        uint256 marketId = marketCounter;

        markets[marketId] = Market({
            id: marketId,
            creator: msg.sender,
            description: description,
            category: category,
            endTime: endTime,
            totalYesBets: 0,
            totalNoBets: 0,
            minBet: minBet,
            resolved: false,
            winningOutcome: false,
            createdAt: block.timestamp
        });

        marketCounter++;

        emit MarketCreated(marketId, msg.sender, description, category, endTime, minBet);
        return marketId;
    }

    // ============ Betting ============

    /**
     * @notice Place a bet on a market
     * @param marketId The market to bet on
     * @param outcome true for YES, false for NO
     */
    function placeBet(
        uint256 marketId,
        bool outcome
    ) external payable whenNotPaused marketExists(marketId) {
        Market storage market = markets[marketId];

        require(block.timestamp < market.endTime, "Market betting closed");
        require(!market.resolved, "Market already resolved");
        require(msg.value >= market.minBet, "Bet below minimum");

        // Update market totals
        if (outcome) {
            market.totalYesBets += msg.value;
        } else {
            market.totalNoBets += msg.value;
        }

        // Record user bet
        userBets[marketId][msg.sender].push(Bet({
            marketId: marketId,
            bettor: msg.sender,
            outcome: outcome,
            amount: msg.value,
            timestamp: block.timestamp,
            claimed: false
        }));

        emit BetPlaced(marketId, msg.sender, outcome, msg.value);
    }

    // ============ Market Resolution ============

    /**
     * @notice Resolve a market (only creator can resolve for now)
     * @param marketId The market to resolve
     * @param winningOutcome The winning outcome
     */
    function resolveMarket(
        uint256 marketId,
        bool winningOutcome
    ) external marketExists(marketId) {
        Market storage market = markets[marketId];

        require(!market.resolved, "Already resolved");
        require(block.timestamp >= market.endTime, "Market not ended yet");
        require(msg.sender == market.creator || msg.sender == owner, "Not authorized");

        market.resolved = true;
        market.winningOutcome = winningOutcome;

        emit MarketResolved(marketId, winningOutcome);
    }

    // ============ Claiming Winnings ============

    /**
     * @notice Claim winnings from a resolved market
     * @param marketId The market to claim from
     */
    function claimWinnings(uint256 marketId) external marketExists(marketId) {
        Market storage market = markets[marketId];
        require(market.resolved, "Market not resolved");

        Bet[] storage bets = userBets[marketId][msg.sender];
        require(bets.length > 0, "No bets placed");

        uint256 totalPayout = 0;

        for (uint256 i = 0; i < bets.length; i++) {
            if (!bets[i].claimed && bets[i].outcome == market.winningOutcome) {
                uint256 payout = calculatePayout(marketId, bets[i].amount, bets[i].outcome);
                totalPayout += payout;
                bets[i].claimed = true;
            }
        }

        require(totalPayout > 0, "No winnings to claim");

        // Transfer winnings
        (bool success, ) = msg.sender.call{value: totalPayout}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(marketId, msg.sender, totalPayout);
    }

    // ============ View Functions ============

    /**
     * @notice Calculate payout for a winning bet
     * @param marketId The market ID
     * @param betAmount The bet amount
     * @param outcome The bet outcome
     */
    function calculatePayout(
        uint256 marketId,
        uint256 betAmount,
        bool outcome
    ) public view returns (uint256) {
        Market storage market = markets[marketId];

        uint256 totalPool = market.totalYesBets + market.totalNoBets;
        uint256 winningPool = outcome ? market.totalYesBets : market.totalNoBets;

        if (winningPool == 0) return 0;

        // Calculate payout: (betAmount / winningPool) * totalPool * (100 - fee) / 100
        uint256 poolShare = (betAmount * totalPool) / winningPool;
        uint256 fee = (poolShare * platformFeePercent) / 100;

        return poolShare - fee;
    }

    /**
     * @notice Get odds for a market outcome
     * @param marketId The market ID
     * @return yesOdds Odds for YES (in percentage, 0-100)
     * @return noOdds Odds for NO (in percentage, 0-100)
     */
    function getOdds(uint256 marketId) external view marketExists(marketId) returns (uint256 yesOdds, uint256 noOdds) {
        Market storage market = markets[marketId];
        uint256 total = market.totalYesBets + market.totalNoBets;

        if (total == 0) {
            return (50, 50);
        }

        yesOdds = (market.totalYesBets * 100) / total;
        noOdds = (market.totalNoBets * 100) / total;
    }

    /**
     * @notice Get user bets for a market
     * @param marketId The market ID
     * @param user The user address
     */
    function getUserBets(uint256 marketId, address user) external view returns (Bet[] memory) {
        return userBets[marketId][user];
    }

    /**
     * @notice Get market details
     * @param marketId The market ID
     */
    function getMarket(uint256 marketId) external view marketExists(marketId) returns (Market memory) {
        return markets[marketId];
    }

    // ============ Admin Functions ============

    /**
     * @notice Update platform fee
     * @param newFeePercent New fee percentage (0-10)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 10, "Fee too high");
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }

    /**
     * @notice Pause or unpause the contract
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    /**
     * @notice Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
