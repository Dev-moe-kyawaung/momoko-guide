import type { RailOperator } from '../types';

/**
 * Fare matrices — snapshot of the Nov-2025 operator fare matrices used by the
 * app's fare calculator (verify against bts.co.th / mrtbangkok.com / srtet.co.th):
 *   BTS  : ฿17 → ฿65 (distance based, Rabbit card tap in/out)
 *   MRT  : ฿15 → ฿45 (Blue/Yellow/Pink), Purple ฿14 → ฿42
 *   ARL  : ฿15 → ฿45 (Phaya Thai ↔ Suvarnabhumi = ฿45)
 *   BMTA : ฿8 ordinary / ฿15 air-con flat / A1 airport express ฿50
 *   CExpress: ฿16–32 (flag-flier modelled at ฿19)
 */

export function railFare(operator: RailOperator, km: number): number {
  if (operator === 'BTS') return Math.min(65, Math.round(17 + km * 1.12));
  if (operator === 'ARL') {
    if (km <= 10) return 15;
    if (km <= 20) return 25;
    if (km <= 26) return 35;
    return 45;
  }
  return Math.min(45, Math.round(15 + km * 1.02));
}

export function busFare(kind: 'bus' | 'boat' | 'express', base: number): number {
  if (kind === 'express') return 50;
  return base;
}

/** Daily cap model used by EMV contactless settlement (config per operator). */
export const DAILY_CAP_THB = 65;

export const PAYMENT_NOTE = {
  en: 'Pay with Rabbit Card, EMV contactless or cash (bus only). Daily cap applies on EMV.',
  th: 'ชำระด้วยบัตรแรบบิท EMV คอนแทคเลส หรือเงินสด (รถเมล์) — มีเพดานรายวันสำหรับ EMV',
  my: 'ရယ်ဘစ်ကတ်၊ EMV သို့မဟုတ် ငွေသား (ဘတ်စ်) ဖြင့် ပေးချေနိုင်သည်။ EMV အတွက် နေ့စဉ်ကန့်သတ်ချက် ရှိသည်။',
};
