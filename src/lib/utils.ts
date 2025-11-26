import { formatEther, formatUnits } from 'viem';

// Format ETH amount
export function formatEth(value: bigint | undefined, decimals: number = 4): string {
  if (!value) return '0';
  const formatted = formatEther(value);
  return parseFloat(formatted).toFixed(decimals);
}

// Format USDC amount (6 decimals)
export function formatUsdc(value: bigint | undefined, decimals: number = 2): string {
  if (!value) return '0';
  const formatted = formatUnits(value, 6); // USDC has 6 decimals
  return parseFloat(formatted).toFixed(decimals);
}

// Format timestamp to readable date
export function formatDate(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Check if market has ended
export function hasMarketEnded(endTime: bigint): boolean {
  return Number(endTime) * 1000 < Date.now();
}

// Calculate time remaining
export function getTimeRemaining(endTime: bigint): string {
  const now = Date.now();
  const end = Number(endTime) * 1000;
  const diff = end - now;

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Shorten address
export function shortenAddress(address: string | undefined): string {
  if (!address) return '0x0000...0000';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Get outcome label
export function getOutcomeLabel(outcome: boolean): string {
  return outcome ? 'YES' : 'NO';
}

// Get outcome color
export function getOutcomeColor(outcome: boolean): string {
  return outcome ? 'text-green-600' : 'text-red-600';
}

// Get outcome bg color
export function getOutcomeBgColor(outcome: boolean): string {
  return outcome ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
}
