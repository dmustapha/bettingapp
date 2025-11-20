// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UserProfile
 * @notice Stores user profile data and activity on-chain
 * @dev Allows users to save their progress, preferences, and betting history
 */
contract UserProfile {
    struct Profile {
        string username;
        uint256 totalWagers;
        uint256 totalWon;
        uint256 totalLost;
        uint256 lastActive;
        bool exists;
    }

    // Mapping from user address to their profile
    mapping(address => Profile) public profiles;

    // Events
    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user);
    event WagerRecorded(address indexed user, uint256 amount, bool won);

    /**
     * @notice Create or update user profile
     * @param _username Username to set
     */
    function setProfile(string memory _username) external {
        Profile storage profile = profiles[msg.sender];

        if (!profile.exists) {
            profile.exists = true;
            emit ProfileCreated(msg.sender, _username);
        }

        profile.username = _username;
        profile.lastActive = block.timestamp;

        emit ProfileUpdated(msg.sender);
    }

    /**
     * @notice Record a wager result
     * @param amount Amount wagered
     * @param won Whether the user won
     */
    function recordWager(uint256 amount, bool won) external {
        Profile storage profile = profiles[msg.sender];

        if (!profile.exists) {
            profile.exists = true;
            profile.username = "";
        }

        profile.totalWagers += amount;

        if (won) {
            profile.totalWon += amount;
        } else {
            profile.totalLost += amount;
        }

        profile.lastActive = block.timestamp;

        emit WagerRecorded(msg.sender, amount, won);
    }

    /**
     * @notice Get user profile
     * @param user Address to query
     */
    function getProfile(address user) external view returns (
        string memory username,
        uint256 totalWagers,
        uint256 totalWon,
        uint256 totalLost,
        uint256 lastActive,
        bool exists
    ) {
        Profile memory profile = profiles[user];
        return (
            profile.username,
            profile.totalWagers,
            profile.totalWon,
            profile.totalLost,
            profile.lastActive,
            profile.exists
        );
    }

    /**
     * @notice Check if user has a profile
     * @param user Address to check
     */
    function hasProfile(address user) external view returns (bool) {
        return profiles[user].exists;
    }

    /**
     * @notice Get user's win rate (in basis points, 10000 = 100%)
     * @param user Address to query
     */
    function getWinRate(address user) external view returns (uint256) {
        Profile memory profile = profiles[user];

        if (profile.totalWagers == 0) {
            return 0;
        }

        return (profile.totalWon * 10000) / profile.totalWagers;
    }
}
