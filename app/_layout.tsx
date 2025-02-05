// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    console.log("✅ RootLayout 마운트됨");

    const colorScheme = useColorScheme();
    const [isAppReady, setIsAppReady] = useState(false);

    // 앱 초기 로딩 후 SplashScreen 숨김
    useEffect(() => {
        const timeout = setTimeout(() => {
            SplashScreen.hideAsync();
            setIsAppReady(true);
        }, 300);
        return () => clearTimeout(timeout);
    }, []);

    if (!isAppReady) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <AuthProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                <RootNavigator />
            </ThemeProvider>
        </AuthProvider>
    );
}

function RootNavigator() {
    const { isLoggedIn } = useAuth();
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    // 인증 상태 체크 (예: 비동기 초기화 등)
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsAuthChecked(true);
            console.log("✅ 인증 상태 확인 완료, isLoggedIn:", isLoggedIn);
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    // 인증 체크가 완료되기 전에는 아무것도 렌더링하지 않음
    if (!isAuthChecked) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // 인증 상태에 따라 보여줄 화면을 분기
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
                // 로그인 된 상태 → (tabs) 영역 (즉, HomeScreen 등)
                <Stack.Screen name="(tabs)" />
            ) : (
                // 로그인 안 된 상태 → 로그인 화면
                <Stack.Screen name="(auths)" />
            )}
        </Stack>
    );
}
