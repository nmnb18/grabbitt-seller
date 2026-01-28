import { Colors } from "./theme";

export const ROLE = 'seller';
// Constants for business types and categories
export const BUSINESS_TYPES = [
    { label: 'Retail Store', value: 'retail' },
    { label: 'Restaurant/Cafe', value: 'restaurant' },
    { label: 'Service Business', value: 'service' },
    { label: 'FMCG/Manufacturer', value: 'fmcg' },
    { label: 'Other', value: 'other' },
];

export const CATEGORIES = {
    retail: [
        'Electronics', 'Fashion & Apparel', 'Home & Kitchen', 'Beauty & Personal Care',
        'Sports & Outdoors', 'Books & Stationery', 'Jewelry & Accessories', 'Other Retail'
    ],
    restaurant: [
        'Fine Dining', 'Casual Dining', 'Fast Food', 'Cafe & Bakery',
        'Food Truck', 'Bar & Pub', 'Other Food Service'
    ],
    service: [
        'Salon & Spa', 'Repair Services', 'Professional Services', 'Health & Wellness',
        'Education & Training', 'Other Services'
    ],
    fmcg: [
        'Food & Beverages', 'Personal Care', 'Household Care', 'Healthcare',
        'Other FMCG'
    ],
    other: ['Other']
};

export const QR_CODE_TYPES = [
    { value: 'dynamic', label: 'Dynamic QR', description: 'Expires after use', disabled: true, selected: false },
    { value: 'static', label: 'Static QR', description: 'Once per day per customer', disabled: false, selected: true },
    // { value: 'static_hidden', label: 'Static with Hidden Code', description: 'For product packaging' },
];

export const SUBSCRIPTION_PLANS = {
    free: {
        name: 'General',
        monthlyLimit: 10,
        qrFlexibility: 'single-type',
        changeType: false,
        price: 0,
        billing: 'month',
    },
    pro: {
        name: 'Pro Member',
        monthlyLimit: Infinity,
        qrFlexibility: 'single-type',
        changeType: true,
        price: 299,
        billing: 'month',
    },
    premium: {
        name: 'Premium Member',
        monthlyLimit: Infinity,
        qrFlexibility: 'all-types',
        changeType: true,
        price: 2999,
        billing: 'year',
    },
};

export const PLANS = [
    {
        id: 'free',
        name: 'General',
        price: '₹0 / month',
        color: Colors.light.accent,
        features: [
            'Up to 300 scans per month',
            'Basic analytics (total scans & points issued)',
            'Fraud detection & scan abuse prevention',
            'Basic reward configuration',
            'Email support',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '₹299 / month',
        color: Colors.light.secondary,
        features: [
            'Up to 3,000 scans per month',
            'Advanced analytics dashboard',
            'Fraud detection & scan abuse prevention',
            'Access to daily offers & promotions',
            'Priority support via chat, email & phone',
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '₹2,999 / year',
        color: Colors.light.primary,
        features: [
            'Unlimited scans',
            'Advanced analytics with AI-based insights',
            'Fraud detection & scan abuse prevention',
            'Dedicated account manager',
            'Premium priority support',
        ],
    },
];
