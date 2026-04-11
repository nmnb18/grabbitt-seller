import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

interface SkeletonTransitionProps {
    loading?: boolean;
    hasData?: boolean;
}

export default function withSkeletonTransition<SkeletonProps = any>(
    SkeletonComponent: React.ComponentType<SkeletonProps>
) {
    return function <P extends SkeletonTransitionProps>(
        WrappedComponent: React.ComponentType<P>
    ) {
        const Component = function (props: P & SkeletonProps) {
            const { loading = false, hasData = false } = props;
            const theme = useTheme();

            const showSkeleton = loading || !hasData;

            return (
                <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                    {showSkeleton
                        ? <SkeletonComponent {...(props as any)} />
                        : <WrappedComponent {...props} />
                    }
                </View>
            );
        };

        Component.displayName = `withSkeletonTransition(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
        return Component;
    };
}