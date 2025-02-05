import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function HomeScreen() {
    const bleManager = new BleManager();
    const [devices, setDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [services, setServices] = useState<any[]>([]); // 서비스 데이터를 저장할 상태 추가
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout(); // 로그아웃 처리
        router.replace("/(auths)"); // 로그인 화면으로 이동
    };
    useEffect(() => {
        requestPermissions();
    }, []);

    // 블루투스 권한 요청 (Android)
    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
        }
    };

    // 블루투스 장치 검색
    const scanDevices = () => {
        setDevices([]);
        bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error("Scan Error:", error);
                return;
            }

            if (device && device.name) {
                setDevices((prevDevices) => {
                    if (!prevDevices.find((d) => d.id === device.id)) {
                        return [...prevDevices, device];
                    }
                    return prevDevices;
                });
            }
        });

        // 10초 후 스캔 중지
        setTimeout(() => {
            bleManager.stopDeviceScan();
        }, 10000);
    };

    // 블루투스 장치 연결 및 배터리 레벨 가져오기
    const connectToDevice = async (device: Device) => {
        try {
            const connected = await bleManager.connectToDevice(device.id);
            setConnectedDevice(connected);
            console.log("Connected to:", connected.name);

            // 서비스 및 특성 탐색
            await connected.discoverAllServicesAndCharacteristics();

            // 장치에서 제공하는 서비스와 특성 출력
            const fetchedServices = await connected.services();
            setServices(fetchedServices); // 서비스 데이터를 상태에 저장

            // 배터리 서비스 찾기
            const batteryService = fetchedServices.find(
                (service) => service.uuid === "0000180F-0000-1000-8000-00805f9b34fb"
            );
            if (!batteryService) {
                console.error("Battery service not found.");
            } else {
                const characteristics = await batteryService.characteristics();
                console.log("Battery Service Characteristics:", characteristics);
            }
        } catch (error) {
            console.error("Connection Error:", error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 20 }}>
                <Button title="로그아웃" onPress={handleLogout} />
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>블루투스 장치 검색</Text>

                <Button title="스캔 시작" onPress={scanDevices} />

                {connectedDevice ? (
                    <Text style={{ marginTop: 10, fontSize: 16 }}>✅ 연결됨: {connectedDevice.name}</Text>
                ) : (
                    <Text style={{ marginTop: 10, fontSize: 16 }}>❌ 연결된 장치 없음</Text>
                )}

                {batteryLevel !== null && (
                    <Text style={{ marginTop: 10, fontSize: 16 }}>배터리 잔량: {batteryLevel}%</Text>
                )}

                {/* 서비스 리스트를 FlatList로 표시 */}
                <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "bold" }}>서비스 목록</Text>
                <FlatList
                    data={services}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}>
                            <Text>서비스 UUID: {item.uuid}</Text>
                            {/* 각 서비스의 특성 출력 */}
                            {item.characteristics && item.characteristics.length > 0 && (
                                <View style={{ marginTop: 10 }}>
                                    <Text>특성:</Text>
                                    <FlatList
                                        data={item.characteristics}
                                        keyExtractor={(char) => char.id.toString()}
                                        renderItem={({ item: char }) => (
                                            <Text>
                                                - 특성 UUID: {char.uuid} {char.isReadable ? "(읽기 가능)" : ""}
                                            </Text>
                                        )}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                />

                {/* 장치 목록 */}
                <FlatList
                    data={devices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => connectToDevice(item)}
                            style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: "#ccc",
                            }}
                        >
                            <Text>
                                {item.name} ({item.id})
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
