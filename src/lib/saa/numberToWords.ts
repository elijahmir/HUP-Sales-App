// Convert number to words (Australian English)
export function numberToWords(num: number): string {
  if (num === 0) return "zero";

  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const scales = ["", "thousand", "million", "billion"];

  function convertChunk(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return tens[ten] + (one > 0 ? "-" + ones[one] : "");
    }
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (
      ones[hundred] +
      " hundred" +
      (rest > 0 ? " and " + convertChunk(rest) : "")
    );
  }

  // Split into groups of three digits
  const groups: number[] = [];
  let tempNum = Math.floor(num);
  while (tempNum > 0) {
    groups.push(tempNum % 1000);
    tempNum = Math.floor(tempNum / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      const chunk = convertChunk(groups[i]);
      const scale = scales[i];
      parts.push(chunk + (scale ? " " + scale : ""));
    }
  }

  return parts.join(", ").trim();
}

// Convert dollar amount to words
export function dollarAmountToWords(
  amount: string | number,
  includeCurrency: boolean = false,
): string {
  // Parse the amount (could be string like "100,000" or number)
  const cleaned =
    typeof amount === "string"
      ? amount.replace(/[,$]/g, "")
      : amount.toString();

  const numValue = parseFloat(cleaned);

  if (isNaN(numValue)) return "";

  const dollars = Math.floor(numValue);
  const cents = Math.round((numValue - dollars) * 100);

  let result = numberToWords(dollars);

  if (cents > 0) {
    result += " and " + numberToWords(cents) + " cents";
  }

  if (includeCurrency) {
    result += " dollars";
  }

  return result;
}

// Calculate commission value based on type
export function calculateCommissionValue(
  commissionType: "fixed" | "percentage" | "reit",
  commissionValue: string,
  listingPrice: string,
): number | null {
  if (commissionType === "reit") return null;

  if (commissionType === "fixed") {
    const cleaned = commissionValue.replace(/[,$]/g, "");
    return parseFloat(cleaned) || 0;
  }

  // Percentage calculation
  const price = parseFloat(listingPrice.replace(/[,$]/g, "")) || 0;
  const percentage = parseFloat(commissionValue) || 0;
  return (price * percentage) / 100;
}
