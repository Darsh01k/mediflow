/**
 * Format numeric value as Indian Rupees (INR) with proper digit grouping.
 * E.g., 100000 -> ₹1,00,000
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatINR = (amount) => {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = Number(amount);
  if (isNaN(num)) return amount;
  
  // Format the number using Indian locale
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);

  return `₹${formatted}`;
};
