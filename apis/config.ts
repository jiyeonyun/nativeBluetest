import axios, { AxiosError, AxiosHeaders, AxiosResponse, HttpStatusCode } from "axios";
import { Result } from "@/types/responseType";
import { HOST_URL } from "./url";
import apis from "./index";
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
        const resultCode = error.response.data.resultCode;
        switch (error.response.status) {
            case 400:
                const errorMessage = resultCode
                    ? error.response?.data.resultMessage
                    : error.response?.data.resultMessage;
                errorResult.resultMessage = errorMessage || "Unknown error";
                break;
            case 403:
                const accessToken = sessionStorage.getItem("TOKEN");
                const refreshToken = sessionStorage.getItem("REFRESHTOKEN");
                return await apis.Auth.refreshToken({ accessToken: accessToken, refreshToken: refreshToken })
                    .then(async (res) => {
                        if (res?.status == "SUCCESS") {
                            sessionStorage.setItem("TOKEN", res.resultData);
                            hostInstance.defaults.headers.common["X-AUTH-TOKEN"] = res.resultData;
                            const requestHeader = originalRequest?.headers as AxiosHeaders;
                            requestHeader.set("X-AUTH-TOKEN", accessToken);
                        } else {
                            // Token이 비정상 적일 경우 Login 화면으로
                            sessionStorage.clear();
                            // window.location.href = "/login?session=expire"
                            return Promise.resolve(errorResult);
                        }
                    })
                    .catch(() => {
                        // Token 재발급 API 실패 시 Login 화면으로
                        sessionStorage.clear();
                        window.location.href = "/login?session=expire";
                    });
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
        const errorMessage = error.message;
        errorResult.resultMessage = errorMessage;
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

hostInstance.interceptors.request.use((config) => {
    config.headers = Object.assign({}, config.headers, { "X-AUTH-TOKEN": sessionStorage.getItem("TOKEN") });
    return config;
});
stationInstance.interceptors.request.use((config) => {
    config.headers = Object.assign({}, config.headers, { "X-AUTH-TOKEN": sessionStorage.getItem("TOKEN") });
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
