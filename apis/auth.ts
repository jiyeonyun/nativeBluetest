import { Result } from "@/types/responseType";
import axios from "./config";

// import { getManagerId } from "@common/util";
import { AUTH } from "./url";

export default {
    /**
     * 로그인
     * @param params
     * @returns
     */
    async login(params: any): Promise<Result<any>> {
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
    async refreshToken(params: any): Promise<Result<string> | any> {
        try {
            return await axios.host.post(AUTH.REFRESH, params);
        } catch (e: any) {
            return e.message;
        }
    },
};
