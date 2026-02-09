import { LoadingOverlay } from "@/components/common/loading-overlay";
import { AppHeader } from "@/components/shared/app-header";
import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { View } from "react-native";

interface LoadingStateProps {
    visible: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ visible }) => {
    const theme = useTheme();

    if (!visible) return null;

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader />
            <LoadingOverlay visible={visible} message="Loading offers..." />
        </View>
    );
};
