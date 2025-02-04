import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useState, useEffect } from "react";

import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const LoginScreen = () => {
    const { login, isLoggedIn } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (isLoggedIn) {
            router.replace("/(tabs)"); // ✅ Root Layout이 마운트된 후 실행
        }
    }, [isLoggedIn]);

    const handleLogin = () => {
        if (username === "test" && password === "1234") {
            login();
        } else {
            alert("로그인 정보가 올바르지 않습니다.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>로그인</Text>
            <TextInput style={styles.input} placeholder="아이디" value={username} onChangeText={setUsername} />
            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button title="로그인" onPress={handleLogin} />
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});
