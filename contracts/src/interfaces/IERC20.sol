// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20
 * @notice Standard ERC-20 token interface
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}
