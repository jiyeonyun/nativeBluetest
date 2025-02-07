import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import apis from "../../apis"; // API 요청 모듈
import React from "react";

const LoginScreen = () => {
    const { login, isLoggedIn } = useAuth();
    const router = useRouter();
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [failCount, setFailCount] = useState(0);
    const [isFail, setIsFail] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            router.replace("/(tabs)");
        }
    }, [isLoggedIn]);

    const handleLogin = async () => {
        if (!account || !password || (!otp && process.env.NODE_ENV !== "development")) {
            Alert.alert("오류", "모든 필드를 입력해주세요.");
            return;
        }

        try {
            const response = await apis.Auth.login({ account, password, userTotp: otp });
            if (response.status === "SUCCESS") {
                const { accessToken, refreshToken, manager, menuList } = response.resultData;

                await AsyncStorage.setItem("TOKEN", accessToken);
                await AsyncStorage.setItem("REFRESH_TOKEN", refreshToken);
                await AsyncStorage.setItem("ACCOUNT", manager.account);
                await AsyncStorage.setItem("MANAGER_ID", manager.managerId.toString());

                login(); // AuthContext에서 로그인 처리
                router.replace("/(tabs)");
            } else {
                if (response.resultCode === "ERROR_002") {
                    setIsFail(true);
                    setFailCount((prev) => prev + 1);
                    Alert.alert("로그인 실패", "계정 정보가 틀렸습니다. 다시 시도해주세요.");
                } else {
                    Alert.alert("오류", response.resultMessage);
                }
            }
        } catch (error) {
            Alert.alert("서버 오류", "로그인 중 문제가 발생했습니다.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>로그인</Text>
            <TextInput style={styles.input} placeholder="아이디" value={account} onChangeText={setAccount} />
            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            {process.env.NODE_ENV !== "development" && (
                <TextInput
                    style={styles.input}
                    placeholder="OTP 인증번호"
                    keyboardType="number-pad"
                    value={otp}
                    onChangeText={setOtp}
                />
            )}
            {isFail && <Text style={styles.errorText}>로그인 실패 {failCount}/5 (5회 실패 시 계정 잠김)</Text>}
            <Button title="로그인" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    input: { width: 250, height: 40, borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 },
    errorText: { color: "red", marginBottom: 10 },
});

export default LoginScreen;
