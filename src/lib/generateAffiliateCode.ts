/**
 * Generates a cryptographically secure affiliate code
 * Format: LM-XXXXXXXX (8 alphanumeric characters)
 */
export const generateAffiliateCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(array[i] % chars.length);
  }
  return `LM-${code}`;
};
