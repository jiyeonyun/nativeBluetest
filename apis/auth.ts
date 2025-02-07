import { Auth, LoginFormData, Result, TokenData } from "@/types/responseType";
import axios from "./config";

// import { getManagerId } from "@common/util";
import { AUTH } from "./url";

export default {
    /**
     * 로그인
     * @param params
     * @returns
     */
    async login(params: LoginFormData): Promise<Result<Auth>> {
        try {
            return await axios.host.post(AUTH.SIGNIN, params);
        } catch (e: any) {
            return e.message;
        }
    },
    /**
     * 토큰 재발급
     * @param params
     * @returns
     */
    async refreshToken(params: TokenData): Promise<Result<string> | any> {
        try {
            return await axios.host.post(AUTH.REFRESH, params);
        } catch (e: any) {
            return e.message;
        }
    },
};
