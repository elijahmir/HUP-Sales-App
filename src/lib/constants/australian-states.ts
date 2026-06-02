/**
 * Australian States and Territories
 * Shared constant used across SAA, Expense Approval, and other modules.
 * TAS is first since this is a Tasmanian real estate agency.
 */
export const AU_STATES = [
  { value: "TAS", label: "Tasmania" },
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "WA", label: "Western Australia" },
  { value: "NT", label: "Northern Territory" },
  { value: "ACT", label: "Australian Capital Territory" },
] as const;

export type AustralianState = (typeof AU_STATES)[number]["value"];
