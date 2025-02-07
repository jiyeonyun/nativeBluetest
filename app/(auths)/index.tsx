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

    useEffect(() => {
        // 세션 만료 확인
        const checkSession = async () => {
            const sessionExpired = await AsyncStorage.getItem("SESSION_EXPIRED");
            if (sessionExpired === "true") {
                Alert.alert("알림", "세션이 만료되었습니다. 다시 로그인 부탁드립니다.");
                await AsyncStorage.removeItem("SESSION_EXPIRED");
            }
        };
        checkSession();
    }, []);

    const handleLogin = async () => {
        if (!account || !password || !otp) {
            Alert.alert("오류", "모든 필드를 입력해주세요.");
            return;
        }

        try {
            const payload = {
                account,
                password,
                userTotp: otp,
            };

            console.log("🚀 보낼 데이터:", payload);

            const response = await apis.Auth.login({ account, password, userTotp: otp });
            console.log("✅ 로그인 응답:", response);
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
                    setFailCount(Number(response.resultMessage)); // 서버에서 반환한 실패 횟수 반영
                    Alert.alert("로그인 실패", `계정 정보가 틀렸습니다. (${failCount}/5)`);
                } else {
                    Alert.alert("오류", response.resultMessage);
                }
            }
        } catch (error) {
            console.log("error: ", error);
            Alert.alert("서버 오류", "로그인 중 문제가 발생했습니다.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>로그인</Text>
            <TextInput
                style={styles.input}
                placeholder="아이디"
                value={account}
                onChangeText={setAccount}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Text style={styles.label}>OTP 인증번호</Text>

            <TextInput
                style={styles.input}
                placeholder="OTP 인증번호"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                // editable={process.env.NODE_ENV !== "development"}
            />
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
    label: { fontSize: 16, marginBottom: 5 },
    devMessage: { color: "gray", fontSize: 12, marginBottom: 10 },
});

export default LoginScreen;
