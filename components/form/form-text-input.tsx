import { useTheme } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';

interface FormTextInputProps extends Omit<TextInputProps, 'theme' | 'mode'> {
    leftIcon?: string;
}

export const FormTextInput: React.FC<FormTextInputProps> = ({
    leftIcon,
    style,
    ...props
}) => {
    const theme = useTheme();

    const textInputTheme = {
        ...theme,
        colors: {
            ...theme.colors,
            onSurfaceVariant: theme.colors.onSurfaceDisabled,
        },
    };

    return (
        <TextInput
            mode="outlined"
            autoCapitalize="none"
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.onSurface}
            theme={textInputTheme}
            style={[styles.input, { backgroundColor: theme.colors.surface }, style]}
            left={leftIcon ? <TextInput.Icon icon={leftIcon} color={theme.colors.onSurface} /> : undefined}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        marginBottom: 16,
    },
});