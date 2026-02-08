// You can test utils by creating a test file
// Create: lib/test-utils.ts
import { formatCurrency, formatNumber } from './utils';

console.log(formatCurrency(1234.56));  // Should output: $1,234.56
console.log(formatNumber(1500000));     // Should output: 1.5M