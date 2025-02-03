import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TouchableOpacity } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";

export default function HomeScreen() {
    const bleManager = new BleManager();
    const [devices, setDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

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

    // 블루투스 장치 연결
    const connectToDevice = async (device: Device) => {
        try {
            const connected = await bleManager.connectToDevice(device.id);
            setConnectedDevice(connected);
            console.log("Connected to:", connected.name);
        } catch (error) {
            console.error("Connection Error:", error);
        }
    };
    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>블루투스 장치 검색</Text>

            <Button title="스캔 시작" onPress={scanDevices} />

            {connectedDevice ? (
                <Text style={{ marginTop: 10, fontSize: 16 }}>✅ 연결됨: {connectedDevice.name}</Text>
            ) : (
                <Text style={{ marginTop: 10, fontSize: 16 }}>❌ 연결된 장치 없음</Text>
            )}

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
    );
}
