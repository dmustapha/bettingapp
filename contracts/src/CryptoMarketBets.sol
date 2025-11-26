// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

/**
 * @title CryptoMarketBets
 * @notice Betting on cryptocurrency price movements
 * @dev Uses Chainlink price feeds for accurate pricing
 */

// Chainlink Price Feed Interface
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function decimals() external view returns (uint8);
}

contract CryptoMarketBets {
    // ============ Structs ============

    struct Prediction {
        uint256 id;
        string tokenSymbol;
        address priceFeed;
        uint256 timeframe; // in seconds
        int256 startPrice;
        int256 endPrice;
        uint256 totalUpBets;      // USDC bets
        uint256 totalDownBets;    // USDC bets
        uint256 totalUpBetsEth;   // ETH bets
        uint256 totalDownBetsEth; // ETH bets
        bool resolved;
        bool priceWentUp;
        uint256 startTime;
        uint256 endTime;
    }

    struct CryptoBet {
        uint256 predictionId;
        address bettor;
        bool direction; // true = UP, false = DOWN
        uint256 amount;
        uint256 timestamp;
        bool claimed;
        bool isEth; // true = ETH, false = USDC
    }

    // ============ State Variables ============

    uint256 public predictionCounter;
    uint256 public platformFeePercent = 2; // 2% platform fee
    address public owner;
    bool public paused;
    IERC20 public betToken; // ERC-20 token used for betting (e.g., USDC)

    // Minimum timeframe in seconds
    uint256 public constant MIN_TIMEFRAME = 10;

    mapping(uint256 => Prediction) public predictions;
    mapping(uint256 => mapping(address => CryptoBet[])) public userBets;
    mapping(string => address) public priceFeedsRegistry; // symbol => price feed address

    // ============ Events ============

    event PredictionCreated(
        uint256 indexed predictionId,
        string tokenSymbol,
        uint256 timeframe,
        int256 startPrice,
        uint256 endTime
    );

    event BetPlaced(
        uint256 indexed predictionId,
        address indexed bettor,
        bool direction,
        uint256 amount
    );

    event PredictionResolved(
        uint256 indexed predictionId,
        int256 endPrice,
        bool priceWentUp
    );

    event WinningsClaimed(
        uint256 indexed predictionId,
        address indexed claimer,
        uint256 amount
    );

    event PriceFeedAdded(
        string tokenSymbol,
        address priceFeed
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

    modifier predictionExists(uint256 predictionId) {
        require(predictionId < predictionCounter, "Prediction does not exist");
        _;
    }

    modifier validTimeframe(uint256 timeframe) {
        require(timeframe >= MIN_TIMEFRAME, "Timeframe too short");
        _;
    }

    // ============ Constructor ============

    constructor(address _betToken) {
        require(_betToken != address(0), "Invalid token address");
        owner = msg.sender;
        betToken = IERC20(_betToken);
    }

    // ============ Price Feed Management ============

    /**
     * @notice Add a price feed for a token
     * @param tokenSymbol Token symbol (e.g., "ETH", "BTC")
     * @param priceFeed Chainlink price feed address
     */
    function addPriceFeed(
        string memory tokenSymbol,
        address priceFeed
    ) external onlyOwner {
        require(priceFeed != address(0), "Invalid price feed");
        priceFeedsRegistry[tokenSymbol] = priceFeed;
        emit PriceFeedAdded(tokenSymbol, priceFeed);
    }

    /**
     * @notice Get current price from Chainlink feed
     * @param tokenSymbol Token symbol
     */
    function getCurrentPrice(string memory tokenSymbol) public view returns (int256) {
        address priceFeed = priceFeedsRegistry[tokenSymbol];
        require(priceFeed != address(0), "Price feed not found");

        AggregatorV3Interface feed = AggregatorV3Interface(priceFeed);
        (, int256 price, , , ) = feed.latestRoundData();

        return price;
    }

    // ============ Prediction Creation ============

    /**
     * @notice Create a new prediction market
     * @param tokenSymbol Token to predict (must have registered price feed)
     * @param timeframe Prediction timeframe in seconds
     */
    function createPrediction(
        string memory tokenSymbol,
        uint256 timeframe
    ) external whenNotPaused validTimeframe(timeframe) returns (uint256) {
        require(priceFeedsRegistry[tokenSymbol] != address(0), "Price feed not registered");

        int256 startPrice = getCurrentPrice(tokenSymbol);
        require(startPrice > 0, "Invalid start price");

        uint256 predictionId = predictionCounter;
        uint256 endTime = block.timestamp + timeframe;

        predictions[predictionId] = Prediction({
            id: predictionId,
            tokenSymbol: tokenSymbol,
            priceFeed: priceFeedsRegistry[tokenSymbol],
            timeframe: timeframe,
            startPrice: startPrice,
            endPrice: 0,
            totalUpBets: 0,
            totalDownBets: 0,
            totalUpBetsEth: 0,
            totalDownBetsEth: 0,
            resolved: false,
            priceWentUp: false,
            startTime: block.timestamp,
            endTime: endTime
        });

        predictionCounter++;

        emit PredictionCreated(predictionId, tokenSymbol, timeframe, startPrice, endTime);
        return predictionId;
    }

    // ============ Betting ============

    /**
     * @notice Place a prediction bet
     * @param predictionId The prediction to bet on
     * @param direction true for UP, false for DOWN
     * @param amount Amount of tokens to bet
     */
    function placePrediction(
        uint256 predictionId,
        bool direction,
        uint256 amount
    ) external whenNotPaused predictionExists(predictionId) {
        Prediction storage prediction = predictions[predictionId];

        require(block.timestamp < prediction.endTime, "Prediction closed");
        require(!prediction.resolved, "Prediction already resolved");
        require(amount > 0, "Bet amount must be greater than 0");

        // Transfer tokens from user to contract
        require(
            betToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        // Update prediction totals
        if (direction) {
            prediction.totalUpBets += amount;
        } else {
            prediction.totalDownBets += amount;
        }

        // Record user bet
        userBets[predictionId][msg.sender].push(CryptoBet({
            predictionId: predictionId,
            bettor: msg.sender,
            direction: direction,
            amount: amount,
            timestamp: block.timestamp,
            claimed: false,
            isEth: false
        }));

        emit BetPlaced(predictionId, msg.sender, direction, amount);
    }

    /**
     * @notice Place a prediction bet with ETH
     * @param predictionId The prediction to bet on
     * @param direction true for UP, false for DOWN
     */
    function placePredictionWithEth(
        uint256 predictionId,
        bool direction
    ) external payable whenNotPaused predictionExists(predictionId) {
        Prediction storage prediction = predictions[predictionId];

        require(block.timestamp < prediction.endTime, "Prediction closed");
        require(!prediction.resolved, "Prediction already resolved");
        require(msg.value > 0, "Bet amount must be greater than 0");

        // Update prediction totals for ETH
        if (direction) {
            prediction.totalUpBetsEth += msg.value;
        } else {
            prediction.totalDownBetsEth += msg.value;
        }

        // Record user bet
        userBets[predictionId][msg.sender].push(CryptoBet({
            predictionId: predictionId,
            bettor: msg.sender,
            direction: direction,
            amount: msg.value,
            timestamp: block.timestamp,
            claimed: false,
            isEth: true
        }));

        emit BetPlaced(predictionId, msg.sender, direction, msg.value);
    }

    // ============ Resolution ============

    /**
     * @notice Auto-resolve a prediction market using price feed
     * @param predictionId The prediction to resolve
     */
    function autoResolvePrediction(uint256 predictionId) external predictionExists(predictionId) {
        Prediction storage prediction = predictions[predictionId];

        require(!prediction.resolved, "Already resolved");
        require(block.timestamp >= prediction.endTime, "Prediction not ended yet");

        int256 endPrice = getCurrentPrice(prediction.tokenSymbol);
        require(endPrice > 0, "Invalid end price");

        prediction.endPrice = endPrice;
        prediction.resolved = true;
        prediction.priceWentUp = endPrice > prediction.startPrice;

        emit PredictionResolved(predictionId, endPrice, prediction.priceWentUp);
    }

    // ============ Claiming Winnings ============

    /**
     * @notice Claim winnings from a resolved prediction
     * @param predictionId The prediction to claim from
     */
    function claimWinnings(uint256 predictionId) external predictionExists(predictionId) {
        Prediction storage prediction = predictions[predictionId];
        require(prediction.resolved, "Prediction not resolved");

        CryptoBet[] storage bets = userBets[predictionId][msg.sender];
        require(bets.length > 0, "No bets placed");

        uint256 totalPayoutUsdc = 0;
        uint256 totalPayoutEth = 0;

        for (uint256 i = 0; i < bets.length; i++) {
            if (!bets[i].claimed && bets[i].direction == prediction.priceWentUp) {
                if (bets[i].isEth) {
                    uint256 payout = calculatePayoutEth(predictionId, bets[i].amount, bets[i].direction);
                    totalPayoutEth += payout;
                } else {
                    uint256 payout = calculatePayout(predictionId, bets[i].amount, bets[i].direction);
                    totalPayoutUsdc += payout;
                }
                bets[i].claimed = true;
            }
        }

        require(totalPayoutUsdc > 0 || totalPayoutEth > 0, "No winnings to claim");

        // Transfer USDC winnings
        if (totalPayoutUsdc > 0) {
            require(
                betToken.transfer(msg.sender, totalPayoutUsdc),
                "Token transfer failed"
            );
        }

        // Transfer ETH winnings
        if (totalPayoutEth > 0) {
            (bool success, ) = payable(msg.sender).call{value: totalPayoutEth}("");
            require(success, "ETH transfer failed");
        }

        emit WinningsClaimed(predictionId, msg.sender, totalPayoutUsdc + totalPayoutEth);
    }

    // ============ View Functions ============

    /**
     * @notice Calculate payout for a winning USDC bet
     * @param predictionId The prediction ID
     * @param betAmount The bet amount
     * @param direction The bet direction
     */
    function calculatePayout(
        uint256 predictionId,
        uint256 betAmount,
        bool direction
    ) public view returns (uint256) {
        Prediction storage prediction = predictions[predictionId];

        uint256 totalPool = prediction.totalUpBets + prediction.totalDownBets;
        uint256 winningPool = direction ? prediction.totalUpBets : prediction.totalDownBets;

        if (winningPool == 0) return 0;

        // Calculate payout: (betAmount / winningPool) * totalPool * (100 - fee) / 100
        uint256 poolShare = (betAmount * totalPool) / winningPool;
        uint256 fee = (poolShare * platformFeePercent) / 100;

        return poolShare - fee;
    }

    /**
     * @notice Calculate payout for a winning ETH bet
     * @param predictionId The prediction ID
     * @param betAmount The bet amount
     * @param direction The bet direction
     */
    function calculatePayoutEth(
        uint256 predictionId,
        uint256 betAmount,
        bool direction
    ) public view returns (uint256) {
        Prediction storage prediction = predictions[predictionId];

        uint256 totalPool = prediction.totalUpBetsEth + prediction.totalDownBetsEth;
        uint256 winningPool = direction ? prediction.totalUpBetsEth : prediction.totalDownBetsEth;

        if (winningPool == 0) return 0;

        // Calculate payout: (betAmount / winningPool) * totalPool * (100 - fee) / 100
        uint256 poolShare = (betAmount * totalPool) / winningPool;
        uint256 fee = (poolShare * platformFeePercent) / 100;

        return poolShare - fee;
    }

    /**
     * @notice Get current odds for a prediction
     * @param predictionId The prediction ID
     * @return upOdds Percentage for UP
     * @return downOdds Percentage for DOWN
     */
    function getOdds(uint256 predictionId) external view predictionExists(predictionId) returns (uint256 upOdds, uint256 downOdds) {
        Prediction storage prediction = predictions[predictionId];
        uint256 total = prediction.totalUpBets + prediction.totalDownBets;

        if (total == 0) {
            return (50, 50);
        }

        upOdds = (prediction.totalUpBets * 100) / total;
        downOdds = (prediction.totalDownBets * 100) / total;
    }

    /**
     * @notice Get user bets for a prediction
     * @param predictionId The prediction ID
     * @param user The user address
     */
    function getUserBets(uint256 predictionId, address user) external view returns (CryptoBet[] memory) {
        return userBets[predictionId][user];
    }

    /**
     * @notice Get prediction details
     * @param predictionId The prediction ID
     */
    function getPrediction(uint256 predictionId) external view predictionExists(predictionId) returns (Prediction memory) {
        return predictions[predictionId];
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
