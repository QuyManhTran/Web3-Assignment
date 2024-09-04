import { AuthAccessToken, AuthLogin } from "./auth";
import { EventResponse } from "./event";

export interface BaseResponse<T> {
    result: boolean;
    data?: T;
    message?: string;
}

export type GetEVents = BaseResponse<EventResponse>;
export type AuthLoginResponse = BaseResponse<AuthLogin>;
export type AuthRegisterResponse = BaseResponse<AuthLogin>;
export type AuthVerifyResponse = BaseResponse<AuthAccessToken>;
