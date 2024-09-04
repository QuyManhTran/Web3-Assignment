/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthState } from "@/stores/auth";
import axios from "axios";

export const request = axios.create({
    baseURL: `${(import.meta as any).env.VITE_SERVER_URL}/api/${
        (import.meta as any).env.VITE_SERVER_API_VERSION
    }`,
    withCredentials: true,
    timeout: 10 * 1000,
});

request.interceptors.request.use(function (config) {
    const token = AuthState.getState().accessToken;
    config.headers.Authorization = "Bearer " + token;
    return config;
});
