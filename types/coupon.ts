export interface Coupon {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
    minAmount?: number;
    maxDiscount?: number;
    validFrom: Date;
    validUntil: Date;
    usageLimit: number;
    usedCount: number;
    applicablePlans: string[]; // Plan IDs
    isActive: boolean;
}

export interface ApplyCouponResponse {
    success: boolean;
    coupon?: Coupon;
    message?: string;
    discountAmount: number;
    finalAmount: number;
}