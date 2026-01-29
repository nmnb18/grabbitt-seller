/**
 * Perk Types
 */

export type PerkStatus = "PENDING" | "CLAIMED" | "REDEEMED" | "EXPIRED" | "CANCELLED";

export interface Perk {
  id: string;
  redeem_code: string;
  status: PerkStatus;
  customer_name: string;
  customer_contact: string;
  offer_title: string;
  min_spend: number;
  terms?: string;
  created_at: any;
  redeemed_at?: any;
}

export interface PerkResponse {
  success: boolean;
  perks: Perk[];
}
