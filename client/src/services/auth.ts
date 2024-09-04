import { request } from "@/configs/axios";
import {
    AuthLoginResponse,
    AuthRegisterResponse,
    AuthVerifyResponse,
} from "@/types/base";

export const login = async (publicAddress: string) => {
    return request.get<AuthLoginResponse>(`/auth/login`, {
        params: {
            publicAddress,
        },
    });
};

export const register = async (publicAddress: string) => {
    return request.post<AuthRegisterResponse>(`/auth/register`, {
        publicAddress,
    });
};

export const verify = async (signature: string, publicAddress: string) => {
    return request.post<AuthVerifyResponse>(`/auth/verify`, {
        signature,
        publicAddress,
    });
};

export const refresh = async () => {
    return request.post<AuthVerifyResponse>(`/auth/refresh`);
};
