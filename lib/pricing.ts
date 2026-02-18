import { GST_PERCENT } from "@/lib/constants";

/**
 * Given subtotal (before GST), return GST amount and total.
 * Used by checkout pricing summary.
 */
export const computeGstFromSubtotal = (
  subtotalBeforeGst: number,
  gstPercent: number = GST_PERCENT,
): { gst: number; total: number } => {
  const gst = Math.round((subtotalBeforeGst * gstPercent) / 100 * 100) / 100;
  const total = Math.round((subtotalBeforeGst + gst) * 100) / 100;

  return { gst, total };
}

/**
 * Given total (including GST), return subtotal and GST amount.
 * Used by order summary card (we only have totalAmount from API).
 */
export const getSubtotalAndGstFromTotal = (
  totalIncludingGst: number,
  gstPercent: number = GST_PERCENT,
): { subtotal: number; gst: number } => {
  const subtotal = Math.round((totalIncludingGst / (1 + gstPercent / 100)) * 100) / 100;
  const gst = Math.round((totalIncludingGst - subtotal) * 100) / 100;

  return { subtotal, gst };
}

export { GST_PERCENT };
