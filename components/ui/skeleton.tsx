import { useTheme } from "@/hooks/use-theme-color";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";

export const Skeleton = ({ style }: { style?: ViewStyle }) => {
    const theme = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                { backgroundColor: theme.colors.surfaceVariant },
                style,
                { opacity },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        borderRadius: 8,
    },
});
