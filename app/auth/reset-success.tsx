import { SuccessMessage } from '@/components/common';
import AuthScreenWrapper from '@/components/wrappers/authScreenWrapper';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ResetSuccessScreen() {
    const router = useRouter();

    return (
        <AuthScreenWrapper>
            <SuccessMessage
                title="Password Updated"
                message="Your password has been successfully reset. You can now log in using your new password."
                onAction={() => router.replace('/auth/login')}
                actionLabel="Login Now"
            />
        </AuthScreenWrapper>
    );
}

const styles = StyleSheet.create({});
