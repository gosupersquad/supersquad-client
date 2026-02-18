import { GST_PERCENT } from "@/lib/constants";

/**
 * Given subtotal (before GST), return GST amount and total.
 * Used by checkout: we have ticket total, add 5% tax, get final amount.
 *
 * Example: subtotal = 100, gstPercent = 5
 *   → gst = 5, total = 105
 */
export const computeGstFromSubtotal = (
  subtotalBeforeGst: number,
  gstPercent: number = GST_PERCENT,
): { gst: number; total: number } => {
  // Step 1: GST = "gstPercent% of subtotal"
  //         e.g. 5% of 100 = (100 * 5) / 100 = 5
  const gstRaw = (subtotalBeforeGst * gstPercent) / 100;
  const gst = Math.round(gstRaw * 100) / 100; // keep 2 decimal places

  // Step 2: Total = what customer pays = subtotal + tax
  //         e.g. 100 + 5 = 105
  const totalRaw = subtotalBeforeGst + gst;
  const total = Math.round(totalRaw * 100) / 100;

  return { gst, total };
}

/**
 * Given total (including GST), work backwards to get subtotal and GST.
 * Used by order summary: API only gives us total, we show breakdown.
 *
 * Example: total = 105, gstPercent = 5
 *   → subtotal = 100, gst = 5
 *
 * Where does "1 + gstPercent/100" come from?
 *
 * You're right: total = subtotal + (GST on subtotal)
 *                   = subtotal + (subtotal × 5/100)
 *
 * We factor out "subtotal" from both terms:
 *   subtotal + (subtotal × 5/100)  =  subtotal×1 + subtotal×(5/100)
 *                                   =  subtotal × (1 + 5/100)
 *
 * So the "1" is just "subtotal × 1" (the subtotal itself). Same formula,
 * written so we can divide total by (1 + 5/100) to get subtotal back.
 */
export const getSubtotalAndGstFromTotal = (
  totalIncludingGst: number,
  gstPercent: number = GST_PERCENT,
): { subtotal: number; gst: number } => {
  // Step 1: Subtotal = total ÷ (1 + tax rate)
  //         (the "1" is from factoring: subtotal + subtotal×5/100 = subtotal×(1 + 5/100))
  //         e.g. 105 / (1 + 5/100) = 105 / 1.05 = 100
  const divisor = 1 + gstPercent / 100;
  const subtotalRaw = totalIncludingGst / divisor;
  const subtotal = Math.round(subtotalRaw * 100) / 100;

  // Step 2: GST = total - subtotal (whatever is left is the tax)
  //         e.g. 105 - 100 = 5
  const gstRaw = totalIncludingGst - subtotal;
  const gst = Math.round(gstRaw * 100) / 100;

  return { subtotal, gst };
}

export { GST_PERCENT };
