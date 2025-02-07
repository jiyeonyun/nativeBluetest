import axios, { AxiosError, AxiosHeaders } from "axios";
import { Result } from "@/types/responseType";
import { HOST_URL } from "./url";
import apis from "@/apis";
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage import

type ErrorMessages = {
    [key: string]: string; // 모든 키는 string이고, 값도 string입니다.
};

const success = function (response: { data: any }) {
    // TODO CHECK :: BASE API 에 맞게 Response Data 및 Error 설정
    return response.data;
};

interface TokenRefreshResponse {
    access_token: string;
}

const fail = async (error: AxiosError<Result<any>>) => {
    const originalRequest = error.config;
    const errorResult: Result<null> = {
        resultCode: "",
        resultData: null,
        resultMessage: "Access Denied",
        status: "FAIL",
    };

    if (error.response) {
        const resultCode = error.response?.data?.resultCode;
        switch (error.response?.status) {
            case 400:
                const errorMessage = resultCode ? error.response?.data?.resultMessage : "Unknown error";
                errorResult.resultMessage = errorMessage;
                break;
            case 403:
                // 토큰 갱신 로직
                const accessToken = await AsyncStorage.getItem("TOKEN");
                const refreshToken = await AsyncStorage.getItem("REFRESHTOKEN");
                if (accessToken && refreshToken && originalRequest) {
                    try {
                        const res = await apis.Auth.refreshToken({ accessToken, refreshToken });
                        if (res?.status === "SUCCESS") {
                            await AsyncStorage.setItem("TOKEN", res.resultData);
                            hostInstance.defaults.headers.common["X-AUTH-TOKEN"] = res.resultData;
                            originalRequest.headers["X-AUTH-TOKEN"] = res.resultData;
                            return axios(originalRequest); // 재요청
                        } else {
                            await AsyncStorage.clear();
                            return Promise.resolve(errorResult);
                        }
                    } catch (e) {
                        await AsyncStorage.clear();
                        return Promise.resolve(errorResult);
                    }
                }
                break;
            case 404:
                errorResult.resultMessage = "관리자에게 문의바랍니다.";
                break;
            case 500:
                errorResult.resultMessage = "서버 오류가 발생했습니다.";
                break;
            case 504:
                errorResult.resultMessage = "서버 응답이 없습니다.";
                break;
            default:
                break;
        }
    } else if (error.request) {
        errorResult.resultMessage = error.message;
        return Promise.resolve(errorResult);
    }

    return Promise.resolve(errorResult);
};

const hostInstance = axios.create({
    baseURL: HOST_URL,
});

const stationInstance = axios.create({
    baseURL: HOST_URL,
});

/**
 * 응답 전 처리
 */
hostInstance.interceptors.response.use(success, fail);
stationInstance.interceptors.response.use(success, fail);

/**
 * 요청 전 처리
 * AsyncStorage에서 토큰을 읽어 헤더에 추가합니다.
 */
stationInstance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("TOKEN");
    if (token) {
        config.headers = Object.assign({}, config.headers, { "X-AUTH-TOKEN": token });
    }
    return config;
});

hostInstance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("TOKEN");
    if (token) {
        config.headers = Object.assign({}, config.headers, { "X-AUTH-TOKEN": token });
    }
    return config;
});

axios.defaults.withCredentials = true;

/**
 * 로그아웃 이후 Request Header에 Token 설정
 */
export const axiosClearAuthHeader = () => {
    delete stationInstance.defaults.headers.common["X-AUTH-TOKEN"];
    delete hostInstance.defaults.headers.common["X-AUTH-TOKEN"];
};

/**
 * 인증 이후 Request Header에 Token 설정
 * @param token : JWT TOKEN
 */
export const axiosApplyConfig = (token: string) => {
    if (!token) throw "Token is required";
    hostInstance.defaults.headers.common["X-AUTH-TOKEN"] = token;
    stationInstance.defaults.headers.common["X-AUTH-TOKEN"] = token;
};

// TODO CHECK :: STATUS 별 Error 처리
export function handleNetworkError(status: number) {
    switch (status) {
        case 0:
            console.log("네트워크 연결 유실");
            break;
        case 401:
            console.log("401 인증 필요");
            break;
        case 403:
            console.log("403 권한 없음");
            break;
        case 404:
            console.log("404 잘못된 요청.");
            break;
        case 500:
            console.log("500 서버 에러");
            break;
        default: {
            if (status >= 500) {
                console.log("잘못된 요청입니다");
            }
        }
    }
}

export default {
    station: stationInstance,
    host: hostInstance,
};
