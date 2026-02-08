/**
 * Type definitions for reward settings
 */

export interface SlabRuleUI {
    max: string;
    points: string;
}

export interface Offer {
    reward_points: string;
    reward_name: string;
    reward_description: string;
}

export interface RewardType {
    id: string;
    title: string;
    shortDesc: string;
    icon: string;
    color: string;
}

export const REWARD_TYPES: RewardType[] = [
    {
        id: "default",
        title: "Fixed Points",
        shortDesc: "Same points every visit",
        icon: "star-circle",
        color: "#10B981", // Green
    },
    {
        id: "percentage",
        title: "Percentage",
        shortDesc: "Based on bill amount",
        icon: "percent-circle",
        color: "#F59E0B", // Amber
    },
    {
        id: "slab",
        title: "Tiered",
        shortDesc: "Spend more, earn more",
        icon: "chart-timeline-variant",
        color: "#8B5CF6", // Purple
    },
];
